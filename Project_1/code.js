//NewsAPI
let fetchNewsBTN = document.getElementById('fetchNews')
let analyzeBTN = document.getElementById('analyzeButton')

let newsText = "";

async function fetchNews() {
    //store ApiKey
    const apiKey = 'YOUR_API_KEY';
    const keyword = document.getElementById('keyword').value; //store the input keywords
    // Construct the request URL with the user's keyword
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&pageSize=5&apiKey=${apiKey}`;
    console.log(url)

    try {
        const response = await fetch(url);// Attempt to fetch the news data
        const data = await response.json();// Parse the JSON response
        displayNews(data.articles); // call displayNews() funtion to display the article
    } catch (error) {
        console.error('Error fetching news:', error);
        document.getElementById('news-container').innerHTML = '<p>Error loading news. Please try again later.</p >';
    }
};

//function for news article display
function displayNews(articles) {
  const container = document.getElementById('news-container');
  container.innerHTML = ''; // Clear previous results
  newsText = ""; //Reset newsText for new fetch

  // Iterate over each article and create its HTML representation
  articles.forEach(article => {
      let news = document.createElement('div');
      news.className = 'news-item';
      let Img = document.createElement('img')
      Img.src = article.urlToImage
      Img.alt = article.title
      Img.classList.add('news-image')
      let newsDescription = article.description;

      //Concatenate descriptions for frequency analysis 
      newsText += newsDescription + " "; 

      // Set the inner HTML of the news item
      news.innerHTML = `
          <h2><a href=" " target="_blank">${article.title}</a ></h2>
          <p>Published: ${article.publishedAt}</p >
          <p>Description: ${newsDescription}</p >
      `; //Use `, because "" change everything to string

      // Append the image and the news item to the container
      news.appendChild(Img)
      container.appendChild(news);
  });
}

// Add event listener to the fetch button
fetchNewsBTN.addEventListener('click', fetchNews)




//Word Frequency
let top5Words = []; // Initialize an array to store the top 5 most frequent words
function analyzeFrequency() {
  var words = newsText.split(/\s+/);// Split the newsText into individual words based on spaces
  var frequency = {};// Object to hold the frequency of each word

  // Iterate over each word in the array
  words.forEach(function(word) {
      if (!word) return; // Skip empty strings
      /* Check if the first character is uppercase and not a number
      ,isNaN() ensure the first character of the word is not a number*/
      if(word[0] === word[0].toUpperCase() && isNaN(word[0])){ 
       // Initialize the word count in the frequency object if it doesn't exist
      if (!frequency[word]) {
         frequency[word] = 0;
      }
      // Increment the count for the word
      frequency[word] += 1;
      }
  });

  // Convert the frequency object into an array of [word, frequency] pairs
  var sortedFrequency = [];
  for (var word in frequency) {
      /*(method) Object.hasOwnProperty(v: PropertyKey): boolean
      Determines whether an object has a property with the specified name.*/
      if (frequency.hasOwnProperty(word)) {
          /*(method) Array<any>.push(...items: any[]): number
          Appends new elements to the end of an array, and returns the new length of the array.*/
          sortedFrequency.push([word, frequency[word]]);
      }
  }

  // Sort the array based on frequency in descending order
  //The default sort order for .sort method is ascending
  /*`function(a, b) { return b[1] - a[1]; }`: This is a comparison function
   that the .sort() method uses to determine the order of the elements. 
   a and b, represent any two elements from the array. a[1] and b[1] are the frequency of words*/
  sortedFrequency.sort(function(a, b) {
      return b[1] - a[1];
  });
  /* The result of this subtraction determines the sort order:
  If the result is negative, b is placed before a.
  If the result is positive, a is placed before b.
  If the result is zero, no change is made with respect to the order of a and b,
  but they will be sorted with respect to all different elements. */

  // Extract the top 5 words from the sorted array
  /*The .map() method creates a new array populated with the results of calling 
  a provided function on every element in the calling array. In this context, the 
  provided function takes each element (wordInfo) from the sliced array and returns
   the first element of each of those elements (wordInfo[0]).*/
  top5Words = sortedFrequency.slice(0, 5).map(function(wordInfo) {
    // Return only the word, not its frequency
    return wordInfo[0]; 
  });

  // Display the results using the displayResults function
  displayResults(sortedFrequency);
}

