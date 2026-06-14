document.addEventListener('DOMContentLoaded', function() {
    // Initialize Binary Search Tree
    const bst = new BinarySearchTree();
    
    // Initialize Tree Visualizer
    const visualizer = new TreeVisualizer('treeCanvas', bst);
    
    // DOM Elements
    const nodeValueInput = document.getElementById('nodeValue');
    const nodeCountInput = document.getElementById('nodeCount');
    const insertBtn = document.getElementById('insertBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const randomTreeBtn = document.getElementById('randomTreeBtn');
    const inorderBtn = document.getElementById('inorderBtn');
    const preorderBtn = document.getElementById('preorderBtn');
    const postorderBtn = document.getElementById('postorderBtn');
    const traversalResult = document.getElementById('traversalResult');
    const operationLog = document.getElementById('operationLog');
    
    // Event Listeners
    insertBtn.addEventListener('click', async function() {
        const value = parseInt(nodeValueInput.value);
        
        if (isNaN(value) || value < -99 || value > 99) {
            logOperation('Please enter a valid number between -99 and 99.', 'error');
            return;
        }
        
        const inserted = await visualizer.animateInsertion(value);
        
        if (inserted) {
            logOperation(`Inserted value ${value} into the tree.`, 'success');
        } else {
            logOperation(`Value ${value} already exists in the tree.`, 'info');
        }
        
        nodeValueInput.value = '';
    });
    
    deleteBtn.addEventListener('click', async function() {
        const value = parseInt(nodeValueInput.value);
        
        if (isNaN(value)) {
            logOperation('Please enter a valid number.', 'error');
            return;
        }
        
        const deleted = await visualizer.animateDeletion(value);
        
        if (deleted) {
            logOperation(`Deleted value ${value} from the tree.`, 'success');
        } else {
            logOperation(`Value ${value} not found in the tree.`, 'error');
        }
        
        nodeValueInput.value = '';
    });
    
    searchBtn.addEventListener('click', async function() {
        const value = parseInt(nodeValueInput.value);
        
        if (isNaN(value)) {
            logOperation('Please enter a valid number.', 'error');
            return;
        }
        
        const result = await visualizer.animateSearch(value);
        
        if (result.found) {
            logOperation(`Found value ${value} in the tree.`, 'success');
        } else {
            logOperation(`Value ${value} not found in the tree.`, 'error');
        }
    });
    
    clearBtn.addEventListener('click', function() {
        bst.clear();
        visualizer.render();
        traversalResult.textContent = '';
        logOperation('Tree cleared.', 'info');
    });
    
    randomTreeBtn.addEventListener('click', function() {
        const nodeCount = parseInt(nodeCountInput.value);
        
        if (isNaN(nodeCount) || nodeCount < 1 || nodeCount > 15) {
            logOperation('Please enter a valid number of nodes (1-15).', 'error');
            return;
        }
        
        bst.generateRandomTree(nodeCount);
        visualizer.render();
        logOperation(`Generated a random tree with ${nodeCount} nodes.`, 'success');
    });
    
    inorderBtn.addEventListener('click', async function() {
        if (bst.root === null) {
            logOperation('Tree is empty.', 'error');
            return;
        }
        
        const values = await visualizer.animateTraversal('inorder');
        displayTraversalResult('In-order Traversal', values);
    });
    
    preorderBtn.addEventListener('click', async function() {
        if (bst.root === null) {
            logOperation('Tree is empty.', 'error');
            return;
        }
        
        const values = await visualizer.animateTraversal('preorder');
        displayTraversalResult('Pre-order Traversal', values);
    });
    
    postorderBtn.addEventListener('click', async function() {
        if (bst.root === null) {
            logOperation('Tree is empty.', 'error');
            return;
        }
        
        const values = await visualizer.animateTraversal('postorder');
        displayTraversalResult('Post-order Traversal', values);
    });
    
    // Handle Enter key press for insertion
    nodeValueInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            insertBtn.click();
        }
    });
    
    // Helper functions
    function displayTraversalResult(type, values) {
        traversalResult.textContent = `${type}: [${values.join(', ')}]`;
        logOperation(`Performed ${type}.`, 'info');
    }
    
    function logOperation(message, type) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        
        operationLog.insertBefore(logEntry, operationLog.firstChild);
        
        // Limit log entries to keep performance
        if (operationLog.children.length > 10) {
            operationLog.removeChild(operationLog.lastChild);
        }
    }
    
    // Initialize visualization
    visualizer.render();
    
    // Generate a small random tree on load
    bst.generateRandomTree(7);
    visualizer.render();
    logOperation('Generated a random tree with 7 nodes.', 'success');
});
