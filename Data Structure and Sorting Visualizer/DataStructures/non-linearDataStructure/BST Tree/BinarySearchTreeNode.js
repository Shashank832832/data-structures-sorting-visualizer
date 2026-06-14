class BinarySearchTreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;      // x-coordinate for rendering
        this.y = 0;      // y-coordinate for rendering
        this.highlighted = false;
    }
    
    get isLeaf() {
        return this.left === null && this.right === null;
    }
    
    get hasLeftChild() {
        return this.left !== null;
    }
    
    get hasRightChild() {
        return this.right !== null;
    }
    
    get hasChildren() {
        return this.hasLeftChild || this.hasRightChild;
    }
    
    get hasBothChildren() {
        return this.hasLeftChild && this.hasRightChild;
    }
}
