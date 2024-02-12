async function displayCode() {
    try {
        const response = await fetch('code.js'); // Adjust the path if necessary
        const text = await response.text();
        document.getElementById('codeDisplay').textContent = text;
    } catch (error) {
        console.error('Error fetching the code:', error);
        document.getElementById('codeDisplay').textContent = 'Error loading the code.';
    }
}

displayCode(); // Call the function to display the code