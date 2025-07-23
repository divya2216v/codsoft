// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const calculator = document.querySelector('.calculator');
const display = document.querySelector('.display');
const historyDisplay = document.querySelector('.history');
const currentInput = document.querySelector('.current-input');
const buttons = document.querySelectorAll('.btn');
const bubbles = document.querySelectorAll('.bubble');

// Calculator State
let state = {
    currentValue: '0',
    previousValue: null,
    operator: null,
    waitingForOperand: false,
    memory: 0,
    history: [],
    lastAnswer: 0,
    degreeMode: true // true for degrees, false for radians
};

// Initialize the calculator
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize theme from local storage or system preference
    initializeTheme();
    
    // Initialize background animations
    initializeAnimations();
}

// Set up event listeners
function setupEventListeners() {
    // Button click events
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            handleButtonClick(button);
            animateButtonPress(button);
        });
    });
    
    // Theme toggle event
    themeSwitch.addEventListener('change', toggleTheme);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyboardInput);
}

// Initialize theme
function initializeTheme() {
    // Check local storage for saved theme
    const savedTheme = localStorage.getItem('calculatorTheme');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    } else if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeSwitch.checked = false;
    } else {
        // Check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            themeSwitch.checked = true;
        }
    }
}

// Initialize animations
function initializeAnimations() {
    // Randomize bubble positions and animations
    bubbles.forEach(bubble => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 10;
        const randomDuration = 15 + Math.random() * 10;
        
        bubble.style.left = `${randomX}%`;
        bubble.style.animationDelay = `${randomDelay}s`;
        bubble.style.animationDuration = `${randomDuration}s`;
    });
}

// Toggle theme
function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('calculatorTheme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('calculatorTheme', 'light');
    }
}

// Handle button clicks
function handleButtonClick(button) {
    const action = button.dataset.action;
    const value = button.dataset.value;
    
    if (value) {
        inputDigit(value);
    } else if (action) {
        switch (action) {
            case 'clear':
                clearAll();
                break;
            case 'delete':
                deleteLastDigit();
                break;
            case 'percent':
                calculatePercent();
                break;
            case 'divide':
            case 'multiply':
            case 'subtract':
            case 'add':
                handleOperator(action);
                break;
            case 'calculate':
                calculate();
                break;
            case 'sin':
                calculateTrigFunction('sin');
                break;
            case 'cos':
                calculateTrigFunction('cos');
                break;
            case 'tan':
                calculateTrigFunction('tan');
                break;
            case 'log':
                calculateLog();
                break;
            case 'ln':
                calculateLn();
                break;
            case 'sqrt':
                calculateSqrt();
                break;
            case 'power':
                handleOperator('power');
                break;
            case 'pi':
                inputPi();
                break;
            case 'e':
                inputE();
                break;
            case 'factorial':
                calculateFactorial();
                break;
            case 'abs':
                calculateAbs();
                break;
            case 'exp':
                handleOperator('exp');
                break;
            case 'ans':
                inputLastAnswer();
                break;
        }
    }
    
    updateDisplay();
}

// Handle keyboard input
function handleKeyboardInput(event) {
    const key = event.key;
    
    // Prevent default behavior for calculator keys
    if (
        /[0-9]/.test(key) ||
        key === '.' ||
        key === '+' ||
        key === '-' ||
        key === '*' ||
        key === '/' ||
        key === 'Enter' ||
        key === '=' ||
        key === 'Escape' ||
        key === 'Backspace' ||
        key === '%'
    ) {
        event.preventDefault();
    }
    
    // Map keyboard keys to calculator functions
    if (/[0-9]/.test(key)) {
        inputDigit(key);
    } else if (key === '.') {
        inputDigit('.');
    } else if (key === '+') {
        handleOperator('add');
    } else if (key === '-') {
        handleOperator('subtract');
    } else if (key === '*') {
        handleOperator('multiply');
    } else if (key === '/') {
        handleOperator('divide');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteLastDigit();
    } else if (key === '%') {
        calculatePercent();
    } else if (key === '^') {
        handleOperator('power');
    } else if (key === 'p' || key === 'P') {
        inputPi();
    } else if (key === 'e' || key === 'E') {
        inputE();
    }
    
    updateDisplay();
}

