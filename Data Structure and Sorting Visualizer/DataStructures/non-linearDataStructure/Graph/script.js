// DOM Elements
const canvas = document.getElementById('canvas');
const editingHints = document.getElementById('editingHints');
const startNodeSelect = document.getElementById('startNode');
const algorithmStatus = document.getElementById('algorithmStatus');
const currentNodeDisplay = document.getElementById('currentNode');
const queueDisplay = document.getElementById('queue');
const speedSlider = document.getElementById('speed');
const nodeLabel = document.getElementById('nodeLabel');
const fromNodeSelect = document.getElementById('fromNode');
const toNodeSelect = document.getElementById('toNode');
const editModeToggle = document.getElementById('editMode');
const helpBtn = document.getElementById('helpBtn');
const aboutLink = document.getElementById('aboutLink');
const helpModal = document.getElementById('helpModal');
const aboutModal = document.getElementById('aboutModal');

// Animation controls
const jumpToStartBtn = document.getElementById('jumpToStart');
const stepBackwardBtn = document.getElementById('stepBackward');
const playPauseBtn = document.getElementById('playPause');
const stepForwardBtn = document.getElementById('stepForward');
const jumpToEndBtn = document.getElementById('jumpToEnd');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const addNodeBtn = document.getElementById('addNodeBtn');
const addEdgeBtn = document.getElementById('addEdgeBtn');
const clearBtn = document.getElementById('clearBtn');
const presetBtns = document.querySelectorAll('.preset-btn');

// Create SVG element
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
canvas.appendChild(svg);

// Graph data
let nodes = [];
let edges = [];
let nextNodeId = 1;
let nextEdgeId = 1;

// Algorithm state
let startNodeId = null;
let animation = null;
let isPlaying = false;
let speed = 5;
let animationFrame = null;
let lastFrameTime = 0;

// UI state
let editMode = true;
let dragState = {
    isDragging: false,
    nodeId: null,
    startX: null,
    startY: null
};
let edgeDrawState = {
    isDrawing: false,
    fromNodeId: null,
    fromX: null,
    fromY: null,
    toX: null,
    toY: null
};

// Initialize
function init() {
    updateEditingHints();
    setupEventListeners();
    updateNodeSelects();
}

// Setup event listeners
function setupEventListeners() {
    // Canvas events
    svg.addEventListener('click', handleCanvasClick);
    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('mouseup', handleMouseUp);
    svg.addEventListener('mouseleave', handleMouseUp);
    svg.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Control events
    startNodeSelect.addEventListener('change', (e) => {
        startNodeId = parseInt(e.target.value);
    });
    
    speedSlider.addEventListener('input', (e) => {
        speed = parseInt(e.target.value);
    });
    
    // Button events
    runBtn.addEventListener('click', startAlgorithm);
    resetBtn.addEventListener('click', resetAlgorithm);
    jumpToStartBtn.addEventListener('click', jumpToStart);
    stepBackwardBtn.addEventListener('click', stepBackward);
    playPauseBtn.addEventListener('click', togglePlay);
    stepForwardBtn.addEventListener('click', stepForward);
    jumpToEndBtn.addEventListener('click', jumpToEnd);
    addNodeBtn.addEventListener('click', handleAddNodeClick);
    addEdgeBtn.addEventListener('click', handleAddEdgeClick);
    clearBtn.addEventListener('click', clearGraph);
    
    // Edit mode toggle
    editModeToggle.addEventListener('change', (e) => {
        editMode = e.target.checked;
        updateEditingHints();
    });
    
    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loadPreset(btn.dataset.preset);
        });
    });
    
    // Modal events
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });
    
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });
    
    // Close modal on X click
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            helpModal.style.display = 'none';
            aboutModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.style.display = 'none';
        if (e.target === aboutModal) aboutModal.style.display = 'none';
    });
}

// Add a new node
function addNode(label, x, y) {
    const node = {
        id: nextNodeId++,
        label: label,
        x: x,
        y: y,
        state: 'unvisited'
    };
    
    nodes.push(node);
    createNodeElement(node);
    updateNodeSelects();
    
    // If this is the first node, set it as the start node
    if (nodes.length === 1) {
        startNodeId = node.id;
        startNodeSelect.value = node.id;
    }
    
    return node;
}

