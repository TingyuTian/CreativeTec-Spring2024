async function displayCode(){
    try{
        const response = await fetch(lazyBotCode.py);
        const text = await response.text();
        document.getElementById(codeDisplay).textContent = text;
    }catch(error){
        console.error('Error cathing lazyBotCode.py', error);
        document.getElementById(codeDisplay).textContent = 'Error loading lazyBotCode.py'
    }
}