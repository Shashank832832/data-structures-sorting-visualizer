class Queue {
    constructor() {
      this.nodes = [];
      this.head = null;
      this.tail = null;
    }
    
    enqueue(value) {
      const newNode = { value, next: null };
      if (!this.head) {
        this.head = this.tail = newNode;
      } else {
        this.tail.next = newNode;
        this.tail = newNode;
      }
      this.nodes.push(newNode);
      return newNode;
    }
    
    dequeue() {
      if (!this.head) return null;
      const removedNode = this.head;
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this.nodes.shift();
      return removedNode;
    }
    
    clear() {
      this.head = this.tail = null;
      this.nodes = [];
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const queue = new Queue();
    const visualization = document.getElementById('visualization');
    const inputValue = document.getElementById('inputValue');
    const enqueueBtn = document.getElementById('enqueueBtn');
    const dequeueBtn = document.getElementById('dequeueBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusDiv = document.getElementById('status');
    const headBox = document.getElementById('headBox');
    const tailBox = document.getElementById('tailBox');
    
    // More nodes in one line.
    const config = {
      baseX: 150,
      baseY: 100,
      nodeSpacing: 130,
      rowHeight: 120,
      nodesPerRow: 6,
      animationDuration: 500
    };
  
    let nodeElements = new Map();
    let arrows = [];
  
    function showStatus(message, isError = false) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${isError ? 'error' : 'success'}`;
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }, 3000);
    }
  
    // Update the visualization container's height based on the number of nodes.
    function updateVisualizationSize() {
      const totalNodes = nodeElements.size;
      const rows = Math.ceil(totalNodes / config.nodesPerRow);
      const neededHeight = config.baseY + (rows * config.rowHeight) + 100;
      visualization.style.minHeight = `${neededHeight}px`;
    }
  
    // Update head/tail boxes to show diagonal division when queue is empty.
    function updateNullState() {
      if (!queue.nodes.length) {
        headBox.classList.add('null-pointer');
        tailBox.classList.add('null-pointer');
      } else {
        headBox.classList.remove('null-pointer');
        tailBox.classList.remove('null-pointer');
      }
    }
  
    // For the last node's pointer, add the "null" style.
    function updateLastNodeNullState() {
      nodeElements.forEach((element, node) => {
        element.querySelector('.node-pointer').classList.remove('null');
      });
      if (queue.tail && nodeElements.has(queue.tail)) {
        nodeElements.get(queue.tail).querySelector('.node-pointer').classList.add('null');
      }
    }
  
    function createArrow(fromElem, toElem, type) {
      const fromRect = fromElem.getBoundingClientRect();
      const toRect = toElem.getBoundingClientRect();
      const visRect = visualization.getBoundingClientRect();
  
      const fromX = fromRect.right - visRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - visRect.top;
      const toX = toRect.left - visRect.left;
      const toY = toRect.top + toRect.height / 2 - visRect.top;
  
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX);
  
      const arrow = document.createElement('div');
      arrow.className = 'arrow';
      arrow.style.width = `${length}px`;
      arrow.style.left = `${fromX}px`;
      arrow.style.top = `${fromY}px`;
      arrow.style.transform = `rotate(${angle}rad)`;
      arrow.dataset.type = type;
  
      visualization.appendChild(arrow);
      return arrow;
    }
  
    // Remove arrows of a specific type.
    function removeArrowsOfType(type) {
      arrows = arrows.filter(arrow => {
        if (arrow.dataset.type === type) {
          arrow.remove();
          return false;
        }
        return true;
      });
    }
  
    // Update tail arrow: remove the old tail arrow and create a new one.
    function updateTailArrow() {
      removeArrowsOfType('tail');
      if (queue.tail && nodeElements.has(queue.tail)) {
        arrows.push(createArrow(
          tailBox,
          nodeElements.get(queue.tail).querySelector('.node-value'),
          'tail'
        ));
      }
    }
  
    // Rebuild all arrows after a dequeue.
    async function rebuildAllArrows() {
      arrows.forEach(a => a.remove());
      arrows = [];
      // Recreate head arrow.
      if (queue.head && nodeElements.has(queue.head)) {
        arrows.push(createArrow(
          headBox,
          nodeElements.get(queue.head).querySelector('.node-value'),
          'head'
        ));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Recreate node-to-node arrows.
      const nodesArray = Array.from(nodeElements);
      for (const [node, element] of nodesArray) {
        if (node.next && nodeElements.has(node.next)) {
          arrows.push(createArrow(
            element.querySelector('.node-pointer'),
            nodeElements.get(node.next).querySelector('.node-value'),
            'node'
          ));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      // Recreate tail arrow.
      if (queue.tail && nodeElements.has(queue.tail)) {
        arrows.push(createArrow(
          tailBox,
          nodeElements.get(queue.tail).querySelector('.node-value'),
          'tail'
        ));
      }
    }
  
    // Calculate the position for a node based on its index.
    function calculatePosition(index) {
      const row = Math.floor(index / config.nodesPerRow);
      const col = index % config.nodesPerRow;
      return {
        x: config.baseX + col * config.nodeSpacing,
        y: config.baseY + row * config.rowHeight
      };
    }
  
    // Position nodes according to their order.
    async function positionNodes() {
      let index = 0;
      nodeElements.forEach((element, node) => {
        const pos = calculatePosition(index);
        element.style.left = `${pos.x}px`;
        element.style.top = `${pos.y}px`;
        index++;
      });
      updateVisualizationSize();
      await new Promise(resolve => setTimeout(resolve, config.animationDuration));
    }
  
    enqueueBtn.addEventListener('click', async function() {
      const value = inputValue.value.trim();
      if (!value) {
        showStatus('Please enter a value', true);
        return;
      }
  
      // Create new node element.
      const nodeContainer = document.createElement('div');
      nodeContainer.className = 'node-container new-node';
      const nodeValue = document.createElement('div');
      nodeValue.className = 'node-value';
      nodeValue.textContent = value;
      const nodePointer = document.createElement('div');
      nodePointer.className = 'node-pointer';
      nodePointer.classList.add('null');
      nodeContainer.appendChild(nodeValue);
      nodeContainer.appendChild(nodePointer);
      visualization.appendChild(nodeContainer);
  
      // Enqueue the new node and store its element.
      const newNode = queue.enqueue(value);
      nodeElements.set(newNode, nodeContainer);
  
      // Set initial position.
      const pos = calculatePosition(nodeElements.size - 1);
      nodeContainer.style.left = `${pos.x}px`;
      nodeContainer.style.top = `${pos.y}px`;
  
      // Animate repositioning.
      await positionNodes();
  
      // If there is more than one node, add an arrow from the previous tail node to the new node.
      if (queue.nodes.length > 1) {
        const prevNode = queue.nodes[queue.nodes.length - 2];
        if (nodeElements.has(prevNode)) {
          arrows.push(createArrow(
            nodeElements.get(prevNode).querySelector('.node-pointer'),
            nodeElements.get(newNode).querySelector('.node-value'),
            'node'
          ));
        }
      }
  
      // Update the tail arrow.
      updateTailArrow();
  
      // For the very first node, create the head arrow.
      if (queue.nodes.length === 1) {
        removeArrowsOfType('head');
        arrows.push(createArrow(
          headBox,
          nodeElements.get(newNode).querySelector('.node-value'),
          'head'
        ));
      }
      
      // Update null state and last node's pointer state.
      updateNullState();
      updateLastNodeNullState();
  
      showStatus(`Enqueued: ${value}`);
      inputValue.value = '';
    });
  
    dequeueBtn.addEventListener('click', async function() {
      if (!queue.nodes.length) {
        showStatus('Queue is empty', true);
        return;
      }
      const removedNode = queue.head;
      const removedElement = nodeElements.get(removedNode);
      const newHeadNode = removedNode.next;
  
      // Shift head arrow to point to new head.
      if (newHeadNode && nodeElements.has(newHeadNode)) {
        removeArrowsOfType('head');
        await new Promise(resolve => setTimeout(resolve, 100));
        arrows.push(createArrow(
          headBox,
          nodeElements.get(newHeadNode).querySelector('.node-value'),
          'head'
        ));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Fade out and remove the first node.
      removedElement.style.transition = 'opacity 0.5s ease';
      removedElement.style.opacity = '0';
      await new Promise(resolve => setTimeout(resolve, 500));
      removedElement.remove();
      nodeElements.delete(removedNode);
      queue.dequeue();
  
      // Reposition remaining nodes.
      await positionNodes();
      
      // Rebuild all arrows.
      await rebuildAllArrows();
  
      updateNullState();
      updateLastNodeNullState();
  
      showStatus(`Dequeued: ${removedNode.value}`);
    });
  
    clearBtn.addEventListener('click', function() {
      queue.clear();
      visualization.querySelectorAll('.node-container').forEach(node => node.remove());
      nodeElements.clear();
      arrows.forEach(arrow => arrow.remove());
      arrows = [];
      visualization.style.minHeight = "400px";
      updateNullState();
      showStatus('Queue cleared');
    });
  
    inputValue.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        enqueueBtn.click();
      }
    });
  
    updateNullState();
  });
  