// Add a new edge
function addEdge(fromNodeId, toNodeId) {
    // Check if edge already exists
    const edgeExists = edges.some(
        e => (e.fromNodeId === fromNodeId && e.toNodeId === toNodeId) ||
             (e.fromNodeId === toNodeId && e.toNodeId === fromNodeId)
    );
    
    if (edgeExists) return null;
    
    const edge = {
        id: nextEdgeId++,
        fromNodeId: fromNodeId,
        toNodeId: toNodeId,
        highlighted: false
    };
    
    edges.push(edge);
    createEdgeElement(edge);
    
    return edge;
}

// Remove a node
function removeNode(nodeId) {
    // Remove all edges connected to this node
    const edgesToRemove = edges.filter(
        edge => edge.fromNodeId === nodeId || edge.toNodeId === nodeId
    );
    
    edgesToRemove.forEach(edge => {
        removeEdge(edge.id);
    });
    
    // Remove the node from the array
    nodes = nodes.filter(node => node.id !== nodeId);
    
    // Remove the node element from the SVG
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
        nodeElement.remove();
    }
    
    // If this was the start node, clear the start node
    if (startNodeId === nodeId) {
        startNodeId = nodes.length > 0 ? nodes[0].id : null;
    }
    
    updateNodeSelects();
}

// Remove an edge
function removeEdge(edgeId) {
    // Remove the edge from the array
    edges = edges.filter(edge => edge.id !== edgeId);
    
    // Remove the edge element from the SVG
    const edgeElement = document.getElementById(`edge-${edgeId}`);
    if (edgeElement) {
        edgeElement.remove();
    }
}

// Update node state
function updateNodeState(nodeId, state) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    node.state = state;
    
    // Update node visual
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
        const circle = nodeElement.querySelector('circle');
        if (circle) {
            circle.setAttribute('class', getNodeClass(state));
        }
    }
}

// Update edge highlight state
function updateEdgeHighlight(edgeId, highlighted) {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    
    edge.highlighted = highlighted;
    
    // Update edge visual
    const edgeElement = document.getElementById(`edge-${edgeId}`);
    if (edgeElement) {
        edgeElement.setAttribute('class', getEdgeClass(highlighted));
    }
}

// Create a node element in the SVG
function createNodeElement(node) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', `node-${node.id}`);
    g.style.cursor = editMode ? 'move' : 'pointer';
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', getNodeClass(node.state));
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', 20);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'node-label');
    text.setAttribute('pointer-events', 'none');
    text.textContent = node.label;
    
    // Event listeners
    g.addEventListener('mousedown', (e) => {
        if (e.button === 2) {
            // Right-click
            if (editMode) {
                removeNode(node.id);
            }
            return;
        }
        
        if (e.altKey && editMode) {
            // Alt+click to start drawing an edge
            handleEdgeDrawStart(e, node.id, node.x, node.y);
        } else if (editMode) {
            // Regular click to drag
            handleNodeDragStart(e, node.id);
        }
    });
    
    g.addEventListener('mouseup', () => {
        if (edgeDrawState.isDrawing && edgeDrawState.fromNodeId !== node.id) {
            handleEdgeDrawEnd(node.id);
        }
    });
    
    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);
}

// Create an edge element in the SVG
function createEdgeElement(edge) {
    const fromNode = nodes.find(n => n.id === edge.fromNodeId);
    const toNode = nodes.find(n => n.id === edge.toNodeId);
    if (!fromNode || !toNode) return;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('id', `edge-${edge.id}`);
    line.setAttribute('class', getEdgeClass(edge.highlighted));
    line.setAttribute('x1', fromNode.x);
    line.setAttribute('y1', fromNode.y);
    line.setAttribute('x2', toNode.x);
    line.setAttribute('y2', toNode.y);
    
    // Right-click to delete
    line.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (editMode) {
            removeEdge(edge.id);
        }
    });
    
    // Insert edge before nodes so they appear below
    svg.insertBefore(line, svg.firstChild);
}

