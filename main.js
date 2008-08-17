var Application = new function()
{
    this.lastRecordsCount = 0;
    this.maxLastRecords = 3;
    this.lastViewedItems = [];
    this.parameters = {};
    this.viewingBigPhoto = false;

    this.linkJs = function(src)
    {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    
    this.linkCss = function(href)
    {
        var link = document.createElement('link');
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', href);
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Correctly handle PNG transparency in Win IE 5.5 or higher.
    // Originally from "http://homepage.ntlworld.com/bobosola. Updated 02-March-2004"
    this.correctPNG = function(element) 
    {
        var img = element;
        var imgName = img.src.toUpperCase();
        var imgID = (img.id) ? "id='" + img.id + "' " : "";
        var imgClass = (img.className) ? "class='" + img.className + "' " : "";
        var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' ";
        var imgStyle = "display:inline-block;" + img.style.cssText;
        var strNewHTML = "<span class=\"float\" " + imgID + imgClass + imgTitle
            + " style=\"" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";"
            + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
            + "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>";
        img.outerHTML = strNewHTML;
    }
    
    this.togglePhoto = function(img, result)
    {
        var src = img.src;
        var match = src.match(/^(.*)\/([^\/]+?)(_big)?\.([a-z]+)$/i);
        if (match) {
            if (match[3]) { // this is a big file, we will use a small one
                img.src = match[1] + '/' + match[2] + '.' + match[4];
                img.width = result.photoWidth;
                img.height = result.photoHeight;
            } else { // we will use a big one
                img.src = match[1] + '/' + match[2] + '_big.' + match[4];
                img.width = result.bigPhotoWidth;
                img.height = result.bigPhotoHeight;
            }
        }
    }
    
    this.start = function()
    {
        this.template = new Template;
        this.template.load('templates/home.html');
    }
    
    this.updateDetailsWindowPositionForIe = function()
    {
        var y = DOM_GetScrollBarPositions().y;
        if (y < 50) {
            y = 50;
        }
        document.getElementById('detailsWindow').style.top = (y + 3) + 'px';
    }
    
    this.onScrollForIe = function(fromTimer)
    {
        if (!fromTimer) {
            this.scrollStartedTime = new Date();
        }
        if (this.scrollTimer) {
            window.clearTimeout(this.scrollTimer);
        }
        if ((new Date() - this.scrollStartedTime) > 400) {
            this.updateDetailsWindowPositionForIe();
        } else {
            this.scrollTimer = window.setTimeout(
                function(obj)
                {
                    return function()
                    {
                        obj.onScrollForIe(true)
                    }
                }(this), 200
            );
        }
    }
    
    this.onSearchRelatedClick = function(event)
    {
        if (this.parameters.movie) {
            Application.searchForMovies({id: this.parameters.movie, getCinemas: 1, getBriefInfo: 1});
        } else if (this.parameters.cinema) {
            Application.searchForCinemas(this.parameters.cinema);
        }
        DOM_PreventDefault(event);
    }
    
    this.load = function()
    {
        this.template.assign('');
        this.template.replaceContents(document.getElementById('MainDiv'));
        DOM_AddObjEventListener(this, document.getElementById('searchInput'), 'keyup', this.onInputKeyup);
        DOM_AddObjEventListener(this, document.getElementById('searchRelated'), 'click', this.onSearchRelatedClick);
        if (DOM_IsIE) {
            this.linkCss('style.ie.css');
            this.correctPNG(document.getElementById('logo'));
            window.onscroll = function(obj) { return function() { obj.onScrollForIe(false) } }(this);
        }
        this.searchForMovies({'new': 1, getBriefInfo: 1});
    }
    
    this.searchTimer = false;
    this.lastSearch = '';
    
    this.onInputKeyup = function()
    {
        var value = document.getElementById('searchInput').value;
        if (value == this.lastSearch) {
            return;
        }
        this.lastSearch = value;
        if (this.searchTimer !== false) {
            clearTimeout(this.searchTimer);
            this.searchTimer = false;
            if ((new Date() - this.searchStatedTypingTime) > 1000) {
                obj.searchForCinemas();
            }
        } else {
            this.searchStatedTypingTime = new Date();
            document.getElementById('searchingSpan').style.visibility = 'visible';
        }
        var obj = this;
        this.searchTimer = setTimeout(
            function()
            {
                if (obj.searchTimer !== false) {
                    clearTimeout(obj.searchTimer);
                    obj.searchTimer = false;
                }
                document.getElementById('searchingSpan').style.visibility = 'hidden';
                obj.searchForCinemas();
            }, 250
        );
    }
    
    this.query = function(service, parameters, callback)
    {
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
        
        request.onreadystatechange = function(obj) {
            return function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        callback.call(obj, eval('(' + request.responseText + ')'), parameters);
                    } else {
                        throw "XMLHttpRequest error:\n" + request.statusText;
                    }
                }
            }
        }(this);
        
        request.open("GET", 'queries/' + service + '.php?' + Navigation.serializeParametersToString(parameters), true);
        request.send(null);
    }
    
    this.addLastViewedItem = function(name, href)
    {
        var i;
        var newLastViewedItems = [];
        for (i = 0; i < this.lastViewedItems.length; ++i) {
            if (this.lastRecordsCount < this.maxLastRecords || i > 0) {
                newLastViewedItems[newLastViewedItems.length] = this.lastViewedItems[i];
            }
            if (this.lastViewedItems[i] == href) {
                return;
            }
        }
        this.lastViewedItems = newLastViewedItems;
        this.lastViewedItems[this.lastViewedItems.length] = href;
        var lastRecordsDiv = document.getElementById('lastRecords');
        if (this.lastRecordsCount >= this.maxLastRecords) {
            lastRecordsDiv.removeChild(lastRecordsDiv.firstChild);
            --this.lastRecordsCount;
        }
        ++this.lastRecordsCount;
        var div = document.createElement('div');
        var a = document.createElement('a');
        a.href = '#' + href;
        a.appendChild(document.createTextNode(name));
        a.onclick = function(href) {
            return function(event)
            {
                if (!event) {
                    event = window.event;
                }
                Navigation.goTo(href)
                DOM_PreventDefault(event);
            }
        }(href);
        div.appendChild(a);
        div.appendChild(document.createTextNode(' '));
        var closeLink = document.createElement('a');
        closeLink.onclick = function(obj)
        {
            return function(event)
            {
                if (!event) {
                    event = window.event;
                }
                lastRecordsDiv.removeChild(div);
                --obj.lastRecordsCount;
                DOM_PreventDefault(event);
            }
        }(this);
        closeLink.href = '#';
        closeLink.className = 'close';
        closeLink.appendChild(document.createTextNode('x'));
        div.appendChild(closeLink);
        lastRecordsDiv.appendChild(div);
    }
    
    this.showCinema = function(result, parameters)
    {
        this.loadPhotos();
        DOM_ReplaceText(document.getElementById('detailsName'), result.name);
        DOM_ReplaceText(document.getElementById('detailsDescription'), result.description);
        DOM_ReplaceText(document.getElementById('detailsInfo'), result.info);
        DOM_ReplaceText(document.getElementById('searchRelated'), 'películas');
        document.getElementById('detailsWindow').style.display = '';
        this.addLastViewedItem(result.name, 'cinema=' + parameters.id);
    }
    
    this.openCinema = function(id)
    {
        this.query('get-cinema', {id: id}, this.showCinema);
    }
    
    this.closeWindow = function()
    {
        document.getElementById('detailsWindow').style.display = 'none';
    }
    
    this.cyclePhoto = function()
    {
        if (this.selectedPhoto + 1 < this.photos.length) {
            this.loadPhoto(this.selectedPhoto + 1);
        } else {
            this.loadPhoto(0);
        }
    }
    
    this.nextPhoto = function()
    {
        if (this.selectedPhoto + 1 < this.photos.length) {
            this.loadPhoto(this.selectedPhoto + 1);
        }
    }
    
    this.previousPhoto = function()
    {
        if (this.selectedPhoto - 1 >= 0) {
            this.loadPhoto(this.selectedPhoto - 1);
        }
    }
    
    this.enlargePhoto = function()
    {
        this.viewingBigPhoto = !this.viewingBigPhoto;
        this.updateEnlargePhotoText();
        this.loadPhoto(this.selectedPhoto);
    }
    
    this.updateEnlargePhotoText = function()
    {
        var text;
        if (this.viewingBigPhoto) {
            text = '[ reducir ]';
        } else {
            text = '[ ampliar ]';
        }
        DOM_ReplaceText(document.getElementById('enlargePhoto'), text);
    }
    
    this.loadPhoto = function(number)
    {
        this.selectedPhoto = number;
        var img = document.getElementById('photo');
        img.src = '/images/pixel.gif';
        if (this.viewingBigPhoto) {
            img.src = this.photoPath + this.photos[number].bigFile;
            img.width = this.photos[number].bigWidth;
            img.height = this.photos[number].bigHeight;
        } else {
            img.src = this.photoPath + this.photos[number].file;
            img.width = this.photos[number].width;
            img.height = this.photos[number].height;
        }
        
        if (number > 0) {
            document.getElementById('previousPhoto').className = '';
        } else {
            document.getElementById('previousPhoto').className = 'disabled';
        }
        if (this.photos.length > number + 1) {
            document.getElementById('nextPhoto').className = '';
        } else {
            document.getElementById('nextPhoto').className = 'disabled';
        }
    }
    
    this.loadPhotos = function(photos, path)
    {
        this.photoPath = path;
        this.photos = photos;
        this.updateEnlargePhotoText();
        if (!photos || !photos.length) {
            document.getElementById('photoWindow').style.display = 'none';
            return;
        }
        this.loadPhoto(0);
        document.getElementById('photoWindow').style.display = '';
    }
    
    this.showMovie = function(result, parameters)
    {
        DOM_ReplaceText(document.getElementById('detailsName'), result.name);
        document.getElementById('detailsDescription').innerHTML = VAR_NlToBr(result.description);
        this.loadPhotos(result.photos, 'http://www.adondevamos.com/fotos/pelicula/');
        DOM_ReplaceText(document.getElementById('detailsInfo'), result.info);
        DOM_ReplaceText(document.getElementById('searchRelated'), 'cines');
        document.getElementById('detailsWindow').style.display = '';
        this.addLastViewedItem(result.name, 'movie=' + parameters.id);
    }
    
    this.openMovie = function(id)
    {
        this.query('get-movie', {id: id}, this.showMovie);
    }
    
    this.showMovies = function(result, parameters)
    {
        var resultDiv = document.getElementById('resultList');
        DOM_RemoveAllChilds(resultDiv);
        var i, j, cinemaDiv, a, p, span, infoItems, text;
        for (i = 0; i < result.length; i++) {
            cinemaDiv = document.createElement('div');
            cinemaDiv.className = 'result';
            a = Navigation.createLink({movie: result[i].id});
            a.className = 'result';
            a.appendChild(document.createTextNode(result[i].name));
            cinemaDiv.appendChild(a);
            infoItems = [];
            if (result[i].genre) {
                infoItems.push(result[i].genre);
            }
            if (result[i].condition) {
                infoItems.push(result[i].condition);
            }
            if (result[i].origin) {
                infoItems.push(result[i].origin);
            }
            if (infoItems.length) {
                span = document.createElement('span');
                span.className = 'itemDetails';
                text = '';
                for (j = 0; j < infoItems.length; ++j) {
                    if (j > 0) {
                        text += ' |';
                    }
                    text += ' ' + infoItems[j].toLowerCase();
                }
                span.appendChild(document.createTextNode(text));
                cinemaDiv.appendChild(span);
            }
            cinemaDiv.appendChild(document.createElement('br'));
            if (result[i].description) {
                p = document.createElement('p');
                p.appendChild(document.createTextNode(result[i].description));
                cinemaDiv.appendChild(p);
            }
            if (result[i].cinemas) {
                for (j = 0; j < result[i].cinemas.length; ++j) {
                    a = Navigation.createLink({cinema: result[i].cinemas[j].id});
                    a.className = 'result-item';
                    a.appendChild(document.createTextNode(result[i].cinemas[j].name));
                    cinemaDiv.appendChild(a);
                    cinemaDiv.appendChild(document.createTextNode(' ' + result[i].cinemas[j].shows));
                    cinemaDiv.appendChild(document.createElement('br'));
                }
            }
            resultDiv.appendChild(cinemaDiv);
        }
    }
    
    this.searchForMovies = function(parameters)
    {
        this.query('search-movies', parameters, this.showMovies);
    }
    
    this.showCinemas = function(result, parameters)
    {
        var resultDiv = document.getElementById('resultList');
        DOM_RemoveAllChilds(resultDiv);
        var i, j, cinemaDiv, a;
        if (parameters.q) {
            var unsorted_words = VAR_SplitWords(parameters.q);
            var sorted_words = DMH_SortByStringLength(unsorted_words);
        }
        function getText(str) {
            if (parameters.q) {
                return DMH_CreateHighlightedText(str, unsorted_words, sorted_words);
            } else {
                return document.createTextNode(str);
            }
        }
        for (i = 0; i < result.length; i++) {
            /* <div class="result">
                <a href="#" class="result">Cinemark Palermo</a> Santa Fe 3395 10 "A"<br>
                <a href="#" class="result-item">Memorias de una geisha</a> 14hs 15hs sábados trasnoche 23hs<br>
                <a href="#" class="result-item">amet Lorem ipsum sit </a> 14hs 15hs sábados trasnoche<br>
              </div> */
            cinemaDiv = document.createElement('div');
            cinemaDiv.className = 'result';
            a = Navigation.createLink({cinema: result[i].id});
            a.className = 'result';
            a.appendChild(getText(result[i].name));
            cinemaDiv.appendChild(a);
            cinemaDiv.appendChild(getText(' ' + result[i].address));
            cinemaDiv.appendChild(document.createElement('br'));
            for (j = 0; j < result[i].movies.length; j++) {
                a = Navigation.createLink({movie: result[i].movies[j].id});
                a.className = 'result-item';
                a.appendChild(getText(result[i].movies[j].name));
                cinemaDiv.appendChild(a);
                cinemaDiv.appendChild(getText(' ' + result[i].movies[j].shows));
                cinemaDiv.appendChild(document.createElement('br'));
            }
            resultDiv.appendChild(cinemaDiv);
        }
    }
    
    this.searchForCinemas = function(id)
    {
        var queryParameters = {};
        if (id) {
            queryParameters.id = id;
        } else {
            queryParameters.q = document.getElementById('searchInput').value;
        }
        this.query('search-cinemas', queryParameters, this.showCinemas);
    }
    
    
}

Application.start();

Navigation.updatePage = function(parametersObj)
{
    Application.parameters = parametersObj;
    
    if (parametersObj['movie']) {
        Application.openMovie(parametersObj['movie']);
    } else if (parametersObj['cinema']) {
        Application.openCinema(parametersObj['cinema']);
    } else {
        Application.closeWindow();
    }
}
