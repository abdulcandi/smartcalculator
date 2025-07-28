// --- Calculator Logic ---
const display = document.getElementById('display');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function calculateResult() {
    try {
        // Using eval() for simplicity, but it can be a security risk with user input.
        // For a production app, a custom parser would be safer.
        const result = eval(display.value);
        if (result === Infinity || isNaN(result)) {
            display.value = 'Error';
        } else {
            display.value = result;
        }
    } catch (error) {
        display.value = 'Error';
    }
}

// --- Text Storage Logic ---
const textInput = document.getElementById('text-input');
const wordCountDisplay = document.getElementById('word-count');
const saveButton = document.getElementById('save-text');
const statusDiv = document.getElementById('status');
const MAX_WORDS = 750;

// Function to update the word count
function updateWordCount() {
    const text = textInput.value.trim();
    // Split by one or more whitespace characters
    const words = text ? text.split(/\s+/) : [];
    const currentWordCount = words.length;
    wordCountDisplay.textContent = currentWordCount;

    if (currentWordCount > MAX_WORDS) {
        wordCountDisplay.style.color = '#c0392b'; // Red
        // Truncate the text to the word limit
        const truncatedText = words.slice(0, MAX_WORDS).join(' ');
        textInput.value = truncatedText;
        // Recalculate count after truncation
        wordCountDisplay.textContent = MAX_WORDS;
    } else {
        wordCountDisplay.style.color = '#555'; // Default color
    }
}

// Event listener for text input
textInput.addEventListener('input', updateWordCount);

// Event listener for the save button
saveButton.addEventListener('click', () => {
    localStorage.setItem('savedText', textInput.value);
    statusDiv.textContent = 'Text saved successfully!';
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 3000); // Clear message after 3 seconds
});

// Load saved text when the page loads
window.addEventListener('load', () => {
    const savedText = localStorage.getItem('savedText');
    if (savedText) {
        textInput.value = savedText;
        updateWordCount(); // Update word count on load
    }
});

// --- Bluetooth Transfer Logic ---
const transferButton = document.getElementById('transfer-text');

transferButton.addEventListener('click', async () => {
    if (!navigator.bluetooth) {
        statusDiv.textContent = 'Web Bluetooth API is not available.';
        return;
    }

    try {
        statusDiv.textContent = 'Requesting Bluetooth device...';
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            // IMPORTANT: You MUST specify a service the target device advertises.
            // This is a generic example for a device with a Battery Service.
            // You will need to change this to a service your target device uses
            // for receiving text/data.
            optionalServices: ['battery_service'] 
        });

        statusDiv.textContent = `Connecting to ${device.name}...`;
        const server = await device.gatt.connect();

        // IMPORTANT: Replace with the actual Service and Characteristic UUIDs
        // of the receiving device.
        const serviceUUID = 'battery_service';
        const characteristicUUID = 'battery_level';

        statusDiv.textContent = 'Getting Service...';
        const service = await server.getPrimaryService(serviceUUID);

        statusDiv.textContent = 'Getting Characteristic...';
        const characteristic = await service.getCharacteristic(characteristicUUID);

        const textToSend = new TextEncoder().encode(textInput.value);
        statusDiv.textContent = 'Sending data...';

        // Writing the value to the characteristic
        await characteristic.writeValue(textToSend);

        statusDiv.textContent = 'Data sent successfully!';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 5000);

    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        console.error('Bluetooth Error:', error);
    }
});
  