// Update the edge drawing line
function updateEdgeDrawLine() {
    // Remove any existing draw line
    const existingLine = document.getElementById('edge-draw-line');
    if (existingLine) {
        existingLine.remove();
    }
    
    if (!edgeDrawState.isDrawing) return;
    
    // Create the draw line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('id', 'edge-draw-line');
    line.setAttribute('class', 'edge-highlight');
    line.setAttribute('x1', edgeDrawState.fromX);
    line.setAttribute('y1', edgeDrawState.fromY);
    line.setAttribute('x2', edgeDrawState.toX);
    line.setAttribute('y2', edgeDrawState.toY);
    line.setAttribute('stroke-dasharray', '5,5');
    
    svg.appendChild(line);
}

// Get CSS class for node based on its state
function getNodeClass(state) {
    switch (state) {
        case 'queued':
            return 'node node-queued';
        case 'visited':
            return 'node node-visited';
        case 'current':
            return 'node node-current';
        default:
            return 'node node-unvisited';
    }
}

// Get CSS class for edge based on its highlight state
function getEdgeClass(highlighted) {
    return highlighted ? 'edge edge-highlight' : 'edge';
}

// Generate a unique node label
function generateNodeLabel() {
    if (nodes.length === 0) return 'A';
    
    // Get the highest label
    const labels = nodes.map(node => node.label);
    const lastLabel = labels.sort()[labels.length - 1];
    
    // Increment the label
    const charCode = lastLabel.charCodeAt(0);
    return String.fromCharCode(charCode + 1);
}

// Update dropdowns with node options
function updateNodeSelects() {
    // Sort nodes by label
    const sortedNodes = [...nodes].sort((a, b) => a.label.localeCompare(b.label));
    
    // Clear existing options
    startNodeSelect.innerHTML = '<option value="" disabled>Select a node</option>';
    fromNodeSelect.innerHTML = '<option value="" disabled selected>From</option>';
    toNodeSelect.innerHTML = '<option value="" disabled selected>To</option>';
    
    // Add node options
    sortedNodes.forEach(node => {
        // For start node select
        const startOption = document.createElement('option');
        startOption.value = node.id;
        startOption.textContent = `Node ${node.label}`;
        startNodeSelect.appendChild(startOption);
        
        // For from node select
        const fromOption = document.createElement('option');
        fromOption.value = node.id;
        fromOption.textContent = node.label;
        fromNodeSelect.appendChild(fromOption);
        
        // For to node select
        const toOption = document.createElement('option');
        toOption.value = node.id;
        toOption.textContent = node.label;
        toNodeSelect.appendChild(toOption);
    });
    
    // Set the selected start node
    if (startNodeId) {
        startNodeSelect.value = startNodeId;
    } else if (nodes.length > 0) {
        startNodeId = nodes[0].id;
        startNodeSelect.value = startNodeId;
    }
}

// Show/hide the editing hints based on edit mode
function updateEditingHints() {
    editingHints.style.display = editMode ? 'block' : 'none';
}

// Clear the graph
function clearGraph() {
    // Stop any running animation
    resetAlgorithm();
    
    // Clear the SVG
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    
    // Reset data
    nodes = [];
    edges = [];
    nextNodeId = 1;
    nextEdgeId = 1;
    startNodeId = null;
    
    // Update UI
    updateNodeSelects();
    updateQueueDisplay([]);
}

// Reset the algorithm
function resetAlgorithm() {
    // Stop animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    isPlaying = false;
    animation = null;
    
    // Update UI
    playPauseBtn.textContent = '▶';
    algorithmStatus.textContent = 'Ready';
    currentNodeDisplay.textContent = 'None';
    updateQueueDisplay([]);
    
    // Reset nodes and edges
    nodes.forEach(node => {
        updateNodeState(node.id, 'unvisited');
    });
    
    edges.forEach(edge => {
        updateEdgeHighlight(edge.id, false);
    });
    
    // Disable animation controls
    setAnimationControlsEnabled(false);
}

// Start the BFS algorithm
function startAlgorithm() {
    if (!startNodeId || nodes.length === 0) return;
    
    // Run BFS algorithm and get animation steps
    animation = runBFS();
    
    // Initialize animation at first step
    if (animation.steps.length > 0) {
        applyAnimationStep(animation.steps[0]);
        animation.currentStepIndex = 0;
        
        // Update UI
        algorithmStatus.textContent = 'Ready';
        currentNodeDisplay.textContent = 'None';
        
        // Enable animation controls
        setAnimationControlsEnabled(true);
    }
}

