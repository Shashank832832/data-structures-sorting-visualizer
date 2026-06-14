class BinarySearchTree {
    constructor() {
        this.root = null;
        this.nodeRadius = 25;
        this.verticalSpacing = 70;
        this.horizontalSpacing = 50;
        this.animationSpeed = 2000; // milliseconds
    }
    
    // Insertion method
    insert(value) {
        const newNode = new BinarySearchTreeNode(value);
        
        if (this.root === null) {
            this.root = newNode;
            return true;
        }
        
        let current = this.root;
        
        while (true) {
            // Skip duplicates
            if (value === current.value) {
                return false;
            }
            
            if (value < current.value) {
                if (current.left === null) {
                    current.left = newNode;
                    return true;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = newNode;
                    return true;
                }
                current = current.right;
            }
        }
    }
    
    // Search method
    search(value) {
        let current = this.root;
        let path = [];
        
        while (current !== null) {
            path.push(current);
            
            if (value === current.value) {
                return { found: true, node: current, path: path };
            }
            
            if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        
        return { found: false, path: path };
    }
    
    // Delete method
    delete(value) {
        this.root = this._deleteNode(this.root, value);
        return this.root !== null;
    }
    
    _deleteNode(node, value) {
        if (node === null) {
            return null;
        }
        
        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
            return node;
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
            return node;
        } else {
            // Case 1: Leaf node
            if (node.isLeaf) {
                return null;
            }
            
            // Case 2: Node with only one child
            if (!node.hasLeftChild) {
                return node.right;
            }
            
            if (!node.hasRightChild) {
                return node.left;
            }
            
            // Case 3: Node with two children
            // Find the inorder successor (smallest node in right subtree)
            let successorParent = node;
            let successor = node.right;
            
            while (successor.left !== null) {
                successorParent = successor;
                successor = successor.left;
            }
            
            // If successor is not direct right child, fix the links
            if (successorParent !== node) {
                successorParent.left = successor.right;
                successor.right = node.right;
            }
            
            successor.left = node.left;
            
            return successor;
        }
    }
    
    // Tree traversals
    inOrderTraversal(node = this.root, result = []) {
        if (node !== null) {
            this.inOrderTraversal(node.left, result);
            result.push(node.value);
            this.inOrderTraversal(node.right, result);
        }
        return result;
    }
    
    preOrderTraversal(node = this.root, result = []) {
        if (node !== null) {
            result.push(node.value);
            this.preOrderTraversal(node.left, result);
            this.preOrderTraversal(node.right, result);
        }
        return result;
    }
    
    postOrderTraversal(node = this.root, result = []) {
        if (node !== null) {
            this.postOrderTraversal(node.left, result);
            this.postOrderTraversal(node.right, result);
            result.push(node.value);
        }
        return result;
    }
    
    // Clear the tree
    clear() {
        this.root = null;
    }
    
    // Generate a random tree
    generateRandomTree(nodeCount) {
        this.clear();
        const values = new Set();
        
        // Generate unique random values between -99 and 99
        while (values.size < nodeCount) {
            values.add(Math.floor(Math.random() * 199) - 99);
        }
        
        // Insert each value into the tree
        for (const value of values) {
            this.insert(value);
        }
    }
    
    // Calculate the height of the tree
    getHeight(node = this.root) {
        if (node === null) {
            return -1;
        }
        
        const leftHeight = this.getHeight(node.left);
        const rightHeight = this.getHeight(node.right);
        
        return Math.max(leftHeight, rightHeight) + 1;
    }
    
    // Calculate tree width at each level
    getTreeWidthAtLevel(level) {
        return Math.pow(2, level);
    }
    
    // Calculate coordinates for each node
    calculateNodePositions() {
        const height = this.getHeight();
        const canvasWidth = Math.pow(2, height) * this.horizontalSpacing;
        
        if (this.root !== null) {
            this._calculateNodePosition(this.root, 0, canvasWidth / 2, 0, canvasWidth);
        }
    }
    
    _calculateNodePosition(node, level, x, leftBound, rightBound) {
        node.x = x;
        node.y = level * this.verticalSpacing + this.nodeRadius * 2;
        
        if (node.hasLeftChild) {
            const nextX = (leftBound + x) / 2;
            this._calculateNodePosition(node.left, level + 1, nextX, leftBound, x);
        }
        
        if (node.hasRightChild) {
            const nextX = (rightBound + x) / 2;
            this._calculateNodePosition(node.right, level + 1, nextX, x, rightBound);
        }
    }
}
