function DetailWindow() {
    DOM_AddObjEventListener(this, document.getElementById('searchRelated'), 'click', this.onSearchRelatedClick);
}

DetailWindow.prototype.onSearchRelatedClick = function(event)
{
    if (this.result.type == 'movie') {
        app.searchForMovies({id: this.result.id, getCinemas: 1, getBriefInfo: 1});
    } else if (this.result.type == 'cinema') {
        app.searchForCinemas(this.result.id);
    }
    DOM_PreventDefault(event);
}
    

DetailWindow.prototype.setResult = function(result) {
    this.result = result;
    if (result) {
        DOM_ReplaceText(document.getElementById('detailsName'), result.name);
        document.getElementById('detailsDescription').innerHTML = result.description.replace(/\r\n|\r|\n/g, '<br>');
        DOM_ReplaceText(document.getElementById('detailsInfo'), result.info);
        DOM_ReplaceText(document.getElementById('searchRelated'), result.linkName);
    }
    document.getElementById('detailsWindow').style.display = result ? '' : 'none';
}