// Run BFS algorithm and return animation steps
function runBFS() {
    // Convert graph to adjacency list for algorithm
    const adjacencyList = createAdjacencyList();
    
    // Initialize data structures
    const visited = new Set();
    const queue = [startNodeId];
    const steps = [];
    
    // Initialize node states for the first step
    const initialNodeStates = {};
    nodes.forEach(node => {
        initialNodeStates[node.id] = node.id === startNodeId ? 'queued' : 'unvisited';
    });
    
    // Initialize the first step
    steps.push({
        nodeStates: { ...initialNodeStates },
        edgeHighlights: {},
        queue: [...queue],
        currentNode: null
    });
    
    // BFS algorithm
    while (queue.length > 0) {
        // Dequeue the front node
        const currentNode = queue.shift();
        
        // Mark as visited
        visited.add(currentNode);
        
        // Create new step for current node processing
        const currentNodeStep = {
            nodeStates: { ...steps[steps.length - 1].nodeStates },
            edgeHighlights: { ...steps[steps.length - 1].edgeHighlights },
            queue: [...queue],
            currentNode
        };
        
        // Mark current node as current
        currentNodeStep.nodeStates[currentNode] = 'current';
        
        // Add the step
        steps.push(currentNodeStep);
        
        // Process neighbors
        const neighbors = adjacencyList.get(currentNode) || [];
        
        for (const neighbor of neighbors) {
            // Skip already visited nodes
            if (visited.has(neighbor) || queue.includes(neighbor)) {
                continue;
            }
            
            // Enqueue the neighbor
            queue.push(neighbor);
            
            // Create new step for each neighbor discovery
            const neighborStep = {
                nodeStates: { ...steps[steps.length - 1].nodeStates },
                edgeHighlights: { ...steps[steps.length - 1].edgeHighlights },
                queue: [...queue],
                currentNode
            };
            
            // Mark neighbor as queued
            neighborStep.nodeStates[neighbor] = 'queued';
            
            // Highlight the edge
            const edgeKey = createEdgeKey(currentNode, neighbor);
            neighborStep.edgeHighlights[edgeKey] = true;
            
            // Add the step
            steps.push(neighborStep);
        }
        
        // Create step for marking current node as visited
        const visitedStep = {
            nodeStates: { ...steps[steps.length - 1].nodeStates },
            edgeHighlights: { ...steps[steps.length - 1].edgeHighlights },
            queue: [...queue],
            currentNode: null
        };
        
        // Mark current node as visited
        visitedStep.nodeStates[currentNode] = 'visited';
        
        // Add the step
        steps.push(visitedStep);
    }
    
    // Return the animation data
    return {
        steps,
        currentStepIndex: 0
    };
}

// Create an adjacency list for the algorithm
function createAdjacencyList() {
    const adjacencyList = new Map();
    
    // Initialize all nodes with empty adjacency lists
    nodes.forEach(node => {
        adjacencyList.set(node.id, []);
    });
    
    // Add edges to adjacency lists
    edges.forEach(edge => {
        const { fromNodeId, toNodeId } = edge;
        
        // Add edge in both directions (undirected graph)
        const fromAdjList = adjacencyList.get(fromNodeId) || [];
        if (!fromAdjList.includes(toNodeId)) {
            fromAdjList.push(toNodeId);
            adjacencyList.set(fromNodeId, fromAdjList);
        }
        
        const toAdjList = adjacencyList.get(toNodeId) || [];
        if (!toAdjList.includes(fromNodeId)) {
            toAdjList.push(fromNodeId);
            adjacencyList.set(toNodeId, toAdjList);
        }
    });
    
    return adjacencyList;
}

// Create an edge key string
function createEdgeKey(fromNodeId, toNodeId) {
    // Ensure consistent ordering for undirected edges
    return fromNodeId < toNodeId 
        ? `${fromNodeId}-${toNodeId}` 
        : `${toNodeId}-${fromNodeId}`;
}

// Find edge ID between nodes
function getEdgeId(fromNodeId, toNodeId) {
    const edge = edges.find(
        e => (e.fromNodeId === fromNodeId && e.toNodeId === toNodeId) ||
             (e.fromNodeId === toNodeId && e.toNodeId === fromNodeId)
    );
    
    return edge ? edge.id : null;
}

