#!/bin/bash

# Mermaid to PDF Conversion Script
# Direct PDF Approach (Recommended)
# Converts Markdown files containing Mermaid diagrams into PDF documents

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/pdfs"
TEMP_DIR="${SCRIPT_DIR}/.temp_mermaid"
REPORTS_DIR="${SCRIPT_DIR}/reports"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    local missing_deps=()
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # Check for mermaid-cli
    if ! command -v mmdc &> /dev/null; then
        missing_deps+=("@mermaid-js/mermaid-cli")
    fi
    
    # Check for pandoc
    if ! command -v pandoc &> /dev/null; then
        missing_deps+=("pandoc")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Missing dependencies: ${missing_deps[*]}"
        echo
        echo "To install missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "node"|"npm")
                    echo "  brew install node  # or download from nodejs.org"
                    ;;
                "@mermaid-js/mermaid-cli")
                    echo "  npm install -g @mermaid-js/mermaid-cli"
                    ;;
                "pandoc")
                    echo "  brew install pandoc  # or download from pandoc.org"
                    ;;
            esac
        done
        exit 1
    fi
    
    success "All dependencies are available"
}

# Create necessary directories
setup_directories() {
    log "Setting up directories..."
    mkdir -p "$OUTPUT_DIR"
    mkdir -p "$TEMP_DIR"
    mkdir -p "$REPORTS_DIR"
    success "Directories created"
}

# Clean up temporary files
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        log "Cleaned up temporary files"
    fi
}

# Extract mermaid diagrams from markdown
extract_mermaid_diagrams() {
    local input_file="$1"
    local temp_base="$2"
    
    log "Extracting Mermaid diagrams from $input_file..."
    
    # Use awk to extract mermaid code blocks
    awk '
    /^```mermaid/ { 
        in_mermaid=1; 
        diagram_count++; 
        filename = "'$temp_base'_diagram_" diagram_count ".mmd"
        next 
    }
    /^```/ && in_mermaid { 
        in_mermaid=0; 
        close(filename)
        next 
    }
    in_mermaid { 
        print > filename 
    }
    ' "$input_file"
    
    # Count diagrams found
    local diagram_count=$(find "$TEMP_DIR" -name "${temp_base}_diagram_*.mmd" | wc -l)
    log "Found $diagram_count Mermaid diagram(s)"
    
    return $diagram_count
}

# Convert single mermaid file to PDF
convert_mermaid_to_pdf() {
    local mermaid_file="$1"
    local output_file="$2"
    
    log "Converting $(basename "$mermaid_file") to PDF..."
    
    # Use mermaid-cli to generate PDF directly
    if mmdc -i "$mermaid_file" -o "$output_file" -w 1200 -H 800 -b white 2>/dev/null; then
        success "Generated: $(basename "$output_file")"
        return 0
    else
        error "Failed to convert $(basename "$mermaid_file")"
        return 1
    fi
}

# Convert markdown with mermaid diagrams to PDF
convert_markdown_to_pdf() {
    local input_file="$1"
    local output_file="$2"
    
    if [ ! -f "$input_file" ]; then
        error "Input file not found: $input_file"
        return 1
    fi
    
    local base_name=$(basename "$input_file" .md)
    local temp_base="${TEMP_DIR}/${base_name}"
    
    log "Processing $input_file..."
    
    # Extract mermaid diagrams
    extract_mermaid_diagrams "$input_file" "$temp_base"
    local diagram_count=$?
    
    if [ $diagram_count -eq 0 ]; then
        warning "No Mermaid diagrams found in $input_file"
        # Convert markdown to PDF using pandoc directly
        pandoc "$input_file" -o "$output_file"
        success "Generated PDF (no Mermaid diagrams): $(basename "$output_file")"
        return 0
    fi
    
    # Convert each mermaid diagram to PDF
    local converted_count=0
    for mermaid_file in "$temp_base"_diagram_*.mmd; do
        if [ -f "$mermaid_file" ]; then
            local diagram_pdf="${mermaid_file%.mmd}.pdf"
            if convert_mermaid_to_pdf "$mermaid_file" "$diagram_pdf"; then
                ((converted_count++))
            fi
        fi
    done
    
    # Create a combined PDF with original markdown content and diagrams
    local temp_md="${temp_base}_combined.md"
    
    # Process the original markdown, replacing mermaid blocks with image references
    awk -v temp_base="$temp_base" '
    /^```mermaid/ { 
        in_mermaid=1; 
        diagram_count++; 
        pdf_file = temp_base "_diagram_" diagram_count ".pdf"
        print "![Mermaid Diagram " diagram_count "](" pdf_file ")"
        next 
    }
    /^```/ && in_mermaid { 
        in_mermaid=0; 
        next 
    }
    !in_mermaid { 
        print 
    }
    ' "$input_file" > "$temp_md"
    
    # Use pandoc to convert to PDF
    if pandoc "$temp_md" -o "$output_file" --pdf-engine=xelatex 2>/dev/null; then
        success "Generated combined PDF: $(basename "$output_file")"
    else
        warning "Combined PDF generation failed, creating individual diagram PDFs only"
        # Copy individual diagram PDFs to output directory
        for diagram_pdf in "$temp_base"_diagram_*.pdf; do
            if [ -f "$diagram_pdf" ]; then
                cp "$diagram_pdf" "$OUTPUT_DIR/$(basename "$diagram_pdf")"
            fi
        done
    fi
    
    log "Converted $converted_count/$diagram_count Mermaid diagrams successfully"
    return 0
}

