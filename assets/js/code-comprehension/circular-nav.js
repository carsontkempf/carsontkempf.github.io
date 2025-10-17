// Circular Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const nodes = document.querySelectorAll('.menu-node');
  const pointer = document.getElementById('pointer');
  
  const angleOffset = -90; // Start pointing up
  let currentNodeIndex = 0;

  // Set CSS custom properties for each node
  function setNodeAngles() {
    nodes.forEach((node, index) => {
      const angle = index * 72; // 360/5 = 72 degrees apart
      node.style.setProperty('--angle', angle);
      node.setAttribute('data-angle', angle.toString());
    });
  }

  // Initialize pointer position
  function initializeInterface() {
    setNodeAngles();
    if (nodes.length > 0) {
      const firstNode = nodes[0];
      const firstAngle = parseInt(firstNode.getAttribute('data-angle'), 10);
      pointer.style.transform = `rotate(${firstAngle + angleOffset}deg)`;
      
      // Add active class to first node
      firstNode.classList.add('active');
    }
  }

  // Rotate pointer to selected node
  function rotatePointer(nodeAngle) {
    const rotation = nodeAngle + angleOffset;
    pointer.style.transform = `rotate(${rotation}deg)`;
  }

  // Handle node hover events
  nodes.forEach((node, index) => {
    // Add tabindex for keyboard accessibility
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `Navigate to ${node.getAttribute('data-title')}`);
    
    // Hover events for pointer rotation
    node.addEventListener('mouseenter', () => {
      const nodeAngle = parseInt(node.getAttribute('data-angle'), 10);
      rotatePointer(nodeAngle);
      
      // Remove active class from all nodes and add to current
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      currentNodeIndex = index;
    });

    // Click events for navigation
    node.addEventListener('click', (event) => {
      // Add a small delay for visual feedback
      event.preventDefault();
      
      // Add click animation by temporarily scaling
      node.style.transition = 'transform 0.2s ease';
      const currentTransform = window.getComputedStyle(node).transform;
      node.style.transform = currentTransform + ' scale(1.3)';
      
      setTimeout(() => {
        // Reset transform and navigate
        node.style.transition = 'all 0.3s ease';
        node.style.transform = '';
        window.location.href = node.getAttribute('href');
      }, 200);
    });

    // Focus events for keyboard navigation
    node.addEventListener('focus', () => {
      const nodeAngle = parseInt(node.getAttribute('data-angle'), 10);
      rotatePointer(nodeAngle);
      
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      currentNodeIndex = index;
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (event) => {
    // Only handle if a menu node is focused or no specific element is focused
    const activeElement = document.activeElement;
    const isMenuNodeFocused = activeElement && activeElement.classList.contains('menu-node');
    
    if (!isMenuNodeFocused && activeElement !== document.body) {
      return; // Don't interfere with other elements
    }

    switch(event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        currentNodeIndex = (currentNodeIndex - 1 + nodes.length) % nodes.length;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        currentNodeIndex = (currentNodeIndex + 1) % nodes.length;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (nodes[currentNodeIndex]) {
          nodes[currentNodeIndex].click();
        }
        return;
      case 'Tab':
        // Let tab work normally for accessibility
        return;
      default:
        return;
    }
    
    // Update interface for keyboard navigation
    const currentNode = nodes[currentNodeIndex];
    if (currentNode) {
      currentNode.focus();
      const nodeAngle = parseInt(currentNode.getAttribute('data-angle'), 10);
      rotatePointer(nodeAngle);
      
      // Update active state
      nodes.forEach(n => n.classList.remove('active'));
      currentNode.classList.add('active');
    }
  });

  // Handle mouse leave from entire circular menu
  const circularMenu = document.querySelector('.circular-menu');
  if (circularMenu) {
    circularMenu.addEventListener('mouseleave', () => {
      // Return to the first node when mouse leaves
      const firstNode = nodes[0];
      if (firstNode) {
        const firstAngle = parseInt(firstNode.getAttribute('data-angle'), 10);
        rotatePointer(firstAngle);
        
        nodes.forEach(n => n.classList.remove('active'));
        firstNode.classList.add('active');
        currentNodeIndex = 0;
      }
    });
  }

  // Handle window resize to recalculate positions
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setNodeAngles();
    }, 250);
  });

  // Initialize the interface
  initializeInterface();

  // Add visual feedback for interactions
  console.log('Circular navigation initialized with', nodes.length, 'nodes');
});