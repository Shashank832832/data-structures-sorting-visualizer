// DOM Elements
const stackContainer = document.getElementById("stack");
const topBox = document.getElementById("topBox");
const arraySizeInput = document.getElementById("arraySize");
const elementInput = document.getElementById("element");
const createBtn = document.getElementById("createBtn");
const pushBtn = document.getElementById("pushBtn");
const popBtn = document.getElementById("popBtn");
const clearBtn = document.getElementById("clearBtn");
const peekBtn = document.getElementById("peekBtn");
const peekValueDisplay = document.getElementById("peekValue");

// Stack variables
let stack = [];
let maxSize = 0;
let topIndex = -1;

// Event Listeners
createBtn.addEventListener('click', createStack);
pushBtn.addEventListener('click', push);
popBtn.addEventListener('click', pop);
clearBtn.addEventListener('click', clearStack);
peekBtn.addEventListener('click', peek);

// Handle Enter key for inputs
arraySizeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createStack();
});

elementInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') push();
});

// Stack functions
function createStack() {
    maxSize = parseInt(arraySizeInput.value);
    if (isNaN(maxSize) || maxSize <= 0) {
        alert("Please enter a valid positive number");
        arraySizeInput.focus();
        return;
    }
    stack = new Array(maxSize).fill(null);
    topIndex = -1;
    peekValueDisplay.textContent = "";
    updateStack();
}

function updateStack() {
    stackContainer.innerHTML = "";
    stack.forEach((value, index) => {
        const div = document.createElement("div");
        div.className = "stack-element";
        div.textContent = value !== null ? value : "";
        
        const label = document.createElement("div");
        label.className = "index-label";
        label.textContent = index;
        
        div.appendChild(label);
        stackContainer.appendChild(div);
    });
    topBox.textContent = topIndex;
}

function push() {
    if (topIndex >= maxSize - 1) {
        alert("Stack overflow!");
        return;
    }
    const value = elementInput.value;
    if (value === "") {
        alert("Please enter a value");
        elementInput.focus();
        return;
    }
    animatePush(value);
}

// ... (keep all previous code until animatePush function)

function animatePush(value) {
    const circle = document.createElement("div");
    circle.className = "circle";
    document.body.appendChild(circle);
    
    // Get positions relative to the document
    const topRect = topBox.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Position circle over the top box
    circle.style.position = "absolute";
    circle.style.left = `${topRect.left + scrollX}px`;
    circle.style.top = `${topRect.top + scrollY}px`;
    
    setTimeout(() => {
        const targetBox = document.getElementsByClassName("stack-element")[topIndex + 1];
        const targetRect = targetBox.getBoundingClientRect();
        
        // Calculate final position accounting for scroll
        const finalLeft = targetRect.left + scrollX;
        const finalTop = targetRect.top + scrollY;
        
        // Animate to target position
        circle.style.transform = `translate(${finalLeft - (topRect.left + scrollX)}px, ${finalTop - (topRect.top + scrollY)}px)`;
        
        setTimeout(() => {
            stack[topIndex + 1] = value;
            topIndex++;
            updateStack();
            document.body.removeChild(circle);
            elementInput.value = "";
            peekValueDisplay.textContent = "";
        }, 1000);
    }, 1000);
}

// ... (rest of the code remains the same)

function pop() {
    if (topIndex < 0) {
        alert("Stack underflow!");
        return;
    }
    const poppedValue = stack[topIndex];
    stack[topIndex] = null;
    topIndex--;
    updateStack();
    peekValueDisplay.textContent = `Popped: ${poppedValue}`;
}

function peek() {
    if (topIndex < 0) {
        peekValueDisplay.textContent = "Stack is empty!";
        return;
    }
    peekValueDisplay.textContent = `Top element: ${stack[topIndex]}`;
}



function peek() {
    if (topIndex < 0) {
        peekValueDisplay.textContent = "Stack is empty!";
        return;
    }
    
    // Highlight the top element
    const topElement = document.getElementsByClassName("stack-element")[topIndex];
    topElement.classList.add("peek-highlight");
    
    // Display the peeked value
    peekValueDisplay.textContent = `Top element: ${stack[topIndex]}`;
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
        topElement.classList.remove("peek-highlight");
    }, 2000);
}



function clearStack() {
    if (stack.length === 0) return;
    stack.fill(null);
    topIndex = -1;
    updateStack();
    peekValueDisplay.textContent = "Stack cleared!";
}