// Apply animation step
function applyAnimationStep(step) {
    // Update node states
    for (const [nodeId, state] of Object.entries(step.nodeStates)) {
        updateNodeState(parseInt(nodeId), state);
    }
    
    // Update edge highlights
    // First reset all edges
    edges.forEach(edge => {
        updateEdgeHighlight(edge.id, false);
    });
    
    // Then apply highlights from the step
    for (const [edgeKey, highlighted] of Object.entries(step.edgeHighlights)) {
        if (!highlighted) continue;
        
        const [fromId, toId] = edgeKey.split('-').map(id => parseInt(id));
        const edgeId = getEdgeId(fromId, toId);
        
        if (edgeId !== null) {
            updateEdgeHighlight(edgeId, true);
        }
    }
    
    // Update queue display
    updateQueueDisplay(step.queue);
    
    // Update current node display
    const currentNode = step.currentNode ? nodes.find(n => n.id === step.currentNode) : null;
    currentNodeDisplay.textContent = currentNode ? currentNode.label : 'None';
}

// Update the queue display
function updateQueueDisplay(queue) {
    // Clear the queue display
    queueDisplay.innerHTML = '';
    
    if (queue.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-queue';
        emptyDiv.textContent = 'Queue is empty';
        queueDisplay.appendChild(emptyDiv);
        return;
    }
    
    // Add each node in the queue
    queue.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.textContent = node.label;
        queueDisplay.appendChild(queueItem);
    });
}

// Step forward in animation
function stepForward() {
    if (!animation) return;
    
    const nextIndex = Math.min(animation.currentStepIndex + 1, animation.steps.length - 1);
    if (nextIndex === animation.currentStepIndex) return;
    
    const nextStep = animation.steps[nextIndex];
    animation.currentStepIndex = nextIndex;
    
    applyAnimationStep(nextStep);
    
    // Update status
    algorithmStatus.textContent = isPlaying ? 'Running' : 'Paused';
}

// Step backward in animation
function stepBackward() {
    if (!animation) return;
    
    const prevIndex = Math.max(animation.currentStepIndex - 1, 0);
    if (prevIndex === animation.currentStepIndex) return;
    
    const prevStep = animation.steps[prevIndex];
    animation.currentStepIndex = prevIndex;
    
    applyAnimationStep(prevStep);
    
    // Update status
    algorithmStatus.textContent = isPlaying ? 'Running' : 'Paused';
}

// Jump to the start of animation
function jumpToStart() {
    if (!animation || animation.steps.length === 0) return;
    
    animation.currentStepIndex = 0;
    applyAnimationStep(animation.steps[0]);
    
    // Update status
    algorithmStatus.textContent = isPlaying ? 'Running' : 'Paused';
}

// Jump to the end of animation
function jumpToEnd() {
    if (!animation || animation.steps.length === 0) return;
    
    animation.currentStepIndex = animation.steps.length - 1;
    applyAnimationStep(animation.steps[animation.steps.length - 1]);
    
    // Update status
    algorithmStatus.textContent = isPlaying ? 'Running' : 'Paused';
}

// Toggle animation play/pause
function togglePlay() {
    if (!animation) return;
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        // Start animation loop
        playPauseBtn.textContent = '⏸';
        algorithmStatus.textContent = 'Running';
        animateLoop();
    } else {
        // Stop animation loop
        playPauseBtn.textContent = '▶';
        algorithmStatus.textContent = 'Paused';
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }
}

// Animation loop
function animateLoop(timestamp) {
    if (!isPlaying || !animation) return;
    
    if (!lastFrameTime) lastFrameTime = timestamp;
    
    const elapsed = timestamp - lastFrameTime;
    const frameDelay = 1000 / speed; // Convert speed to milliseconds
    
    if (elapsed > frameDelay) {
        lastFrameTime = timestamp;
        
        // Move to next step
        if (animation.currentStepIndex < animation.steps.length - 1) {
            stepForward();
        } else {
            // End of animation
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            algorithmStatus.textContent = 'Completed';
        }
    }
    
    if (isPlaying) {
        animationFrame = requestAnimationFrame(animateLoop);
    }
}

