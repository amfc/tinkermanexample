function CinemaResultItem(result, highlighter) {
    this.domNode = document.createElement('div');
    this.domNode.className = 'result';
    var a = navigation.createLink({cinema: result.id});
    a.className = 'result';
    a.appendChild(highlighter.getText(result.name));
    this.domNode.appendChild(a);
    this.domNode.appendChild(highlighter.getText(' ' + result.address));
    this.domNode.appendChild(document.createElement('br'));
    if (result.movies) {
        this.domNode.appendChild(new ResultList(result.movies, ShowsResultItem, highlighter).domNode);
    }
}

function ResultList(dataItems, itemConstructor, highlighter) {
    this.domNode = document.createElement('div');
    this.items = [];
    for (var i = 0; i < dataItems.length; i++) {
        var item = new itemConstructor(dataItems[i], highlighter);
        this.items.push(item);
        this.domNode.appendChild(item.domNode);
    }
}

function ShowsResultItem(result, highlighter) {
    function getLink() {
        var params = {};
        params[result.type] = result.id;
        return navigation.createLink(params);
    }
    this.domNode = document.createElement('span');
    var a = getLink();
    a.className = 'result-item';
    a.appendChild(highlighter.getText(result.name));
    this.domNode.appendChild(a);
    this.domNode.appendChild(document.createTextNode(' '));
    this.domNode.appendChild(highlighter.getText(result.shows));
    this.domNode.appendChild(document.createElement('br'));
}

function MovieResultItem(result, highlighter) {
    this.domNode = document.createElement('div');
    this.domNode.className = 'result';
    var a = navigation.createLink({movie: result.id});
    a.className = 'result';
    a.appendChild(document.createTextNode(result.name));
    this.domNode.appendChild(a);
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
        this.domNode.appendChild(span);
    }
    this.domNode.appendChild(document.createElement('br'));
    if (result.description) {
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(result.description));
        this.domNode.appendChild(p);
    }
    if (result.cinemas) {
        this.domNode.appendChild(new ResultList(result.cinemas, ShowsResultItem, highlighter).domNode);
    }
}

