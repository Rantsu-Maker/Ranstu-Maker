function luckySearch() {
    const searchBox = document.querySelector('.search-box');
    const query = searchBox.value.trim();
    
    if (query) {
        // "Onnekas hetki" -painike ohjaa Google Luckyyn
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
    } else {
        alert('Kirjoita hakusana ensin!');
    }
}

// Enter-näppäin lähtee hakuun
document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.querySelector('.search-box');
    searchBox.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.querySelector('form').submit();
        }
    });
});