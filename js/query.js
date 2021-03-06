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
                var response = eval('(' + request.responseText + ')');
                callback.call(obj, response, parameters);
                Log(response, service + ' response', 'query');
            } else {
                throw "XMLHttpRequest error:\n" + request.statusText;
            }
        }
    };
    
    request.open("GET", 'queries/' + service + '.php?' + navigation.serializeParametersToString(parameters), true);
    request.send(null);
    Log(parameters, service, 'query');
}
