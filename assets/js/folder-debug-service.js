/**
 * Folder Debug Service
 * Helps diagnose and fix the "parentNotAFolder" 403 error
 */
class FolderDebugService {
    constructor() {
        this.debugMode = true;
    }

    /**
     * Comprehensive folder validation with detailed logging
     */
    async validateFolderWithDetails(folderId, expectedName = null) {
        console.log(`🔍 Validating folder: ${folderId}`);
        
        try {
            // First, try to get the file metadata
            const response = await gapi.client.drive.files.get({
                fileId: folderId,
                fields: 'id, name, mimeType, trashed, parents, capabilities, permissionIds, owners, createdTime, modifiedTime'
            });
            
            const file = response.result;
            
            const validation = {
                exists: true,
                isFolder: file.mimeType === 'application/vnd.google-apps.folder',
                isTrash: file.trashed,
                hasParents: file.parents && file.parents.length > 0,
                canCreateChildren: file.capabilities?.canAddChildren || false,
                canListChildren: file.capabilities?.canListChildren || false,
                name: file.name,
                parents: file.parents,
                owners: file.owners,
                createdTime: file.createdTime,
                modifiedTime: file.modifiedTime
            };
            
            console.log(`📋 Folder validation result for ${folderId}:`, validation);
            
            if (expectedName && file.name !== expectedName) {
                console.warn(`⚠️ Name mismatch: expected "${expectedName}", got "${file.name}"`);
            }
            
            return validation;
            
        } catch (error) {
            console.error(`❌ Failed to validate folder ${folderId}:`, error);
            
            if (error.status === 404) {
                return {
                    exists: false,
                    error: 'Folder not found (404)',
                    details: error
                };
            } else if (error.status === 403) {
                return {
                    exists: true,
                    error: 'Permission denied (403)',
                    details: error
                };
            } else {
                return {
                    exists: false,
                    error: `API error (${error.status})`,
                    details: error
                };
            }
        }
    }

    /**
     * Debug folder hierarchy
     */
    async debugFolderHierarchy(folderId) {
        console.log(`🔗 Debugging folder hierarchy for: ${folderId}`);
        
        const hierarchy = [];
        let currentId = folderId;
        let depth = 0;
        
        while (currentId && currentId !== 'root' && depth < 10) {
            const validation = await this.validateFolderWithDetails(currentId);
            
            if (!validation.exists) {
                console.error(`❌ Broken hierarchy at: ${currentId}`);
                break;
            }
            
            hierarchy.push({
                id: currentId,
                name: validation.name,
                isFolder: validation.isFolder,
                parents: validation.parents
            });
            
            // Move to parent
            if (validation.parents && validation.parents.length > 0) {
                currentId = validation.parents[0];
            } else {
                currentId = null;
            }
            
            depth++;
        }
        
        console.log(`📁 Folder hierarchy:`, hierarchy);
        return hierarchy;
    }

