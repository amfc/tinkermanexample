function Application() {
    this.parameters = {};

    this.load = function()
    {
        DOM_AddObjEventListener(this, document.getElementById('searchInput'), 'keyup', this.onInputKeyup);
        this.searchForMovies({ getBriefInfo: 1});
        this.detailWindow = new DetailWindow;
        document.getElementById('searchInput').focus();
    }
    
    this.lastSearch = '';
    
    this.onInputKeyup = function()
    {
        var value = document.getElementById('searchInput').value;
        if (value == this.lastSearch) {
            return;
        }
        if (this.searchingForCinemas) {
            this.shouldSearchForCinemasAgain = true;
            return;
        }
        this.lastSearch = value;
        document.getElementById('searchingSpan').style.visibility = 'visible';
        this.searchForCinemas();
    }
    
    this.showCinema = function(result, parameters)
    {
        this.detailWindow.setResult(result);
    }
    
    this.openCinema = function(id)
    {
        query('get-cinema', {id: id}, this, this.showCinema);
    }
    
    this.closeWindow = function()
    {
        document.getElementById('detailsWindow').style.display = 'none';
    }
    
    this.showMovie = function(result, parameters)
    {
        this.detailWindow.setResult(result);
    }
    
    this.openMovie = function(id)
    {
        query('get-movie', {id: id}, this, this.showMovie);
    }
    
    this.searchForMovies = function(parameters)
    {
        query('search-movies', parameters, this, this.showMovies);
    }
    
    this.showSearchResults = function(result, parameters, resultItemConstructor)
    {
        var highlighter = new Highlighter(parameters.q);
        var resultDiv = document.getElementById('resultList');
        DOM_RemoveAllChildren(resultDiv);
        this.resultList = new ResultList(result, resultItemConstructor, highlighter);
        resultDiv.appendChild(this.resultList.domNode);
    }
    
    this.showCinemas = function(result, parameters)
    {
        this.showSearchResults(result, parameters, CinemaResultItem);
        this.searchingForCinemas = false;
        document.getElementById('searchingSpan').style.visibility = 'hidden';
        if (this.shouldSearchForCinemasAgain) {
            this.shouldSearchForCinemasAgain = false;
            this.searchForCinemas();
        }
    }
    
    this.showMovies = function(result, parameters)
    {
        this.showSearchResults(result, parameters, MovieResultItem);
    }
    
    this.searchForCinemas = function(id)
    {
        this.searchingForCinemas = true;
        var params = {};
        if (id) {
            params.id = id;
        } else {
            params.q = document.getElementById('searchInput').value;
        }
        query('search-cinemas', params, this, this.showCinemas);
    }
}