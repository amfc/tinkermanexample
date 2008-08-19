function Application() {
    this.parameters = {};

    this.start = function()
    {
        this.template = new Template;
        this.template.load('templates/home.html');
        this.detailWindow = new DetailWindow;
    }
    
    this.onSearchRelatedClick = function(event)
    {
        if (this.parameters.movie) {
            app.searchForMovies({id: this.parameters.movie, getCinemas: 1, getBriefInfo: 1});
        } else if (this.parameters.cinema) {
            app.searchForCinemas(this.parameters.cinema);
        }
        DOM_PreventDefault(event);
    }
    
    this.load = function()
    {
        this.template.replaceContents(document.getElementById('MainDiv'));
        DOM_AddObjEventListener(this, document.getElementById('searchInput'), 'keyup', this.onInputKeyup);
        DOM_AddObjEventListener(this, document.getElementById('searchRelated'), 'click', this.onSearchRelatedClick);
        this.searchForMovies({ getBriefInfo: 1});
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
        DOM_RemoveAllChilds(resultDiv);
        this.resultList = new ResultList(result, resultItemConstructor, highlighter);
        resultDiv.appendChild(this.resultList.fragment);
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

function query(service, parameters, obj, callback) {
    var e, request;
    
    /*@cc_on 
    @if (@_jscript_version >= 5) 
        try { request = new ActiveXObject("Msxml2.XMLHTTP"); } 
        catch (e) { 
            try { request = new ActiveXObject("Microsoft.XMLHTTP"); } 
            catch (e) {  } } 
    @end @*/  
    if (!request) {
        request = new XMLHttpRequest();
    }
    
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                callback.call(obj, eval('(' + request.responseText + ')'), parameters);
            } else {
                throw "XMLHttpRequest error:\n" + request.statusText;
            }
        }
    };
    
    request.open("GET", 'queries/' + service + '.php?' + Navigation.serializeParametersToString(parameters), true);
    request.send(null);
    
}

function CinemaResultItem(result, highlighter) {
    this.fragment = document.createDocumentFragment();
    var div = document.createElement('div');
    div.className = 'result';
    var a = Navigation.createLink({cinema: result.id});
    a.className = 'result';
    a.appendChild(highlighter.getText(result.name));
    div.appendChild(a);
    div.appendChild(highlighter.getText(' ' + result.address));
    div.appendChild(document.createElement('br'));
    if (result.movies) {
        div.appendChild(new ResultList(result.movies, ShowsResultItem, highlighter).fragment);
    }
    this.fragment.appendChild(div);
}

function Highlighter(q) {
    if (q) {
        var unsorted_words = VAR_SplitWords(q);
        var sorted_words = DMH_SortByStringLength(unsorted_words);
    }
    this.getText = function(str) {
        if (q) {
            return DMH_CreateHighlightedText(str, unsorted_words, sorted_words);
        } else {
            return document.createTextNode(str);
        }
    }
}

function ResultList(dataItems, itemConstructor, highlighter) {
    this.fragment = document.createDocumentFragment();
    this.items = [];
    for (var i = 0; i < dataItems.length; i++) {
        var item = new itemConstructor(dataItems[i], highlighter);
        this.items.push(item);
        this.fragment.appendChild(item.fragment);
    }
}

function ShowsResultItem(result, highlighter) {
    function getLink() {
        var params = {};
        params[result.type] = result.id;
        return Navigation.createLink(params);
    }
    this.fragment = document.createDocumentFragment();
    var a = getLink();
    a.className = 'result-item';
    a.appendChild(highlighter.getText(result.name));
    this.fragment.appendChild(a);
    this.fragment.appendChild(document.createTextNode(' '));
    this.fragment.appendChild(highlighter.getText(result.shows));
    this.fragment.appendChild(document.createElement('br'));
}

function MovieResultItem(result, highlighter) {
    this.fragment = document.createDocumentFragment();
    var div = document.createElement('div');
    div.className = 'result';
    var a = Navigation.createLink({movie: result.id});
    a.className = 'result';
    a.appendChild(document.createTextNode(result.name));
    div.appendChild(a);
    var infoItems = [];
    if (result.genre) {
        infoItems.push(result.genre);
    }
    if (result.condition) {
        infoItems.push(result.rating);
    }
    if (result.origin) {
        infoItems.push(result.origin);
    }
    if (infoItems.length) {
        var span = document.createElement('span');
        span.className = 'itemDetails';
        var text = '';
        for (var j = 0; j < infoItems.length; ++j) {
            if (j > 0) {
                text += ' |';
            }
            text += ' ' + infoItems[j].toLowerCase();
        }
        span.appendChild(document.createTextNode(text));
        div.appendChild(span);
    }
    div.appendChild(document.createElement('br'));
    if (result.description) {
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(result.description));
        div.appendChild(p);
    }
    if (result.cinemas) {
        div.appendChild(new ResultList(result.cinemas, ShowsResultItem, highlighter).fragment);
    }
    this.fragment.appendChild(div);
}

function DetailWindow() {
}

DetailWindow.prototype.setResult = function(result) {
    if (result) {
        DOM_ReplaceText(document.getElementById('detailsName'), result.name);
        document.getElementById('detailsDescription').innerHTML = VAR_NlToBr(result.description);
        DOM_ReplaceText(document.getElementById('detailsInfo'), result.info);
        DOM_ReplaceText(document.getElementById('searchRelated'), result.linkName);
    }
    document.getElementById('detailsWindow').style.display = result ? '' : 'none';
}

var app = new Application;

app.start();

Navigation.updatePage = function(parametersObj)
{
    app.parameters = parametersObj;
    
    if (parametersObj['movie']) {
        app.openMovie(parametersObj['movie']);
    } else if (parametersObj['cinema']) {
        app.openCinema(parametersObj['cinema']);
    } else {
        app.closeWindow();
    }
}