// Input digit
function inputDigit(digit) {
    const { currentValue, waitingForOperand } = state;
    
    if (waitingForOperand) {
        state.currentValue = digit;
        state.waitingForOperand = false;
    } else {
        state.currentValue = currentValue === '0' ? digit : currentValue + digit;
    }
}

// Input decimal point
function inputDecimal() {
    const { currentValue, waitingForOperand } = state;
    
    if (waitingForOperand) {
        state.currentValue = '0.';
        state.waitingForOperand = false;
        return;
    }
    
    if (!currentValue.includes('.')) {
        state.currentValue = currentValue + '.';
    }
}

// Input Pi
function inputPi() {
    state.currentValue = Math.PI.toString();
    state.waitingForOperand = false;
}

// Input E (Euler's number)
function inputE() {
    state.currentValue = Math.E.toString();
    state.waitingForOperand = false;
}

// Input last answer
function inputLastAnswer() {
    state.currentValue = state.lastAnswer.toString();
    state.waitingForOperand = false;
}

// Handle operator
function handleOperator(operator) {
    const { currentValue, previousValue, operator: previousOperator } = state;
    const inputValue = parseFloat(currentValue);
    
    if (previousValue === null) {
        state.previousValue = inputValue;
    } else if (previousOperator) {
        const result = performCalculation(previousOperator, previousValue, inputValue);
        state.currentValue = String(result);
        state.previousValue = result;
    }
    
    state.waitingForOperand = true;
    state.operator = operator;
    
    // Update history display
    updateHistoryDisplay();
}

// Calculate
function calculate() {
    const { currentValue, previousValue, operator } = state;
    
    if (previousValue === null || operator === null) {
        return;
    }
    
    const inputValue = parseFloat(currentValue);
    const result = performCalculation(operator, previousValue, inputValue);
    
    // Add to history
    const calculation = {
        firstOperand: previousValue,
        operator: operator,
        secondOperand: inputValue,
        result: result
    };
    
    state.history.push(calculation);
    
    // Update state
    state.currentValue = String(result);
    state.previousValue = null;
    state.operator = null;
    state.waitingForOperand = true;
    state.lastAnswer = result;
    
    // Show success animation
    showSuccessAnimation();
    
    // Update history display
    updateHistoryDisplay();
}

// Perform calculation
function performCalculation(operator, firstOperand, secondOperand) {
    switch (operator) {
        case 'add':
            return firstOperand + secondOperand;
        case 'subtract':
            return firstOperand - secondOperand;
        case 'multiply':
            return firstOperand * secondOperand;
        case 'divide':
            if (secondOperand === 0) {
                showErrorAnimation();
                return 'Error';
            }
            return firstOperand / secondOperand;
        case 'power':
            return Math.pow(firstOperand, secondOperand);
        case 'exp':
            return firstOperand * Math.pow(10, secondOperand);
        default:
            return secondOperand;
    }
}

// Calculate percent
function calculatePercent() {
    const { currentValue } = state;
    const value = parseFloat(currentValue);
    
    state.currentValue = String(value / 100);
}

// Calculate trigonometric function
function calculateTrigFunction(func) {
    const { currentValue, degreeMode } = state;
    const value = parseFloat(currentValue);
    let result;
    
    // Convert degrees to radians if in degree mode
    const angleInRadians = degreeMode ? value * (Math.PI / 180) : value;
    
    switch (func) {
        case 'sin':
            result = Math.sin(angleInRadians);
            break;
        case 'cos':
            result = Math.cos(angleInRadians);
            break;
        case 'tan':
            result = Math.tan(angleInRadians);
            break;
    }
    
    // Handle very small numbers close to zero
    if (Math.abs(result) < 1e-10) {
        result = 0;
    }
    
    state.currentValue = String(result);
    state.waitingForOperand = true;
}

