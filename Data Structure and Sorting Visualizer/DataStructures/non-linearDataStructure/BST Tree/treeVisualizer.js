class TreeVisualizer {
    constructor(canvasId, bst) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bst = bst;
        this.animationSpeed = 2000; // milliseconds
        
        this.nodeFillColor = '#FFFFFF';
        this.nodeStrokeColor = '#4CAF50';
        this.nodeHighlightColor = '#FFEB3B';
        this.nodeFoundColor = '#4CAF50';
        this.nodeNotFoundColor = '#F44336';
        this.edgeColor = '#666666';
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.bst.root === null) {
            this.drawEmptyTree();
            return;
        }
        
        // Calculate positions for nodes
        this.bst.calculateNodePositions();
        
        // Center the tree horizontally
        const translateX = this.canvas.width / 2 - this.bst.root.x;
        
        // Draw edges first (so they appear under nodes)
        this.drawEdges(this.bst.root, translateX);
        
        // Draw nodes
        this.drawNodes(this.bst.root, translateX);
    }
    
    drawEmptyTree() {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Tree is empty. Add nodes to visualize.', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    drawNodes(node, translateX) {
        if (node === null) return;
        
        const x = node.x + translateX;
        const y = node.y;
        
        // Draw node circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bst.nodeRadius, 0, Math.PI * 2);
        
        if (node.highlighted) {
            this.ctx.fillStyle = this.nodeHighlightColor;
        } else {
            this.ctx.fillStyle = this.nodeFillColor;
        }
        
        this.ctx.strokeStyle = this.nodeStrokeColor;
        this.ctx.lineWidth = 2;
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw value text
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.value, x, y);
        
        // Draw child nodes recursively
        if (node.hasLeftChild) {
            this.drawNodes(node.left, translateX);
        }
        
        if (node.hasRightChild) {
            this.drawNodes(node.right, translateX);
        }
    }
    
    drawEdges(node, translateX) {
        if (node === null) return;
        
        const x = node.x + translateX;
        const y = node.y;
        
        // Draw edges to children
        this.ctx.strokeStyle = this.edgeColor;
        this.ctx.lineWidth = 1.5;
        
        if (node.hasLeftChild) {
            const childX = node.left.x + translateX;
            const childY = node.left.y;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(childX, childY);
            this.ctx.stroke();
            
            this.drawEdges(node.left, translateX);
        }
        
        if (node.hasRightChild) {
            const childX = node.right.x + translateX;
            const childY = node.right.y;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(childX, childY);
            this.ctx.stroke();
            
            this.drawEdges(node.right, translateX);
        }
    }
    
    // Animate search operation
    async animateSearch(value) {
        const result = this.bst.search(value);
        const path = result.path;
        
        // Reset all highlights
        this.resetHighlights();
        this.render();
        
        // Animate each node in the path
        for (let i = 0; i < path.length; i++) {
            path[i].highlighted = true;
            this.render();
            
            // Pause for animation
            await this.sleep(this.animationSpeed);
            
            // Keep last node highlighted if found
            if (i < path.length - 1 || !result.found) {
                path[i].highlighted = false;
            }
        }
        
        this.render();
        return result;
    }
    
    // Animate insertion
    async animateInsertion(value) {
        // First, animate the search path
        const searchResult = this.bst.search(value);
        
        // If value already exists, just highlight it
        if (searchResult.found) {
            for (const node of searchResult.path) {
                node.highlighted = true;
                this.render();
                await this.sleep(this.animationSpeed / 2);
                node.highlighted = false;
            }
            searchResult.node.highlighted = true;
            this.render();
            await this.sleep(this.animationSpeed);
            searchResult.node.highlighted = false;
            this.render();
            return false;
        }
        
        // Animate the search path to find insertion point
        for (const node of searchResult.path) {
            node.highlighted = true;
            this.render();
            await this.sleep(this.animationSpeed / 2);
            node.highlighted = false;
        }
        
        // Insert the new node
        const inserted = this.bst.insert(value);
        
        if (inserted) {
            // Find the newly inserted node
            const newNodeResult = this.bst.search(value);
            if (newNodeResult.found) {
                newNodeResult.node.highlighted = true;
                this.render();
                await this.sleep(this.animationSpeed);
                newNodeResult.node.highlighted = false;
            }
        }
        
        this.render();
        return inserted;
    }
    
    // Animate deletion
    async animateDeletion(value) {
        // First, animate the search path
        const searchResult = this.bst.search(value);
        
        // If node doesn't exist, just show the search path
        if (!searchResult.found) {
            for (const node of searchResult.path) {
                node.highlighted = true;
                this.render();
                await this.sleep(this.animationSpeed / 2);
                node.highlighted = false;
            }
            this.render();
            return false;
        }
        
        // Highlight the node to be deleted
        for (const node of searchResult.path) {
            node.highlighted = true;
            this.render();
            await this.sleep(this.animationSpeed / 2);
            
            if (node !== searchResult.node) {
                node.highlighted = false;
            }
        }
        
        // Keep the node to be deleted highlighted
        this.render();
        await this.sleep(this.animationSpeed);
        
        // Delete the node
        const deleted = this.bst.delete(value);
        
        // Reset highlights and render the updated tree
        this.resetHighlights();
        this.render();
        
        return deleted;
    }
    
    // Animate traversal
    async animateTraversal(traversalType) {
        let nodes = [];
        let values = [];
        
        switch (traversalType) {
            case 'inorder':
                this.collectNodesInOrder(this.bst.root, nodes);
                values = this.bst.inOrderTraversal();
                break;
            case 'preorder':
                this.collectNodesPreOrder(this.bst.root, nodes);
                values = this.bst.preOrderTraversal();
                break;
            case 'postorder':
                this.collectNodesPostOrder(this.bst.root, nodes);
                values = this.bst.postOrderTraversal();
                break;
        }
        
        // Reset all highlights
        this.resetHighlights();
        this.render();
        
        // Animate each node in the traversal sequence
        for (const node of nodes) {
            node.highlighted = true;
            this.render();
            
            // Pause for animation
            await this.sleep(this.animationSpeed / 2);
            
            node.highlighted = false;
            this.render();
        }
        
        return values;
    }
    
    collectNodesInOrder(node, nodes) {
        if (node !== null) {
            this.collectNodesInOrder(node.left, nodes);
            nodes.push(node);
            this.collectNodesInOrder(node.right, nodes);
        }
    }
    
    collectNodesPreOrder(node, nodes) {
        if (node !== null) {
            nodes.push(node);
            this.collectNodesPreOrder(node.left, nodes);
            this.collectNodesPreOrder(node.right, nodes);
        }
    }
    
    collectNodesPostOrder(node, nodes) {
        if (node !== null) {
            this.collectNodesPostOrder(node.left, nodes);
            this.collectNodesPostOrder(node.right, nodes);
            nodes.push(node);
        }
    }
    
    resetHighlights() {
        this.resetNodeHighlights(this.bst.root);
    }
    
    resetNodeHighlights(node) {
        if (node !== null) {
            node.highlighted = false;
            this.resetNodeHighlights(node.left);
            this.resetNodeHighlights(node.right);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
