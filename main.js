var app = new Application;

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

app.start();