// Function to display the top 5 words as buttons in the results div
function displayResults(sortedFrequency) {
  var resultsDiv = document.getElementById("results");// Get the results div by its ID
  resultsDiv.innerHTML = ''; // Clear previous results

  //Display only the 5 most frequent words in the list
  sortedFrequency.slice(0,5).forEach(function(wordInfo){
    let wordButton = document.createElement("button");//Create button element 
    wordButton.textContent = wordInfo[0] //The word itself as button text
    /* wordInfo[0] is the word, wordInfo[1] is the number of the frequency,
    we are only passing the word itself to fetchAndDisplay function*/
    wordButton.classList.add("word-button") //Add a class for styling seperately
    wordButton.addEventListener("click", function(){
      fetchAndDisplayJoke(wordInfo[0]); // Pass the word as an argument
    })
  
    resultsDiv.appendChild(wordButton); // Add the button to the results div
  })
}

// Add event listener to the analyze button
analyzeBTN.addEventListener('click', analyzeFrequency)




//JokeApi
let jokeAPI = 'https://v2.jokeapi.dev/joke/Any';
let jokeDisplay = document.getElementById('joke');
let randomJokeBTN = document.getElementById('newJokeButton');
let searchBTN = document.getElementById('searchButton');


// Function to fetch and display a joke based on a search keyword or randomly
function fetchAndDisplayJoke(searchKeyword = "") {
    // Start with the base URL for the joke API
    let localJokeAPI = jokeAPI; 

    /* Determine the keywords for the search, using the clicked word or top5Words,
    Ensure keywords is defined within the function scope*/
    let keywords = ""; 
    // Check if a search keyword is provided and after .trim() is a non-empty string
    if (typeof searchKeyword === "string" && searchKeyword.trim() !== '') {
        // Use the provided search keyword, trimming any leading/trailing whitespace
        keywords = searchKeyword.trim() !== '' ? searchKeyword.trim() : top5Words.join(", ");
        // Append the keyword to the API URL for a targeted joke search
        localJokeAPI += `?contains=${encodeURIComponent(searchKeyword.trim())}&amount=1`;
    } else if (!searchKeyword && top5Words.length > 0) {
      // If no specific keyword is provided but there are top 5 words, use them
      keywords = top5Words.join(", ")
      // Append the top 5 words to the API URL if they are not empty
      if (keywords.trim() !==''){
        localJokeAPI += `?contains=${encodeURIComponent(keywords)}&amount=1`;
      }
    }
    // If no keywords are provided, the API URL remains unchanged for a random joke

    // Fetch the joke from the API
    fetchJoke(localJokeAPI);
}

// Function to perform the API call and handle the response
let fetchJoke = (jokeAPIUrl)=>{
    fetch(jokeAPIUrl)
        .then(response => response.json())// Parse the JSON response
        .then(data => displayJoke(data))// Display the joke data
        .catch(error => failCatch);
}

// Function to display the joke data in the HTML
let displayJoke = (data)=>{
    let jokeText = '';
        if (data.error) {
            jokeText = 'No joke found for your search.';
        } else if (data.type === 'single') {
            /*checks if the joke is of type 'single'. If data.type is equal to 'single', 
            it means the joke does not have a separate setup and punchline; instead, 
            the entire joke is contained in a single string. In this case, jokeText is s
            et to the value of data.joke, which is the text of the joke. */
            jokeText = data.joke;
        } else {
            /* if the joke is not of type 'single' and there's no error in the data. 
            This is where two-part jokes are handled, which consist of a setup and a delivery. 
            The text for these jokes is constructed by combining data.setup and data.delivery 
            with a <br> tag in between, which is an HTML line break. This ensures that the setup 
            and delivery are displayed on separate lines in the web page. */
            jokeText = `${data.setup} <br> ${data.delivery}`;
        }
        jokeDisplay.innerHTML = jokeText; // Update the joke display element
}

// Error handling function
let failCatch = (error)=>{
    console.error('Error:', error);
    jokeDisplay.innerHTML = 'Failed to load joke.';
}

// Load an initial joke when the window loads
window.onload = () => fetchAndDisplayJoke();

// Attach event listeners to buttons for fetching jokes
randomJokeBTN.addEventListener('click', fetchAndDisplayJoke);
searchBTN.addEventListener('click', fetchAndDisplayJoke);