// Enable/disable animation controls
function setAnimationControlsEnabled(enabled) {
    jumpToStartBtn.disabled = !enabled;
    stepBackwardBtn.disabled = !enabled;
    playPauseBtn.disabled = !enabled;
    stepForwardBtn.disabled = !enabled;
    jumpToEndBtn.disabled = !enabled;
    resetBtn.disabled = !enabled;
    speedSlider.disabled = !enabled;
    runBtn.disabled = enabled;
}

// Handle canvas click
function handleCanvasClick(e) {
    if (!editMode) return;
    
    // Only create node on direct canvas click, not on existing elements
    if (e.target === svg) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Generate a new node label
        const label = generateNodeLabel();
        
        // Create a new node
        addNode(label, x, y);
    }
}

// Handle node drag start
function handleNodeDragStart(e, nodeId) {
    if (!editMode) return;
    
    e.preventDefault();
    
    dragState = {
        isDragging: true,
        nodeId,
        startX: e.clientX,
        startY: e.clientY
    };
}

// Handle edge draw start
function handleEdgeDrawStart(e, nodeId, x, y) {
    if (!editMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    edgeDrawState = {
        isDrawing: true,
        fromNodeId: nodeId,
        fromX: x,
        fromY: y,
        toX: x,
        toY: y
    };
    
    updateEdgeDrawLine();
}

// Handle edge draw end
function handleEdgeDrawEnd(nodeId) {
    if (!editMode || !edgeDrawState.isDrawing || !edgeDrawState.fromNodeId) return;
    
    // Don't connect a node to itself
    if (edgeDrawState.fromNodeId === nodeId) {
        edgeDrawState = { isDrawing: false };
        updateEdgeDrawLine();
        return;
    }
    
    // Add the edge
    addEdge(edgeDrawState.fromNodeId, nodeId);
    
    // Reset drawing state
    edgeDrawState = { isDrawing: false };
    updateEdgeDrawLine();
}

// Handle mouse move
function handleMouseMove(e) {
    // Handle node dragging
    if (dragState.isDragging && dragState.nodeId) {
        const node = nodes.find(n => n.id === dragState.nodeId);
        if (!node || !dragState.startX || !dragState.startY) return;
        
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        
        // Update node position
        node.x += dx;
        node.y += dy;
        
        // Update node element
        const nodeElement = document.getElementById(`node-${node.id}`);
        if (nodeElement) {
            const circle = nodeElement.querySelector('circle');
            const text = nodeElement.querySelector('text');
            
            if (circle) {
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y);
            }
            
            if (text) {
                text.setAttribute('x', node.x);
                text.setAttribute('y', node.y + 5);
            }
        }
        
        // Update connected edges
        const connectedEdges = edges.filter(
            edge => edge.fromNodeId === node.id || edge.toNodeId === node.id
        );
        
        connectedEdges.forEach(edge => {
            const edgeElement = document.getElementById(`edge-${edge.id}`);
            if (!edgeElement) return;
            
            const fromNode = nodes.find(n => n.id === edge.fromNodeId);
            const toNode = nodes.find(n => n.id === edge.toNodeId);
            
            if (fromNode && toNode) {
                edgeElement.setAttribute('x1', fromNode.x);
                edgeElement.setAttribute('y1', fromNode.y);
                edgeElement.setAttribute('x2', toNode.x);
                edgeElement.setAttribute('y2', toNode.y);
            }
        });
        
        // Update drag start position
        dragState.startX = e.clientX;
        dragState.startY = e.clientY;
    }
    
    // Handle edge drawing
    if (edgeDrawState.isDrawing) {
        const rect = canvas.getBoundingClientRect();
        edgeDrawState.toX = e.clientX - rect.left;
        edgeDrawState.toY = e.clientY - rect.top;
        
        updateEdgeDrawLine();
    }
}

// Handle mouse up
function handleMouseUp() {
    // End node dragging
    if (dragState.isDragging) {
        dragState = { isDragging: false };
    }
    
    // End edge drawing
    if (edgeDrawState.isDrawing) {
        edgeDrawState = { isDrawing: false };
        updateEdgeDrawLine();
    }
}

// Handle add node button click
function handleAddNodeClick() {
    const label = nodeLabel.value.trim();
    if (!label) return;
    
    // Create node in center of canvas
    const canvasRect = canvas.getBoundingClientRect();
    const x = canvasRect.width / 2;
    const y = canvasRect.height / 2;
    
    addNode(label, x, y);
    nodeLabel.value = '';
}

