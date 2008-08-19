var app = new Application;

navigation.updatePage = function(parametersObj)
{
    app.parameters = parametersObj;
    if (parametersObj['movie']) {
        app.openMovie(parametersObj['movie']);
    } else if (parametersObj['cinema']) {
        app.openCinema(parametersObj['cinema']);
    } else {
        app.closeWindow();
    }
    Log(parametersObj, null, 'urlChange');
}

LOG.logAsSection('app', app, 'app');
