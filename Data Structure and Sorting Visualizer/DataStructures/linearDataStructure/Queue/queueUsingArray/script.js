// DOM Elements
const arrayContainer = document.getElementById("array");
const frontBox = document.getElementById("frontBox");
const backBox = document.getElementById("backBox");
const statusDiv = document.getElementById("status");
const arraySizeInput = document.getElementById("arraySize");
const elementInput = document.getElementById("element");
const createBtn = document.getElementById("createBtn");
const enqueueBtn = document.getElementById("enqueueBtn");
const dequeueBtn = document.getElementById("dequeueBtn");
const clearBtn = document.getElementById("clearBtn");

// Queue variables
let queue = [];
let maxSize = 0;
let front = -1;
let back = -1;
let isAnimating = false;

// Event Listeners
createBtn.addEventListener('click', createQueue);
enqueueBtn.addEventListener('click', enqueue);
dequeueBtn.addEventListener('click', dequeue);
clearBtn.addEventListener('click', clearQueue);

// Handle Enter key for inputs
arraySizeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createQueue();
});

elementInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enqueue();
});

// Queue functions
function createQueue() {
    maxSize = parseInt(arraySizeInput.value);
    if (isNaN(maxSize) || maxSize <= 0) {
        showStatus("Please enter a valid positive number", "error");
        arraySizeInput.focus();
        return;
    }
    queue = new Array(maxSize).fill(null);
    front = -1;
    back = -1;
    updateQueue();
    showStatus("✅ Queue created with size " + maxSize, "success");
}

function updateQueue() {
    arrayContainer.innerHTML = "";
    queue.forEach((value, index) => {
        const element = document.createElement("div");
        element.className = "queue-element";
        element.textContent = value !== null ? value : "";
        element.id = "queue-element-" + index;
        
        const label = document.createElement("div");
        label.className = "index-label";
        label.textContent = index;
        
        element.appendChild(label);
        arrayContainer.appendChild(element);
    });
    
    frontBox.textContent = front;
    backBox.textContent = back;
}

function enqueue() {
    if (isAnimating) return;
    
    if (maxSize === 0) {
        showStatus("⚠️ Please create a queue first", "error");
        return;
    }
    
    if (isFull()) {
        showStatus("⚠️ Queue is full!", "error");
        return;
    }
    
    const value = elementInput.value.trim();
    if (value === "") {
        showStatus("⚠️ Please enter a value", "error");
        elementInput.focus();
        return;
    }
    
    isAnimating = true;
    
    // Calculate new back position
    const newBack = isEmpty() ? 0 : (back + 1) % maxSize;
    
    // Create circle around back pointer box
    const backBoxRect = backBox.getBoundingClientRect();
    const circle = document.createElement("div");
    circle.className = "highlight-circle pulse-effect";
    circle.style.left = (backBoxRect.left + window.scrollX) + "px";
    circle.style.top = (backBoxRect.top + window.scrollY) + "px";
    document.body.appendChild(circle);
    
    // Update back pointer immediately
    back = newBack;
    backBox.textContent = back;
    
    setTimeout(() => {
        // Move circle to the new queue position
        const targetElement = document.getElementById("queue-element-" + back);
        if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            circle.style.left = (targetRect.left + window.scrollX) + "px";
            circle.style.top = (targetRect.top + window.scrollY) + "px";
            
            setTimeout(() => {
                // Update queue after animation
                if (front === -1) {
                    front = 0;
                    frontBox.textContent = front;
                }
                
                queue[back] = value;
                updateQueue();
                showStatus("✅ Enqueued: " + value, "success");
                elementInput.value = "";
                
                // Remove circle
                document.body.removeChild(circle);
                
                // Add green glowing effect to the new element
                const newElement = document.getElementById("queue-element-" + back);
                newElement.classList.add("glow-effect");
                
                // Remove glow after animation completes
                setTimeout(() => {
                    newElement.classList.remove("glow-effect");
                    isAnimating = false;
                }, 1000);
            }, 1000);
        }
    }, 1000);
}

function dequeue() {
    if (isAnimating) return;
    
    if (isEmpty()) {
        showStatus("⚠️ Queue is empty!", "error");
        return;
    }
    
    isAnimating = true;
    
    // Highlight the element being dequeued
    const frontElement = document.getElementById("queue-element-" + front);
    if (frontElement) {
        frontElement.style.borderColor = "#f44336";
        frontElement.style.boxShadow = "0 0 10px #f44336";
        
        setTimeout(() => {
            const value = queue[front];
            queue[front] = null;
            
            if (front === back) {
                front = -1;
                back = -1;
            } else {
                front = (front + 1) % maxSize;
            }
            
            updateQueue();
            showStatus("✅ Dequeued: " + value, "success");
            isAnimating = false;
        }, 1000);
    }
}

function clearQueue() {
    if (isAnimating) return;
    
    if (maxSize === 0) return;
    queue.fill(null);
    front = -1;
    back = -1;
    updateQueue();
    showStatus("✅ Queue cleared", "success");
}

function isEmpty() {
    return front === -1 && back === -1;
}

function isFull() {
    return (back + 1) % maxSize === front;
}

function showStatus(msg, type = "info") {
    statusDiv.textContent = msg;
    statusDiv.className = "status " + type;
    
    setTimeout(() => {
        statusDiv.className = "status";
    }, 3000);
}