    /**
     * Search for folders more thoroughly
     */
    async thoroughFolderSearch(folderName, parentId = null) {
        console.log(`🔍 Thorough search for folder: "${folderName}" in parent: ${parentId || 'root'}`);
        
        try {
            let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
            
            if (parentId && parentId !== 'root') {
                // Validate parent first
                const parentValidation = await this.validateFolderWithDetails(parentId);
                if (!parentValidation.exists || !parentValidation.isFolder) {
                    console.error(`❌ Parent folder ${parentId} is invalid:`, parentValidation);
                    return null;
                }
                query += ` and '${parentId}' in parents`;
            } else {
                query += ` and 'root' in parents`;
            }
            
            console.log(`🔍 Search query: ${query}`);
            
            const response = await gapi.client.drive.files.list({
                q: query,
                fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, parents, mimeType, capabilities)',
                pageSize: 100
            });
            
            const files = response.result.files || [];
            
            console.log(`📋 Search results:`, files);
            
            // Validate each result
            const validFolders = [];
            for (const file of files) {
                const validation = await this.validateFolderWithDetails(file.id, folderName);
                if (validation.exists && validation.isFolder) {
                    validFolders.push(file);
                } else {
                    console.warn(`⚠️ Invalid search result:`, file.id, validation);
                }
            }
            
            console.log(`✅ Valid folders found: ${validFolders.length}`);
            return validFolders.length > 0 ? validFolders[0] : null;
            
        } catch (error) {
            console.error(`❌ Folder search failed:`, error);
            return null;
        }
    }

    /**
     * Create folder with extensive validation and retry logic
     */
    async createFolderSafely(folderName, parentId = null) {
        console.log(`🏗️ Safely creating folder: "${folderName}" in parent: ${parentId || 'root'}`);
        
        try {
            // Step 1: Validate parent if specified
            if (parentId && parentId !== 'root') {
                console.log(`🔍 Validating parent folder: ${parentId}`);
                const parentValidation = await this.validateFolderWithDetails(parentId);
                
                if (!parentValidation.exists) {
                    throw new Error(`Parent folder ${parentId} does not exist`);
                }
                
                if (!parentValidation.isFolder) {
                    throw new Error(`Parent ${parentId} is not a folder (type: ${parentValidation.mimeType || 'unknown'})`);
                }
                
                if (!parentValidation.canCreateChildren) {
                    throw new Error(`No permission to create children in parent ${parentId}`);
                }
                
                console.log(`✅ Parent folder validated successfully`);
            }
            
            // Step 2: Check if folder already exists
            console.log(`🔍 Checking if folder already exists...`);
            const existingFolder = await this.thoroughFolderSearch(folderName, parentId);
            
            if (existingFolder) {
                console.log(`✅ Found existing folder: ${existingFolder.id}`);
                return existingFolder;
            }
            
            // Step 3: Create the folder
            console.log(`🏗️ Creating new folder...`);
            
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentId ? [parentId] : ['root']
            };
            
            console.log(`📋 Folder metadata:`, folderMetadata);
            
            const response = await gapi.client.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id, name, mimeType, parents, capabilities'
            });
            
            const createdFolder = response.result;
            console.log(`🎉 Folder created:`, createdFolder);
            
            // Step 4: Validate the created folder
            console.log(`🔍 Validating created folder...`);
            const validation = await this.validateFolderWithDetails(createdFolder.id, folderName);
            
            if (!validation.exists || !validation.isFolder) {
                throw new Error(`Created folder validation failed: ${JSON.stringify(validation)}`);
            }
            
            console.log(`✅ Folder creation and validation successful`);
            return createdFolder;
            
        } catch (error) {
            console.error(`❌ Safe folder creation failed:`, error);
            throw error;
        }
    }

    /**
     * Clear cached folder IDs and reset service
     */
    async resetFolderStructure() {
        console.log(`🔄 Resetting folder structure...`);
        
        if (window.annotationDriveService) {
            window.annotationDriveService.projectFolderId = null;
            window.annotationDriveService.jsonFolderId = null;
            window.annotationDriveService.pdfFolderId = null;
            window.annotationDriveService.initialized = false;
        }
        
        // Clear any localStorage cache
        localStorage.removeItem('annotationFolderStructure');
        
        console.log(`✅ Folder structure reset complete`);
    }

    /**
     * Comprehensive folder structure diagnostic
     */
    async diagnoseFolderIssues() {
        console.log(`🔬 Starting comprehensive folder diagnostics...`);
        
        const diagnostics = {
            timestamp: new Date().toISOString(),
            authStatus: null,
            driveApiAccess: null,
            folderStructure: null,
            recommendations: []
        };
        
        try {
            // Check authentication
            console.log(`🔍 Checking authentication...`);
            diagnostics.authStatus = {
                driveServiceReady: window.googleDriveService && window.googleDriveService.isReady(),
                hasRole: window.googleDriveService && window.googleDriveService.hasAuthorizedRole(),
                accessToken: window.googleDriveService && !!window.googleDriveService.accessToken
            };
            
            if (!diagnostics.authStatus.driveServiceReady) {
                diagnostics.recommendations.push('Authentication required - please sign in to Google Drive');
                return diagnostics;
            }
            
            // Test Drive API access
            console.log(`🔍 Testing Drive API access...`);
            try {
                const aboutResponse = await gapi.client.drive.about.get({
                    fields: 'user,storageQuota'
                });
                diagnostics.driveApiAccess = {
                    working: true,
                    user: aboutResponse.result.user,
                    storageQuota: aboutResponse.result.storageQuota
                };
            } catch (apiError) {
                diagnostics.driveApiAccess = {
                    working: false,
                    error: apiError.message
                };
                diagnostics.recommendations.push('Drive API access issue - check permissions');
            }
            
            // Check current folder structure
            console.log(`🔍 Checking current folder structure...`);
            if (window.annotationDriveService) {
                const structure = window.annotationDriveService.getFolderStructure();
                diagnostics.folderStructure = structure;
                
                // Validate each folder if IDs exist
                if (structure.projectFolderId) {
                    console.log(`🔍 Validating project folder...`);
                    const projectValidation = await this.validateFolderWithDetails(
                        structure.projectFolderId, 
                        'Code Comprehension'
                    );
                    diagnostics.folderStructure.projectValidation = projectValidation;
                    
                    if (!projectValidation.exists || !projectValidation.isFolder) {
                        diagnostics.recommendations.push('Project folder is invalid - needs recreation');
                    }
                }
                
                if (structure.jsonFolderId) {
                    console.log(`🔍 Validating JSON folder...`);
                    const jsonValidation = await this.validateFolderWithDetails(
                        structure.jsonFolderId, 
                        'JSON Sheets'
                    );
                    diagnostics.folderStructure.jsonValidation = jsonValidation;
                    
                    if (!jsonValidation.exists || !jsonValidation.isFolder) {
                        diagnostics.recommendations.push('JSON folder is invalid - needs recreation');
                    }
                }
                
                if (structure.pdfFolderId) {
                    console.log(`🔍 Validating PDF folder...`);
                    const pdfValidation = await this.validateFolderWithDetails(
                        structure.pdfFolderId, 
                        'PDF Files'
                    );
                    diagnostics.folderStructure.pdfValidation = pdfValidation;
                    
                    if (!pdfValidation.exists || !pdfValidation.isFolder) {
                        diagnostics.recommendations.push('PDF folder is invalid - needs recreation');
                    }
                }
            }
            
            // General recommendations
            if (diagnostics.recommendations.length === 0) {
                diagnostics.recommendations.push('All systems appear to be working correctly');
            }
            
        } catch (error) {
            console.error(`❌ Diagnostics failed:`, error);
            diagnostics.error = error.message;
            diagnostics.recommendations.push('Run resetFolderStructure() and try again');
        }
        
        console.log(`🔬 Diagnostics complete:`, diagnostics);
        return diagnostics;
    }

    /**
     * Quick fix for common issues
     */
    async quickFix() {
        console.log(`🔧 Running quick fix...`);
        
        try {
            // Step 1: Reset everything
            await this.resetFolderStructure();
            
            // Step 2: Re-initialize with safe creation
            if (window.annotationDriveService) {
                console.log(`🔄 Re-initializing annotation service...`);
                await window.annotationDriveService.initialize();
            }
            
            console.log(`✅ Quick fix completed successfully`);
            return true;
            
        } catch (error) {
            console.error(`❌ Quick fix failed:`, error);
            return false;
        }
    }
}

// Create global instance for debugging
window.folderDebugService = new FolderDebugService();

// Add convenient debug functions to global scope
window.debugFolder = function(folderId) {
    return window.folderDebugService.validateFolderWithDetails(folderId);
};

window.fixFolders = function() {
    return window.folderDebugService.quickFix();
};

window.diagnoseFolders = function() {
    return window.folderDebugService.diagnoseFolderIssues();
};

console.log(`
🔧 Folder Debug Service Loaded
===============================

Available debug commands:
• debugFolder(folderId) - Validate a specific folder
• fixFolders() - Reset and recreate folder structure  
• diagnoseFolders() - Comprehensive diagnostics
• window.folderDebugService.resetFolderStructure() - Clear cache

If you're getting 403 errors, try:
1. diagnoseFolders() - to see what's wrong
2. fixFolders() - to reset everything
`);