// Calculate logarithm (base 10)
function calculateLog() {
    const { currentValue } = state;
    const value = parseFloat(currentValue);
    
    if (value <= 0) {
        showErrorAnimation();
        state.currentValue = 'Error';
        return;
    }
    
    state.currentValue = String(Math.log10(value));
    state.waitingForOperand = true;
}

// Calculate natural logarithm
function calculateLn() {
    const { currentValue } = state;
    const value = parseFloat(currentValue);
    
    if (value <= 0) {
        showErrorAnimation();
        state.currentValue = 'Error';
        return;
    }
    
    state.currentValue = String(Math.log(value));
    state.waitingForOperand = true;
}

// Calculate square root
function calculateSqrt() {
    const { currentValue } = state;
    const value = parseFloat(currentValue);
    
    if (value < 0) {
        showErrorAnimation();
        state.currentValue = 'Error';
        return;
    }
    
    state.currentValue = String(Math.sqrt(value));
    state.waitingForOperand = true;
}

// Calculate factorial
function calculateFactorial() {
    const { currentValue } = state;
    const value = parseInt(currentValue);
    
    if (value < 0 || !Number.isInteger(value)) {
        showErrorAnimation();
        state.currentValue = 'Error';
        return;
    }
    
    let result = 1;
    for (let i = 2; i <= value; i++) {
        result *= i;
        
        // Check for overflow
        if (!isFinite(result)) {
            showErrorAnimation();
            state.currentValue = 'Overflow';
            return;
        }
    }
    
    state.currentValue = String(result);
    state.waitingForOperand = true;
}

// Calculate absolute value
function calculateAbs() {
    const { currentValue } = state;
    const value = parseFloat(currentValue);
    
    state.currentValue = String(Math.abs(value));
    state.waitingForOperand = true;
}

// Clear all
function clearAll() {
    state.currentValue = '0';
    state.previousValue = null;
    state.operator = null;
    state.waitingForOperand = false;
    historyDisplay.textContent = '';
}

// Delete last digit
function deleteLastDigit() {
    const { currentValue } = state;
    
    if (currentValue.length === 1 || currentValue === 'Error' || currentValue === 'Overflow') {
        state.currentValue = '0';
    } else {
        state.currentValue = currentValue.slice(0, -1);
    }
}

// Update display
function updateDisplay() {
    // Format the current value for display
    let displayValue = state.currentValue;
    
    // Handle error states
    if (displayValue === 'Error' || displayValue === 'Overflow') {
        currentInput.textContent = displayValue;
        return;
    }
    
    // Format number with commas for thousands
    if (!isNaN(parseFloat(displayValue)) && isFinite(displayValue)) {
        const [integerPart, decimalPart] = displayValue.split('.');
        let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        displayValue = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    }
    
    currentInput.textContent = displayValue;
}

// Update history display
function updateHistoryDisplay() {
    const { previousValue, operator, currentValue } = state;
    
    if (previousValue !== null && operator) {
        let operatorSymbol;
        switch (operator) {
            case 'add': operatorSymbol = '+'; break;
            case 'subtract': operatorSymbol = '−'; break;
            case 'multiply': operatorSymbol = '×'; break;
            case 'divide': operatorSymbol = '÷'; break;
            case 'power': operatorSymbol = '^'; break;
            case 'exp': operatorSymbol = 'E'; break;
            default: operatorSymbol = operator;
        }
        
        historyDisplay.textContent = `${previousValue} ${operatorSymbol}`;
    } else {
        historyDisplay.textContent = '';
    }
}

// Button press animation
function animateButtonPress(button) {
    button.classList.add('btn-press');
    setTimeout(() => {
        button.classList.remove('btn-press');
    }, 200);
}

// Error animation
function showErrorAnimation() {
    currentInput.classList.add('error-shake');
    setTimeout(() => {
        currentInput.classList.remove('error-shake');
    }, 500);
}

// Success animation
function showSuccessAnimation() {
    currentInput.classList.add('success-pulse');
    setTimeout(() => {
        currentInput.classList.remove('success-pulse');
    }, 500);
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);