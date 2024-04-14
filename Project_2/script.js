async function displayCode(){
    try{
        const response = await fetch('lazyBotCode.js');
        const text = await response.text();
        document.getElementById('lazyBotCodeDisplay').textContent = text;
    }catch(error){
        console.error('Error catching lazyBotCode.js', error);
        document.getElementById('lazyBotCodeDisplay').textContent = 'Error loading lazyBotCode.js'
    }
}