// Handle add edge button click
function handleAddEdgeClick() {
    const fromId = parseInt(fromNodeSelect.value);
    const toId = parseInt(toNodeSelect.value);
    
    if (isNaN(fromId) || isNaN(toId) || fromId === toId) return;
    
    addEdge(fromId, toId);
    fromNodeSelect.value = '';
    toNodeSelect.value = '';
}

// Load a preset graph
function loadPreset(presetName) {
    clearGraph();
    
    switch (presetName) {
        case 'simple':
            loadSimpleGraph();
            break;
        case 'tree':
            loadBinaryTree();
            break;
        case 'connected':
            loadConnectedGraph();
            break;
        case 'complex':
            loadComplexGraph();
            break;
    }
}

// Load simple graph preset
function loadSimpleGraph() {
    const nodeA = addNode('A', 100, 100);
    const nodeB = addNode('B', 250, 100);
    const nodeC = addNode('C', 400, 100);
    const nodeD = addNode('D', 175, 200);
    const nodeE = addNode('E', 325, 200);
    
    addEdge(nodeA.id, nodeB.id);
    addEdge(nodeB.id, nodeC.id);
    addEdge(nodeA.id, nodeD.id);
    addEdge(nodeB.id, nodeE.id);
    addEdge(nodeD.id, nodeE.id);
}

// Load binary tree preset
function loadBinaryTree() {
    const nodeA = addNode('A', 250, 50);
    const nodeB = addNode('B', 150, 150);
    const nodeC = addNode('C', 350, 150);
    const nodeD = addNode('D', 100, 250);
    const nodeE = addNode('E', 200, 250);
    const nodeF = addNode('F', 300, 250);
    const nodeG = addNode('G', 400, 250);
    
    addEdge(nodeA.id, nodeB.id);
    addEdge(nodeA.id, nodeC.id);
    addEdge(nodeB.id, nodeD.id);
    addEdge(nodeB.id, nodeE.id);
    addEdge(nodeC.id, nodeF.id);
    addEdge(nodeC.id, nodeG.id);
}

// Load connected graph preset
function loadConnectedGraph() {
    const nodeA = addNode('A', 200, 100);
    const nodeB = addNode('B', 350, 100);
    const nodeC = addNode('C', 125, 200);
    const nodeD = addNode('D', 275, 200);
    const nodeE = addNode('E', 425, 200);
    const nodeF = addNode('F', 200, 300);
    const nodeG = addNode('G', 350, 300);
    
    addEdge(nodeA.id, nodeB.id);
    addEdge(nodeA.id, nodeC.id);
    addEdge(nodeA.id, nodeD.id);
    addEdge(nodeB.id, nodeD.id);
    addEdge(nodeB.id, nodeE.id);
    addEdge(nodeC.id, nodeF.id);
    addEdge(nodeD.id, nodeF.id);
    addEdge(nodeD.id, nodeG.id);
    addEdge(nodeE.id, nodeG.id);
    addEdge(nodeF.id, nodeG.id);
}

// Load complex graph preset
function loadComplexGraph() {
    const nodeA = addNode('A', 200, 100);
    const nodeB = addNode('B', 350, 100);
    const nodeC = addNode('C', 125, 200);
    const nodeD = addNode('D', 275, 200);
    const nodeE = addNode('E', 425, 200);
    const nodeF = addNode('F', 125, 300);
    const nodeG = addNode('G', 275, 300);
    const nodeH = addNode('H', 425, 300);
    
    addEdge(nodeA.id, nodeB.id);
    addEdge(nodeA.id, nodeC.id);
    addEdge(nodeA.id, nodeD.id);
    addEdge(nodeB.id, nodeD.id);
    addEdge(nodeB.id, nodeE.id);
    addEdge(nodeC.id, nodeD.id);
    addEdge(nodeC.id, nodeF.id);
    addEdge(nodeD.id, nodeE.id);
    addEdge(nodeD.id, nodeG.id);
    addEdge(nodeE.id, nodeH.id);
    addEdge(nodeF.id, nodeG.id);
    addEdge(nodeG.id, nodeH.id);
}

// Initialize the application
init();