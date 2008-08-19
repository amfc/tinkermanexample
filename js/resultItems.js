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

