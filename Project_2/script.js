async function displayCode(file, display){
    try{
        const response = await fetch(file);
        const text = await response.text();
        document.getElementById(display).textContent = text;
    }catch(error){
        console.error(`Error catching ${file}`, error);
        document.getElementById(display).textContent = `Error loading ${file}`
    }
}

displayCode('lazyBotCode.py','lazyBotCodeDisplay');
displayCode('parallelBotCode.py','parallelBotCode');