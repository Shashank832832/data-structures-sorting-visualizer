document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('stackCanvas');
    const ctx = canvas.getContext('2d');
    const pushBtn = document.getElementById('pushBtn');
    const popBtn = document.getElementById('popBtn');
    const peekBtn = document.getElementById('peekBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pushValue = document.getElementById('pushValue');
    const statusDiv = document.getElementById('status');
    const canvasContainer = document.querySelector('.canvas-container');
    
    let isAnimating = false;
    const STEP_DELAY = 750;
    const NODE_WIDTH = 100;
    const NODE_HEIGHT = 60;
    const NODE_SPACING = 60;
    const TOP_BOX_SIZE = 40;
    const LINE_HEIGHT = 100;
    const TOP_BOX_X = 70;
    const NODES_PER_LINE = 5;

    class Node {
        constructor(value) {
            this.value = value;
            this.next = null;
            this.x = 0;
            this.y = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.animating = false;
            this.tempArrow = null;
            this.isNew = false;
            this.isHighlighted = false;
            this.line = 0;
        }
    }
    
    class LinkedListStack {
        constructor() {
            this.top = null;
            this.bottom = null;  // Track the bottom node
            this.size = 0;
            this.newNode = null;
        }
        
        push(value) {
            const newNode = new Node(value);
            newNode.next = this.top;
            this.top = newNode;
            this.size++;
            
            // Set bottom if this is the first node
            if (this.size === 1) {
                this.bottom = newNode;
            }
            
            return newNode;
        }
        
        pop() {
            if (this.top === null) return null;
            const poppedNode = this.top;
            this.top = this.top.next;
            this.size--;
            
            // Update bottom reference if we popped the last node
            if (this.size === 0) {
                this.bottom = null;
            }
            
            return poppedNode;
        }
        
        peek() {
            return this.top ? this.top.value : null;
        }
        
        isEmpty() {
            return this.top === null;
        }
        
        getSize() {
            return this.size;
        }
    }
    
    const stackLL = new LinkedListStack();
    
    function resizeCanvas() {
        const nodesInFirstLine = Math.min(stackLL.getSize(), NODES_PER_LINE);
        const requiredWidth = TOP_BOX_X + TOP_BOX_SIZE + 40 + (nodesInFirstLine * (NODE_WIDTH + NODE_SPACING)) + 50;
        const linesNeeded = Math.ceil(stackLL.getSize() / NODES_PER_LINE) + 2;
        
        canvas.width = Math.max(requiredWidth, 800);
        canvas.height = Math.max(linesNeeded * LINE_HEIGHT + 100, 400);
    }
    
    function calculatePositions() {
        if (stackLL.newNode) {
            stackLL.newNode.targetX = canvas.width / 2 - NODE_WIDTH / 2;
            stackLL.newNode.targetY = 50;
            stackLL.newNode.line = 0;
        }
        
        const topBoxY = LINE_HEIGHT;
        let current = stackLL.top;
        let nodeIndex = 0;
        
        while (current !== null) {
            const line = Math.floor(nodeIndex / NODES_PER_LINE) + 2;
            const positionInLine = nodeIndex % NODES_PER_LINE;
            
            current.line = line;
            current.targetX = TOP_BOX_X + TOP_BOX_SIZE + 40 + (positionInLine * (NODE_WIDTH + NODE_SPACING));
            current.targetY = topBoxY + (line * LINE_HEIGHT) - 50;
            
            if (!current.animating) {
                current.x = current.targetX;
                current.y = current.targetY;
            }
            
            nodeIndex++;
            current = current.next;
        }
    }
    
    function drawStack() {
        resizeCanvas();
        calculatePositions();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const topBoxY = LINE_HEIGHT;
        
        ctx.fillStyle = '#e1f5fe';
        ctx.strokeStyle = '#0288d1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(TOP_BOX_X, topBoxY, TOP_BOX_SIZE, TOP_BOX_SIZE);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.fillText('Top', TOP_BOX_X - 50, topBoxY + 25);
        
        if (stackLL.isEmpty()) {
            ctx.beginPath();
            ctx.moveTo(TOP_BOX_X, topBoxY);
            ctx.lineTo(TOP_BOX_X + TOP_BOX_SIZE, topBoxY + TOP_BOX_SIZE);
            ctx.strokeStyle = '#0288d1';
            ctx.stroke();
            
            ctx.fillStyle = '#999';
            ctx.fillText('null', TOP_BOX_X + TOP_BOX_SIZE + 10, topBoxY + 25);
        }
        
        let current = stackLL.top;
        while (current !== null) {
            drawNode(current);
            
            if (current.tempArrow) {
                drawArrow(
                    current.tempArrow.fromX, 
                    current.tempArrow.fromY, 
                    current.tempArrow.toX, 
                    current.tempArrow.toY
                );
            }
            
            if (current.next !== null && !current.tempArrow) {
                drawArrow(
                    current.x + NODE_WIDTH, 
                    current.y + (NODE_HEIGHT/2), 
                    current.next.x, 
                    current.next.y + (NODE_HEIGHT/2)
                );
            }
            
            current = current.next;
        }
        
        const firstNode = stackLL.top;
        if (firstNode && !firstNode.tempArrow) {
            drawArrow(
                TOP_BOX_X + TOP_BOX_SIZE, 
                topBoxY + TOP_BOX_SIZE/2, 
                firstNode.x, 
                firstNode.y + (NODE_HEIGHT/2)
            );
        }
        
        if (stackLL.newNode) {
            drawNode(stackLL.newNode);
            if (stackLL.newNode.tempArrow) {
                drawArrow(
                    stackLL.newNode.tempArrow.fromX,
                    stackLL.newNode.tempArrow.fromY,
                    stackLL.newNode.tempArrow.toX,
                    stackLL.newNode.tempArrow.toY
                );
            }
        }
    }
    
    function drawArrow(fromX, fromY, toX, toY) {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = '#333';
        ctx.stroke();
        
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const headLength = 15;
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI/6),
            toY - headLength * Math.sin(angle - Math.PI/6)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI/6),
            toY - headLength * Math.sin(angle + Math.PI/6)
        );
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(toX - headLength * Math.cos(angle), toY - headLength * Math.sin(angle));
        ctx.rotate(angle);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('>', 5, 5);
        ctx.restore();
    }
    
    function drawNode(node) {
        if (node.isHighlighted) {
            ctx.fillStyle = '#fff3e0';
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 3;
        } else if (node.isNew) {
            ctx.fillStyle = '#e1f5fe';
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = '#e1f5fe';
            ctx.strokeStyle = '#0288d1';
            ctx.lineWidth = 2;
        }
        
        ctx.beginPath();
        ctx.roundRect(node.x, node.y, NODE_WIDTH, NODE_HEIGHT, 5);
        ctx.fill();
        ctx.stroke();
        
        // Draw divider between value and next pointer
        ctx.beginPath();
        ctx.moveTo(node.x + NODE_WIDTH - 30, node.y);
        ctx.lineTo(node.x + NODE_WIDTH - 30, node.y + NODE_HEIGHT);
        ctx.strokeStyle = '#0288d1';
        ctx.stroke();
        
        // Draw diagonal in small box for bottom node only
        if (node === stackLL.bottom) {
            ctx.beginPath();
            ctx.moveTo(node.x + NODE_WIDTH - 30, node.y);
            ctx.lineTo(node.x + NODE_WIDTH, node.y + NODE_HEIGHT);
            ctx.strokeStyle = '#0288d1';
            ctx.stroke();
        }
        
        // Draw value
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.value.toString(), node.x + (NODE_WIDTH - 30)/2, node.y + 35);
        ctx.textAlign = 'left';
    }
    
    function animate() {
        let needsUpdate = false;
        
        if (stackLL.newNode && stackLL.newNode.animating) {
            const dx = stackLL.newNode.targetX - stackLL.newNode.x;
            const dy = stackLL.newNode.targetY - stackLL.newNode.y;
            
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                stackLL.newNode.x = stackLL.newNode.targetX;
                stackLL.newNode.y = stackLL.newNode.targetY;
                stackLL.newNode.animating = false;
            } else {
                stackLL.newNode.x += dx * 0.1;
                stackLL.newNode.y += dy * 0.1;
                needsUpdate = true;
            }
        }
        
        let current = stackLL.top;
        while (current !== null) {
            if (current.animating) {
                const dx = current.targetX - current.x;
                const dy = current.targetY - current.y;
                
                if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                    current.x = current.targetX;
                    current.y = current.targetY;
                    current.animating = false;
                    current.tempArrow = null;
                    current.isNew = false;
                } else {
                    current.x += dx * 0.1;
                    current.y += dy * 0.1;
                    needsUpdate = true;
                }
            }
            current = current.next;
        }
        
        if (needsUpdate) {
            drawStack();
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            if (stackLL.newNode && !stackLL.newNode.animating) {
                const newNode = stackLL.push(stackLL.newNode.value);
                newNode.x = stackLL.newNode.x;
                newNode.y = stackLL.newNode.y;
                newNode.isNew = false;
                stackLL.newNode = null;
                drawStack();
            }
        }
    }
    
    function pushValueToStack() {
        if (isAnimating) return;
        
        const value = pushValue.value.trim();
        if (!value) {
            showStatus('Please enter a value to push', 'error');
            return;
        }
        
        isAnimating = true;
        stackLL.newNode = new Node(value);
        stackLL.newNode.isNew = true;
        stackLL.newNode.x = canvas.width / 2 - NODE_WIDTH / 2;
        stackLL.newNode.y = 50;
        
        drawStack();
        
        setTimeout(() => {
            if (stackLL.top) {
                stackLL.newNode.tempArrow = {
                    fromX: stackLL.newNode.x + NODE_WIDTH,
                    fromY: stackLL.newNode.y + (NODE_HEIGHT/2),
                    toX: stackLL.top.x,
                    toY: stackLL.top.y + (NODE_HEIGHT/2)
                };
                
                stackLL.top.isNew = true;
                drawStack();
                
                setTimeout(() => {
                    const topBoxY = LINE_HEIGHT;
                    const tempTopArrow = {
                        fromX: TOP_BOX_X + TOP_BOX_SIZE,
                        fromY: topBoxY + TOP_BOX_SIZE/2,
                        toX: stackLL.newNode.x,
                        toY: stackLL.newNode.y + (NODE_HEIGHT/2)
                    };
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    let current = stackLL.top;
                    while (current !== null) {
                        drawNode(current);
                        if (current.next !== null) {
                            drawArrow(
                                current.x + NODE_WIDTH,
                                current.y + (NODE_HEIGHT/2),
                                current.next.x,
                                current.next.y + (NODE_HEIGHT/2)
                            );
                        }
                        current = current.next;
                    }
                    
                    ctx.fillStyle = '#e1f5fe';
                    ctx.strokeStyle = '#0288d1';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.rect(TOP_BOX_X, topBoxY, TOP_BOX_SIZE, TOP_BOX_SIZE);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = '#333';
                    ctx.font = '16px Arial';
                    ctx.fillText('Top', TOP_BOX_X - 50, topBoxY + 25);
                    
                    drawNode(stackLL.newNode);
                    drawArrow(
                        stackLL.newNode.tempArrow.fromX,
                        stackLL.newNode.tempArrow.fromY,
                        stackLL.newNode.tempArrow.toX,
                        stackLL.newNode.tempArrow.toY
                    );
                    
                    drawArrow(
                        tempTopArrow.fromX,
                        tempTopArrow.fromY,
                        tempTopArrow.toX,
                        tempTopArrow.toY
                    );
                    
                    setTimeout(() => {
                        stackLL.newNode.targetX = TOP_BOX_X + TOP_BOX_SIZE + 40;
                        stackLL.newNode.targetY = topBoxY + LINE_HEIGHT - 50;
                        stackLL.newNode.animating = true;
                        stackLL.newNode.tempArrow = null;
                        
                        let current = stackLL.top;
                        while (current !== null) {
                            calculatePositions();
                            current.animating = true;
                            current.isNew = false;
                            current = current.next;
                        }
                        
                        animate();
                    }, STEP_DELAY);
                }, STEP_DELAY);
            } else {
                setTimeout(() => {
                    const topBoxY = LINE_HEIGHT;
                    const tempTopArrow = {
                        fromX: TOP_BOX_X + TOP_BOX_SIZE,
                        fromY: topBoxY + TOP_BOX_SIZE/2,
                        toX: stackLL.newNode.x,
                        toY: stackLL.newNode.y + (NODE_HEIGHT/2)
                    };
                    
                    drawStack();
                    drawArrow(
                        tempTopArrow.fromX,
                        tempTopArrow.fromY,
                        tempTopArrow.toX,
                        tempTopArrow.toY
                    );
                    
                    setTimeout(() => {
                        stackLL.newNode.targetX = TOP_BOX_X + TOP_BOX_SIZE + 40;
                        stackLL.newNode.targetY = topBoxY + LINE_HEIGHT - 50;
                        stackLL.newNode.animating = true;
                        animate();
                    }, STEP_DELAY);
                }, STEP_DELAY);
            }
        }, STEP_DELAY);
        
        showStatus(`Pushed value: ${value}`, 'success');
        pushValue.value = '';
    }
    
    function peekTopNode() {
        if (isAnimating || stackLL.isEmpty()) {
            showStatus('Stack is empty', 'error');
            return;
        }
        
        const topValue = stackLL.peek();
        stackLL.top.isHighlighted = true;
        drawStack();
        
        showStatus(`Top value: ${topValue}`, 'success');
        
        setTimeout(() => {
            stackLL.top.isHighlighted = false;
            drawStack();
        }, 1000);
    }
    
    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = 'status';
        
        if (type === 'error') {
            statusDiv.classList.add('error');
        } else if (type === 'success') {
            statusDiv.classList.add('success');
        }
        
        statusDiv.style.display = 'flex';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
    
    pushBtn.addEventListener('click', pushValueToStack);
    
    pushValue.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            pushValueToStack();
        }
    });
    
    popBtn.addEventListener('click', function() {
        if (isAnimating || stackLL.isEmpty()) return;
        
        isAnimating = true;
        const poppedNode = stackLL.pop();
        
        poppedNode.targetX = canvas.width + NODE_WIDTH;
        poppedNode.targetY = poppedNode.y;
        poppedNode.animating = true;
        
        let current = stackLL.top;
        while (current !== null) {
            calculatePositions();
            current.animating = true;
            current = current.next;
        }
        
        showStatus(`Popped value: ${poppedNode.value}`, 'success');
        
        drawStack();
        animate();
    });
    
    peekBtn.addEventListener('click', peekTopNode);
    
    clearBtn.addEventListener('click', function() {
        if (isAnimating) return;
        
        while (!stackLL.isEmpty()) {
            stackLL.pop();
        }
        
        showStatus('Stack cleared', 'success');
        drawStack();
    });
    
    window.addEventListener('resize', function() {
        if (!isAnimating) {
            drawStack();
        }
    });
    
    resizeCanvas();
    drawStack();
});