# Generate report
generate_report() {
    local input_file="$1"
    local output_file="$2"
    local success_status="$3"
    
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    local report_file="${REPORTS_DIR}/conversion_report_$(date +'%Y%m%d_%H%M%S').md"
    
    cat > "$report_file" << EOF
# Mermaid to PDF Conversion Report

**Timestamp:** $timestamp

## Input
- **Source File:** $input_file
- **Output File:** $output_file
- **Status:** $([ "$success_status" -eq 0 ] && echo "✅ Success" || echo "❌ Failed")

## System Information
- **Node.js Version:** $(node --version 2>/dev/null || echo "Not available")
- **Mermaid CLI Version:** $(mmdc --version 2>/dev/null || echo "Not available")
- **Pandoc Version:** $(pandoc --version 2>/dev/null | head -1 || echo "Not available")

## Files Generated
EOF

    # List generated files
    if [ -d "$OUTPUT_DIR" ]; then
        for file in "$OUTPUT_DIR"/*.pdf; do
            if [ -f "$file" ]; then
                local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "Unknown")
                echo "- $(basename "$file") (${size} bytes)" >> "$report_file"
            fi
        done
    fi
    
    cat >> "$report_file" << EOF

## Process Details
- **Temporary Directory:** $TEMP_DIR
- **Output Directory:** $OUTPUT_DIR
- **Script Location:** $SCRIPT_DIR

---
*Generated by mermaid-to-pdf.sh*
EOF

    success "Report generated: $report_file"
}

# Main function
main() {
    local input_file="${1:-}"
    local output_file="${2:-}"
    
    # Show usage if no arguments
    if [ -z "$input_file" ]; then
        echo "Usage: $0 <input.md> [output.pdf]"
        echo
        echo "Convert Markdown files containing Mermaid diagrams to PDF"
        echo
        echo "Examples:"
        echo "  $0 diagram.md"
        echo "  $0 diagram.md custom_output.pdf"
        echo
        echo "Features:"
        echo "  - Vector-based PDF output"
        echo "  - Automatic cleanup of temporary files"
        echo "  - Progress feedback"
        echo "  - Comprehensive error handling"
        echo "  - Flexible file naming"
        exit 1
    fi
    
    # Generate output filename if not provided
    if [ -z "$output_file" ]; then
        local base_name=$(basename "$input_file" .md)
        output_file="${OUTPUT_DIR}/${base_name}.pdf"
    fi
    
    # Ensure output is in the correct directory
    if [[ "$output_file" != /* ]]; then
        output_file="${OUTPUT_DIR}/$output_file"
    fi
    
    log "Starting Mermaid to PDF conversion..."
    log "Input: $input_file"
    log "Output: $output_file"
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Run conversion process
    check_dependencies
    setup_directories
    
    if convert_markdown_to_pdf "$input_file" "$output_file"; then
        generate_report "$input_file" "$output_file" 0
        success "Conversion completed successfully!"
        echo
        echo "Output files available in: $OUTPUT_DIR"
        echo "Reports available in: $REPORTS_DIR"
    else
        generate_report "$input_file" "$output_file" 1
        error "Conversion failed!"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"