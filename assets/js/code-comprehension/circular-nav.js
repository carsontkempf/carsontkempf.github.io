// Circular Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const nodes = document.querySelectorAll('.menu-node');
  const pointer = document.getElementById('pointer');
  
  const angleOffset = -90; // Start pointing up
  let currentNodeIndex = 0;
  let lastClickedIndex = 0; // Track the last clicked button

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
    
    // Check for saved last clicked button in localStorage
    const savedLastClicked = localStorage.getItem('code-comprehension-last-clicked');
    if (savedLastClicked !== null && nodes[savedLastClicked]) {
      lastClickedIndex = parseInt(savedLastClicked, 10);
    } else {
      lastClickedIndex = 0; // Default to first button
    }
    
    if (nodes.length > 0) {
      const targetNode = nodes[lastClickedIndex];
      const targetAngle = parseInt(targetNode.getAttribute('data-angle'), 10);
      pointer.style.transform = `rotate(${targetAngle + angleOffset}deg)`;
      
      // Add active class to remembered button
      targetNode.classList.add('active');
    }
  }

  // Rotate pointer to selected node
  function rotatePointer(nodeAngle) {
    const rotation = nodeAngle + angleOffset;
    pointer.style.transform = `rotate(${rotation}deg)`;
  }

  // Update active state to show last clicked button
  function updateActiveState(clickedIndex) {
    nodes.forEach(n => n.classList.remove('active'));
    if (nodes[clickedIndex]) {
      nodes[clickedIndex].classList.add('active');
    }
    lastClickedIndex = clickedIndex;
    
    // Save to localStorage for persistence
    localStorage.setItem('code-comprehension-last-clicked', clickedIndex.toString());
  }

  // Handle node events
  nodes.forEach((node, index) => {
    // Add tabindex for keyboard accessibility
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `Navigate to ${node.getAttribute('data-title')}`);

    // Click events for navigation and pointer rotation
    node.addEventListener('click', (event) => {
      // Update pointer to point at clicked button
      const nodeAngle = parseInt(node.getAttribute('data-angle'), 10);
      rotatePointer(nodeAngle);
      updateActiveState(index);
      
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

    // Focus events for keyboard navigation (no pointer movement)
    node.addEventListener('focus', () => {
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
          // Simulate a click which will move the pointer and navigate
          nodes[currentNodeIndex].click();
        }
        return;
      case 'Tab':
        // Let tab work normally for accessibility
        return;
      default:
        return;
    }
    
    // Update keyboard focus (but don't move pointer)
    const currentNode = nodes[currentNodeIndex];
    if (currentNode) {
      currentNode.focus();
    }
  });

  // Handle window resize to recalculate positions
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setNodeAngles();
      // Keep pointer pointed at last clicked button after resize
      if (nodes[lastClickedIndex]) {
        const nodeAngle = parseInt(nodes[lastClickedIndex].getAttribute('data-angle'), 10);
        rotatePointer(nodeAngle);
      }
    }, 250);
  });

  // Initialize the interface
  initializeInterface();

  // Add visual feedback for interactions
  console.log('Circular navigation initialized with', nodes.length, 'nodes');
});