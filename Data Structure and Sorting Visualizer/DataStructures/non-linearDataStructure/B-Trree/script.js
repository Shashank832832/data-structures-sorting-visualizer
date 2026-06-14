// --- B-Tree Implementation (minimum degree = 2) ---

class BTreeNode {
    constructor(isLeaf = true) {
      this.isLeaf = isLeaf;
      this.keys = [];     // Array of keys
      this.children = []; // Array of child pointers (BTreeNode objects)
      // Position for visualization
      this.x = 0;
      this.y = 0;
    }
  
    // Insert key into a node that is guaranteed not full.
    insertNonFull(key, t) {
      let i = this.keys.length - 1;
      if (this.isLeaf) {
        // Insert key in sorted order.
        while (i >= 0 && key < this.keys[i]) {
          i--;
        }
        this.keys.splice(i + 1, 0, key);
      } else {
        // Find child to descend.
        while (i >= 0 && key < this.keys[i]) {
          i--;
        }
        i++;
        if (this.children[i].keys.length === 2 * t - 1) {
          this.splitChild(i, t);
          if (key > this.keys[i]) {
            i++;
          }
        }
        this.children[i].insertNonFull(key, t);
      }
    }
  
    // Split the child y of this node at index i.
    splitChild(i, t) {
      let y = this.children[i];
      let z = new BTreeNode(y.isLeaf);
      // z gets the latter half of y's keys.
      z.keys = y.keys.splice(t);
      if (!y.isLeaf) {
        // If not leaf, split children.
        z.children = y.children.splice(t);
      }
      // Insert new child into this node.
      this.children.splice(i + 1, 0, z);
      // Move median key up to this node.
      let median = y.keys.pop();
      this.keys.splice(i, 0, median);
    }
  }
  
  class BTree {
    constructor(t = 3) {
      this.t = t;
      this.root = new BTreeNode(true);
    }
  
    insert(key) {
      let r = this.root;
      if (r.keys.length === 2 * this.t - 1) {
        // Root is full, create new root and split.
        let s = new BTreeNode(false);
        s.children.push(r);
        s.splitChild(0, this.t);
        let i = 0;
        if (key > s.keys[0]) {
          i++;
        }
        s.children[i].insertNonFull(key, this.t);
        this.root = s;
      } else {
        r.insertNonFull(key, this.t);
      }
    }
  
    // Clear the tree.
    clear() {
      this.root = new BTreeNode(true);
    }
  }
  
  // --- Visualization Functions ---
  
  // Global variables for visualization
  const visualization = document.getElementById('visualization');
  const statusDiv = document.getElementById('status');
  const config = {
    verticalSpacing: 100,
    horizontalSpacing: 50,
    nodeWidth: 80,
    nodeHeight: 40
  };
  
  let arrows = []; // To hold drawn arrow elements
  
  // Recursively compute positions using inorder traversal.
  // Returns the next available x position.
  function computePositions(node, level, xPos) {
    node.y = config.verticalSpacing * level;
    if (node.isLeaf) {
      node.x = xPos;
      return xPos + config.nodeWidth + config.horizontalSpacing;
    } else {
      // For non-leaf, position based on children.
      for (let i = 0; i < node.children.length; i++) {
        xPos = computePositions(node.children[i], level + 1, xPos);
        // For visualization, if not the first child, then place parent's key between children.
        if (i < node.keys.length) {
          // Do nothing here – parent's keys will be displayed inside parent's box.
        }
      }
      // Set parent's x as the midpoint of its first and last child's x.
      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.x = (firstChild.x + lastChild.x) / 2;
      return xPos;
    }
  }
  
  // Create a visual node (div element) for a B-tree node.
  function createVisualNode(node) {
    const div = document.createElement('div');
    div.className = 'btree-node';
    // Display keys joined by commas.
    div.textContent = node.keys.join(',');
    visualization.appendChild(div);
    return div;
  }
  
  // Draw an arrow (line) from a parent visual node to a child visual node.
  function createArrow(fromDiv, toDiv) {
    const fromRect = fromDiv.getBoundingClientRect();
    const toRect = toDiv.getBoundingClientRect();
    const vizRect = visualization.getBoundingClientRect();
    const startX = fromRect.left + fromRect.width / 2 - vizRect.left;
    const startY = fromRect.bottom - vizRect.top;
    const endX = toRect.left + toRect.width / 2 - vizRect.left;
    const endY = toRect.top - vizRect.top;
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const line = document.createElement('div');
    line.className = 'arrow';
    line.style.width = `${length}px`;
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transform = `rotate(${angle}rad)`;
    visualization.appendChild(line);
    arrows.push(line);
  }
  
  // Recursively create visual nodes for the entire B-tree and draw arrows.
  function renderBTree(node) {
    // Clear previous visualization.
    visualization.innerHTML = '';
    arrows.forEach(a => a.remove());
    arrows = [];
    
    const visualNodes = new Map();
    
    // Compute positions.
    computePositions(node, 1, config.horizontalSpacing);
    
    // Create visual nodes in a recursive traversal.
    function createNodes(n) {
      const vNode = createVisualNode(n);
      vNode.style.left = `${n.x}px`;
      vNode.style.top = `${n.y}px`;
      visualNodes.set(n, vNode);
      if (!n.isLeaf) {
        for (let child of n.children) {
          createNodes(child);
          // Draw arrow from current node to child.
          createArrow(vNode, visualNodes.get(child));
        }
      }
    }
    createNodes(node);
  }
  
  // --- UI Interaction ---
  
  const btree = new BTree(2);
  const keyInput = document.getElementById('keyInput');
  const insertBtn = document.getElementById('insertBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  insertBtn.addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (key === "") {
      showStatus("Please enter a key.", true);
      return;
    }
    // For simplicity, treat input as number if possible.
    const parsedKey = isNaN(key) ? key : Number(key);
    btree.insert(parsedKey);
    renderBTree(btree.root);
    showStatus(`Inserted: ${parsedKey}`);
    keyInput.value = "";
  });
  
  clearBtn.addEventListener('click', () => {
    btree.clear();
    renderBTree(btree.root);
    showStatus("B-Tree cleared.");
  });
  
  // Show status messages.
  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "status";
    }, 3000);
  }
  
  // Initial render.
  renderBTree(btree.root);
  