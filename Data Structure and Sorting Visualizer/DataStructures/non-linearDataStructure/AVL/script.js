/**
 * AVL Tree Visualization
 * Implementation of AVL Tree with visualization
 */

// AVL Node class
class AVLNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
      this.height = 1;
      this.balanceFactor = 0;
      // For visualization
      this.x = 0;
      this.y = 0;
    }
  }
  
  // AVL Tree class
  class AVLTree {
    constructor() {
      this.root = null;
    }
  
    // Get height of the node
    getHeight(node) {
      if (node === null) return 0;
      return node.height;
    }
  
    // Update height and balance factor of the node
    updateHeightAndBalanceFactor(node) {
      node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
      node.balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);
    }
  
    // Right rotation
    rightRotate(y) {
      const x = y.left;
      const T3 = x.right;
  
      // Perform rotation
      x.right = y;
      y.left = T3;
  
      // Update heights
      this.updateHeightAndBalanceFactor(y);
      this.updateHeightAndBalanceFactor(x);
  
      // Return new root
      return x;
    }
  
    // Left rotation
    leftRotate(x) {
      const y = x.right;
      const T2 = y.left;
  
      // Perform rotation
      y.left = x;
      x.right = T2;
  
      // Update heights
      this.updateHeightAndBalanceFactor(x);
      this.updateHeightAndBalanceFactor(y);
  
      // Return new root
      return y;
    }
  
    // Get balance factor of node
    getBalanceFactor(node) {
      if (node === null) return 0;
      return this.getHeight(node.left) - this.getHeight(node.right);
    }
  
    // Insert a node
    insert(value) {
      this.root = this._insert(this.root, value);
    }
  
    _insert(node, value) {
      // Standard BST insert
      if (node === null) {
        return new AVLNode(value);
      }
  
      if (value < node.value) {
        node.left = this._insert(node.left, value);
      } else if (value > node.value) {
        node.right = this._insert(node.right, value);
      } else {
        // Equal values not allowed
        return node;
      }
  
      // Update height of current node
      this.updateHeightAndBalanceFactor(node);
  
      // Get the balance factor to check if node became unbalanced
      const balance = this.getBalanceFactor(node);
  
      // If unbalanced, handle the 4 cases
  
      // Left Left Case
      if (balance > 1 && value < node.left.value) {
        return this.rightRotate(node);
      }
  
      // Right Right Case
      if (balance < -1 && value > node.right.value) {
        return this.leftRotate(node);
      }
  
      // Left Right Case
      if (balance > 1 && value > node.left.value) {
        node.left = this.leftRotate(node.left);
        return this.rightRotate(node);
      }
  
      // Right Left Case
      if (balance < -1 && value < node.right.value) {
        node.right = this.rightRotate(node.right);
        return this.leftRotate(node);
      }
  
      // Return the unchanged node
      return node;
    }
  
    // Get the node with minimum value
    minValueNode(node) {
      let current = node;
      while (current.left !== null) {
        current = current.left;
      }
      return current;
    }
  
    // Delete a node
    delete(value) {
      this.root = this._delete(this.root, value);
    }
  
    _delete(root, value) {
      // Standard BST delete
      if (root === null) {
        return root;
      }
  
      // If the value to be deleted is smaller than the root's value,
      // then it lies in left subtree
      if (value < root.value) {
        root.left = this._delete(root.left, value);
      }
      // If the value to be deleted is greater than the root's value,
      // then it lies in right subtree
      else if (value > root.value) {
        root.right = this._delete(root.right, value);
      }
      // If value is same as root's value, then this is the node to be deleted
      else {
        // Node with only one child or no child
        if ((root.left === null) || (root.right === null)) {
          const temp = root.left ? root.left : root.right;
  
          // No child case
          if (temp === null) {
            root = null;
          } else { // One child case
            root = temp; // Copy the contents of the non-empty child
          }
        } else {
          // Node with two children: Get the inorder successor (smallest
          // in the right subtree)
          const temp = this.minValueNode(root.right);
  
          // Copy the inorder successor's data to this node
          root.value = temp.value;
  
          // Delete the inorder successor
          root.right = this._delete(root.right, temp.value);
        }
      }
  
      // If the tree had only one node then return
      if (root === null) {
        return root;
      }
  
      // Update height of the current node
      this.updateHeightAndBalanceFactor(root);
  
      // Get the balance factor to check if this node became unbalanced
      const balance = this.getBalanceFactor(root);
  
      // If unbalanced, handle the 4 cases
  
      // Left Left Case
      if (balance > 1 && this.getBalanceFactor(root.left) >= 0) {
        return this.rightRotate(root);
      }
  
      // Left Right Case
      if (balance > 1 && this.getBalanceFactor(root.left) < 0) {
        root.left = this.leftRotate(root.left);
        return this.rightRotate(root);
      }
  
      // Right Right Case
      if (balance < -1 && this.getBalanceFactor(root.right) <= 0) {
        return this.leftRotate(root);
      }
  
      // Right Left Case
      if (balance < -1 && this.getBalanceFactor(root.right) > 0) {
        root.right = this.rightRotate(root.right);
        return this.leftRotate(root);
      }
  
      return root;
    }
  
    // Count the total nodes in the tree
    getNodeCount() {
      return this._getNodeCount(this.root);
    }
  
    _getNodeCount(node) {
      if (node === null) return 0;
      return 1 + this._getNodeCount(node.left) + this._getNodeCount(node.right);
    }
  
    // Check if the tree is balanced
    isBalanced() {
      return this._isBalanced(this.root);
    }
  
    _isBalanced(node) {
      if (node === null) return true;
      return Math.abs(this.getBalanceFactor(node)) <= 1 &&
             this._isBalanced(node.left) &&
             this._isBalanced(node.right);
    }
  
    // Traversal methods
    inOrderTraversal() {
      const result = [];
      this._inOrderTraversal(this.root, result);
      return result;
    }
  
    _inOrderTraversal(node, result) {
      if (node !== null) {
        this._inOrderTraversal(node.left, result);
        result.push(node.value);
        this._inOrderTraversal(node.right, result);
      }
    }
  
    preOrderTraversal() {
      const result = [];
      this._preOrderTraversal(this.root, result);
      return result;
    }
  
    _preOrderTraversal(node, result) {
      if (node !== null) {
        result.push(node.value);
        this._preOrderTraversal(node.left, result);
        this._preOrderTraversal(node.right, result);
      }
    }
  
    postOrderTraversal() {
      const result = [];
      this._postOrderTraversal(this.root, result);
      return result;
    }
  
    _postOrderTraversal(node, result) {
      if (node !== null) {
        this._postOrderTraversal(node.left, result);
        this._postOrderTraversal(node.right, result);
        result.push(node.value);
      }
    }
  
    levelOrderTraversal() {
      const result = [];
      if (this.root === null) return result;
  
      const queue = [this.root];
      while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.value);
  
        if (node.left !== null) queue.push(node.left);
        if (node.right !== null) queue.push(node.right);
      }
  
      return result;
    }
  
    // Clear the tree
    clear() {
      this.root = null;
    }
  }
  
  // Tree visualization 
  class AVLTreeVisualizer {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.tree = new AVLTree();
      this.selectedNode = null;
      this.animationSteps = [];
      this.currentStepIndex = -1;
      this.animationSpeed = 50;
      this.isPlaying = false;
      this.animationTimer = null;
      this.algorithmSteps = "";
      
      // Initialize canvas size
      this.resizeCanvas();
      
      // Handle window resize
      window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.draw();
    }
    
    // Calculate tree node positions
    calculateNodePositions(node, x, y, horizontalSpacing) {
      if (!node) return;
      
      node.x = x;
      node.y = y;
      
      const nodeHeight = 50; // Vertical spacing between levels
      
      if (node.left) {
        this.calculateNodePositions(
          node.left, 
          x - horizontalSpacing, 
          y + nodeHeight, 
          horizontalSpacing / 2
        );
      }
      
      if (node.right) {
        this.calculateNodePositions(
          node.right, 
          x + horizontalSpacing, 
          y + nodeHeight, 
          horizontalSpacing / 2
        );
      }
    }
    
    // Draw tree
    draw() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (!this.tree.root) return;
      
      // Calculate positions
      const startX = this.canvas.width / 2;
      const startY = 50;
      const initialHorizontalSpacing = this.canvas.width / 4;
      
      this.calculateNodePositions(this.tree.root, startX, startY, initialHorizontalSpacing);
      
      // Draw connections first (so they appear behind nodes)
      this.drawConnections(this.tree.root);
      
      // Draw nodes
      this.drawNodes(this.tree.root);
      
      // Update tree info panel
      this.updateTreeInfo();
    }
    
    // Draw connections between nodes
    drawConnections(node) {
      if (!node) return;
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#666';
      this.ctx.lineWidth = 2;
      
      if (node.left) {
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(node.left.x, node.left.y);
        this.ctx.stroke();
        this.drawConnections(node.left);
      }
      
      if (node.right) {
        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(node.right.x, node.right.y);
        this.ctx.stroke();
        this.drawConnections(node.right);
      }
    }
    
    // Draw nodes
    drawNodes(node) {
      if (!node) return;
      
      const nodeRadius = 20;
      
      // Draw node circle
      this.ctx.beginPath();
      
      // Highlight selected node or nodes with imbalance
      if (node === this.selectedNode) {
        this.ctx.fillStyle = '#3b82f6'; // Blue highlight for selected
      } else if (Math.abs(node.balanceFactor) > 1) {
        this.ctx.fillStyle = '#ef4444'; // Red for imbalanced nodes
      } else {
        this.ctx.fillStyle = '#10b981'; // Green for balanced nodes
      }
      
      this.ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw node value
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.value, node.x, node.y);
      
      // Draw height and balance factor
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(`h: ${node.height}`, node.x, node.y + nodeRadius + 15);
      this.ctx.fillText(`bf: ${node.balanceFactor}`, node.x, node.y + nodeRadius + 30);
      
      // Recursively draw child nodes
      this.drawNodes(node.left);
      this.drawNodes(node.right);
    }
    
    // Update tree info panel
    updateTreeInfo() {
      document.getElementById('node-count').textContent = this.tree.getNodeCount();
      document.getElementById('tree-height').textContent = this.tree.root ? this.tree.root.height : 0;
      document.getElementById('is-balanced').textContent = this.tree.isBalanced() ? 'Yes' : 'No';
    }
    
    // Display algorithm steps+
    displayAlgorithmSteps(steps) {
      document.getElementById('algorithm-steps-text').textContent = steps;
      this.algorithmSteps = steps;
    }
    
    // Update status display
    updateStatus(status, operation = 'None') {
      document.getElementById('status-text').textContent = status;
      document.getElementById('current-operation').textContent = operation;
    }
    
    // Insert value with animation
    insert(value) {
      if (!value) return;
      
      this.updateStatus('Inserting...', `Insert(${value})`);
      
      // Generate animation steps
      this.animationSteps = [];
      this.recordInsertionSteps(value);
      
      // Reset animation index and start animation
      this.currentStepIndex = -1;
      this.startAnimation();
    }
    
    // Record steps during insertion for animation
    recordInsertionSteps(value) {
      // Step 1: Start searching from root
      let steps = `Inserting value ${value} into AVL Tree\n`;
      steps += `1. Start from the root and traverse the tree\n`;
      this.animationSteps.push({
        tree: this.cloneTree(),
        selected: this.tree.root,
        steps: steps
      });
      
      // Perform insertion with animation steps
      const generateSteps = (node, value, depth = 0, path = []) => {
        if (!node) {
          steps += `${depth + 1}. Insert new node with value ${value}\n`;
          this.tree.insert(value);
          this.animationSteps.push({
            tree: this.cloneTree(),
            selected: this.findNode(this.tree.root, value),
            steps: steps
          });
          return;
        }
        
        // Record comparison step
        const currentStep = `${depth + 1}. Compare ${value} with node value ${node.value}\n`;
        steps += currentStep;
        
        // Clone tree and highlight current node for animation
        this.animationSteps.push({
          tree: this.cloneTree(),
          selected: this.findNode(this.tree.root, node.value),
          steps: steps
        });
        
        // Navigate to the next node based on comparison
        if (value < node.value) {
          steps += `   ${value} < ${node.value}, go to left child\n`;
          if (node.left) {
            generateSteps(node.left, value, depth + 1, [...path, 'left']);
          } else {
            this.tree.insert(value);
            steps += `${depth + 2}. Insert new node with value ${value}\n`;
            
            // Record the insertion
            this.animationSteps.push({
              tree: this.cloneTree(),
              selected: this.findNode(this.tree.root, value),
              steps: steps
            });
            
            // Check if rotations are needed
            this.checkAndRecordRotations(steps);
          }
        } else if (value > node.value) {
          steps += `   ${value} > ${node.value}, go to right child\n`;
          if (node.right) {
            generateSteps(node.right, value, depth + 1, [...path, 'right']);
          } else {
            this.tree.insert(value);
            steps += `${depth + 2}. Insert new node with value ${value}\n`;
            
            // Record the insertion
            this.animationSteps.push({
              tree: this.cloneTree(),
              selected: this.findNode(this.tree.root, value),
              steps: steps
            });
            
            // Check if rotations are needed
            this.checkAndRecordRotations(steps);
          }
        } else {
          steps += `   ${value} = ${node.value}, duplicate value, no insertion needed\n`;
          this.animationSteps.push({
            tree: this.cloneTree(),
            selected: node,
            steps: steps
          });
        }
      };
      
      generateSteps(this.tree.root, value);
    }
    
    // Check and record rotation steps
    checkAndRecordRotations(steps) {
      // This is a simplified version - in a real implementation, we would check
      // the balance factors throughout the tree and record rotations as they happen
      
      // For now, just add an additional step if the tree is not balanced
      if (!this.tree.isBalanced()) {
        steps += "\nTree is unbalanced. Rotations needed to restore balance.\n";
        // In a full implementation, we would record the specific rotations here
        
        this.animationSteps.push({
          tree: this.cloneTree(),
          selected: null,
          steps: steps
        });
      } else {
        steps += "\nTree is balanced. No rotations needed.\n";
        this.animationSteps.push({
          tree: this.cloneTree(),
          selected: null,
          steps: steps
        });
      }
    }
    
    // Delete value with animation
    delete(value) {
      if (!value) return;
      
      this.updateStatus('Deleting...', `Delete(${value})`);
      
      // Generate animation steps
      this.animationSteps = [];
      this.recordDeletionSteps(value);
      
      // Reset animation index and start animation
      this.currentStepIndex = -1;
      this.startAnimation();
    }
    
    // Record steps during deletion for animation
    recordDeletionSteps(value) {
      let steps = `Deleting value ${value} from AVL Tree\n`;
      steps += `1. Search for node with value ${value}\n`;
      
      // Find the node to delete first
      const nodeToDelete = this.findNode(this.tree.root, value);
      
      if (!nodeToDelete) {
        steps += `Value ${value} not found in the tree\n`;
        this.animationSteps.push({
          tree: this.cloneTree(),
          selected: null,
          steps: steps
        });
        return;
      }
      
      // Record the node found
      this.animationSteps.push({
        tree: this.cloneTree(),
        selected: nodeToDelete,
        steps: steps
      });
      
      // Add step for node found
      steps += `2. Node with value ${value} found\n`;
      this.animationSteps.push({
        tree: this.cloneTree(),
        selected: nodeToDelete,
        steps: steps
      });
      
      // Determine deletion case
      if (!nodeToDelete.left && !nodeToDelete.right) {
        steps += `3. Case 1: Node has no children\n`;
        steps += `   Remove the node directly\n`;
      } else if (!nodeToDelete.left || !nodeToDelete.right) {
        steps += `3. Case 2: Node has one child\n`;
        steps += `   Replace node with its only child\n`;
      } else {
        steps += `3. Case 3: Node has two children\n`;
        steps += `   Find inorder successor (smallest value in right subtree)\n`;
        
        // Find successor (for animation)
        let successor = nodeToDelete.right;
        while (successor.left) {
          successor = successor.left;
        }
        
        // Record finding the successor
        this.animationSteps.push({
          tree: this.cloneTree(),
          selected: successor,
          steps: steps + `   Successor found: ${successor.value}\n`
        });
        
        steps += `   Replace node value with successor value: ${successor.value}\n`;
        steps += `   Delete the successor node\n`;
      }
      
      // Perform the deletion
      this.tree.delete(value);
      
      // Record the tree after deletion
      this.animationSteps.push({
        tree: this.cloneTree(),
        selected: null,
        steps: steps + `\n4. Deletion complete\n`
      });
      
      // Check if rotations are needed
      this.checkAndRecordRotations(steps + `\n4. Deletion complete\n`);
    }
    
    // Find a node with the given value
    findNode(node, value) {
      if (!node) return null;
      if (node.value === value) return node;
      
      if (value < node.value) {
        return this.findNode(node.left, value);
      } else {
        return this.findNode(node.right, value);
      }
    }
    
    // Clone the current tree state for animation
    cloneTree() {
      const clone = new AVLTree();
      
      const cloneNode = (node) => {
        if (!node) return null;
        
        const newNode = new AVLNode(node.value);
        newNode.height = node.height;
        newNode.balanceFactor = node.balanceFactor;
        newNode.x = node.x;
        newNode.y = node.y;
        newNode.left = cloneNode(node.left);
        newNode.right = cloneNode(node.right);
        
        return newNode;
      };
      
      clone.root = cloneNode(this.tree.root);
      return clone;
    }
    
    // Start animation sequence
    startAnimation() {
      this.stopAnimation();
      
      if (this.animationSteps.length === 0) return;
      
      this.isPlaying = true;
      this.playNextStep();
    }
    
    // Play next animation step
    playNextStep() {
      if (!this.isPlaying || this.currentStepIndex >= this.animationSteps.length - 1) {
        this.stopAnimation();
        this.updateStatus('Ready', 'None');
        return;
      }
      
      this.currentStepIndex++;
      const step = this.animationSteps[this.currentStepIndex];
      
      // Apply the tree state from the animation step
      this.tree = step.tree;
      this.selectedNode = step.selected;
      this.displayAlgorithmSteps(step.steps);
      
      // Redraw the tree
      this.draw();
      
      // Schedule next step based on animation speed
      const delay = Math.max(1000 - (this.animationSpeed * 10), 50);
      this.animationTimer = setTimeout(() => this.playNextStep(), delay);
    }
    
    // Play previous animation step
    playPreviousStep() {
      if (this.currentStepIndex <= 0) return;
      
      this.stopAnimation();
      this.currentStepIndex--;
      const step = this.animationSteps[this.currentStepIndex];
      
      // Apply the tree state from the animation step
      this.tree = step.tree;
      this.selectedNode = step.selected;
      this.displayAlgorithmSteps(step.steps);
      
      // Redraw the tree
      this.draw();
    }
    
    // Stop the animation
    stopAnimation() {
      this.isPlaying = false;
      if (this.animationTimer) {
        clearTimeout(this.animationTimer);
        this.animationTimer = null;
      }
    }
    
    // Generate a sample tree
    buildSampleTree() {
      this.stopAnimation();
      this.tree.clear();
      
      // Generate some random values for the tree
      const values = [];
      const numNodes = 7 + Math.floor(Math.random() * 5); // 7-11 nodes
      
      while (values.length < numNodes) {
        const value = 1 + Math.floor(Math.random() * 99);
        if (!values.includes(value)) {
          values.push(value);
        }
      }
      
      // Insert values with delay to show the building process
      this.updateStatus('Building sample tree...', 'BuildTree()');
      
      let index = 0;
      const insertNext = () => {
        if (index >= values.length) {
          this.updateStatus('Ready', 'None');
          return;
        }
        
        this.tree.insert(values[index]);
        index++;
        
        this.draw();
        setTimeout(insertNext, 300);
      };
      
      insertNext();
    }
    
    // Clear the tree
    clearTree() {
      this.stopAnimation();
      this.tree.clear();
      this.selectedNode = null;
      this.animationSteps = [];
      this.currentStepIndex = -1;
      this.displayAlgorithmSteps('// Tree cleared');
      this.updateStatus('Tree cleared', 'Clear()');
      this.draw();
    }
    
    // Execute traversal animation
    executeTraversal(type) {
      this.stopAnimation();
      
      let result = [];
      let steps = `${type} Traversal:\n`;
      
      switch (type) {
        case 'In-Order':
          result = this.tree.inOrderTraversal();
          steps += `Visit left subtree, then root, then right subtree\n`;
          break;
        case 'Pre-Order':
          result = this.tree.preOrderTraversal();
          steps += `Visit root, then left subtree, then right subtree\n`;
          break;
        case 'Post-Order':
          result = this.tree.postOrderTraversal();
          steps += `Visit left subtree, then right subtree, then root\n`;
          break;
        case 'Level-Order':
          result = this.tree.levelOrderTraversal();
          steps += `Visit nodes level by level from top to bottom\n`;
          break;
      }
      
      steps += `\nResult: [${result.join(', ')}]`;
      this.displayAlgorithmSteps(steps);
      this.updateStatus(`${type} Traversal`, `${type.replace('-', '')}Traversal()`);
    }
    
    // Set animation speed
    setAnimationSpeed(speed) {
      this.animationSpeed = speed;
    }
  }
  
  // Main initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize the visualizer
    const visualizer = new AVLTreeVisualizer('tree-canvas');
    
    // Event listeners for controls
    
    // Insert operation
    document.getElementById('insert-btn').addEventListener('click', () => {
      const value = parseInt(document.getElementById('insert-value').value);
      if (!isNaN(value)) {
        visualizer.insert(value);
        document.getElementById('insert-value').value = '';
      }
    });
    
    // Delete operation
    document.getElementById('delete-btn').addEventListener('click', () => {
      const value = parseInt(document.getElementById('delete-value').value);
      if (!isNaN(value)) {
        visualizer.delete(value);
        document.getElementById('delete-value').value = '';
      }
    });
    
    // Build sample tree
    document.getElementById('build-tree-btn').addEventListener('click', () => {
      visualizer.buildSampleTree();
    });
    
    // Clear tree
    document.getElementById('clear-tree-btn').addEventListener('click', () => {
      visualizer.clearTree();
    });
    
    // Traversal algorithms
    document.getElementById('inorder-btn').addEventListener('click', () => {
      visualizer.executeTraversal('In-Order');
    });
    
    document.getElementById('preorder-btn').addEventListener('click', () => {
      visualizer.executeTraversal('Pre-Order');
    });
    
    document.getElementById('postorder-btn').addEventListener('click', () => {
      visualizer.executeTraversal('Post-Order');
    });
    
    document.getElementById('levelorder-btn').addEventListener('click', () => {
      visualizer.executeTraversal('Level-Order');
    });
    
    // Animation controls
    document.getElementById('speed-slider').addEventListener('input', (e) => {
      visualizer.setAnimationSpeed(parseInt(e.target.value));
    });
    
    document.getElementById('play-btn').addEventListener('click', () => {
      visualizer.startAnimation();
    });
    
    document.getElementById('pause-btn').addEventListener('click', () => {
      visualizer.stopAnimation();
    });
    
    document.getElementById('step-forward-btn').addEventListener('click', () => {
      visualizer.stopAnimation();
      visualizer.playNextStep();
    });
    
    document.getElementById('step-backward-btn').addEventListener('click', () => {
      visualizer.playPreviousStep();
    });
    
    // Draw the initial empty tree
    visualizer.draw();
    
    // Handle Enter key press in input fields
    document.getElementById('insert-value').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('insert-btn').click();
      }
    });
    
    document.getElementById('delete-value').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('delete-btn').click();
      }
    });
  });