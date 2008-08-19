// Navigation
// version 1.1

function Navigation()
{
    this.documentLoaded = false;
    this.futureQueryStrings = [];
    this.updatePage = function(parametersObj) { } ;
    this.lastUrl = window.location.toString();
    this.firstQueryString = window.location.hash.substr(1);
    
    this.onWindowLoad = function()
    {
        // This can't be created dynamically because if you do
        //  internet explorer forgets its history if you reload the page
        this.navigationIframe = document.getElementById('NavigationIframe');
        this.documentLoaded = true;
    }
    
    this.createLink = function(parameters)
    {
        var a = document.createElement('a');
        a.href = "#" + this.serializeParametersToString(parameters);
        DOM_AddObjEventListener(this, a, 'click',
            function(event)
            {
                this.goTo(parameters);
                DOM_PreventDefault(event);
            }
        );
        return a;
    }
    
    this.serializeParametersToString = function(parametersObj)
    {
        var result = '', item;
        for (item in parametersObj) {
            if (result) {
                result += "&";
            }
            result += escape(item);
            if (parametersObj[item]) {
                result += '=' + escape(parametersObj[item]);
            }
        }
        return result;
    }
    
    this.unserializeParametersFromString = function(parametersStr)
    {
        var pos = 0;
        var parameterName = '';
        var parameterValue = '';
        var parametersObj = {};
        function getParameterAndValue()
        {
            var inValue = false;
            var chr;
            parameterName = '';
            parameterValue = '';
            while (pos < parametersStr.length) {
                chr = parametersStr.substr(pos, 1);
                ++pos;
                if (chr == '&') {
                    break;
                } else if (inValue) {
                    parameterValue += chr;
                } else {
                    if (chr == '=') {
                        inValue = true;
                    } else {
                        parameterName += chr;
                    }
                }
            }
            parametersObj[unescape(parameterName)] = unescape(parameterValue);
        }
        while (pos < parametersStr.length) {
            getParameterAndValue();
        }
        return parametersObj;
    }
    
    this.goTo = function(parametersObj)
    {
        var queryString;
        if (typeof parametersObj == 'string') {
            queryString = parametersObj;
            parametersObj = this.unserializeParametersFromString(queryString);
        } else {
            queryString = this.serializeParametersToString(parametersObj);
        }
        this.futureQueryStrings[this.futureQueryStrings.length] = queryString;
        if (DOM_IsIE) {
            this.navigationIframe.src = 'navigation.html?' + queryString;
        } else {
            window.location = window.location.protocol + '//' + window.location.host + window.location.pathname +
 window.location.search + '#' + queryString;
        }
        this.updatePage(parametersObj);
    }

    this.pageIsLoading = function(queryString)
    {
        var i, result = false;
        for (i = 0; i < this.futureQueryStrings.length; i++) {
            if (queryString == this.futureQueryStrings[i]) {
                result = i;
                break;
            }
        }
        if (result === false) {
            return false;
        }
        var newFutureQueryStrings = [];
        for (i = result + 1; i < this.futureQueryStrings.length; i++) {
            newFutureQueryStrings[newFutureQueryStrings.length] = this.futureQueryStrings[i];
        }
        this.futureQueryStrings = newFutureQueryStrings;
        return true;
    }
    
    this.checkForUrlChanges = function()
    {
        if (window.location.toString() != this.lastUrl) {
            this.newPageArrived(window.location.hash.substr(1));
            this.lastUrl = window.location.toString();
        }
    }
    
    this.newPageArrived = function(queryString)
    {
        if (!this.documentLoaded) {
            setTimeout(
                function()
                {
                    me.newPageArrived(queryString);
                },
                100
            )
            return;
        }
        var me = this;
        var match;
        var parametersObj = {};
        if (this.pageIsLoading(queryString)) {
            return;
        }
        if (queryString) {
            parametersObj = this.unserializeParametersFromString(queryString);
        } else if (window.location.hash) {
            parametersObj = this.unserializeParametersFromString(window.location.hash.substr(1));
        }
        this.updatePage(parametersObj);
    }
    
    this.frameLoaded = function(location) // This is only used for Internet Explorer
    {
        var queryString = '', match;
        if (match = /\?(.*)$/.exec(location)) {
            queryString = match[1];
        }
        if (DOM_IsIE) {
            var newLocation = window.location.protocol + '//' + window.location.host + window.location.pathname +
 window.location.search;
            if (!queryString) {
                queryString = this.firstQueryString;
            }
            newLocation += '#' + queryString;
            if (newLocation != window.location.toString()) {
                window.location.replace(newLocation);
            }
        }
        this.newPageArrived(queryString);
    }
}

var navigation = new Navigation;

DOM_AddObjEventListener(navigation, window, 'load', navigation.onWindowLoad);
if (DOM_IsGecko) {
    setInterval(function() { navigation.checkForUrlChanges() }, 200);
}