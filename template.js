function Template()
{
    this.templates = { };
    this.vars = { };
}

Template.prototype.load = function(url, name, async)
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
    if (typeof async == 'undefined') {
        async = false;
    }
    request.open('GET', url, false);
    request.send(null);
    if (request.status == 200) {
        if (!name) {
            name = 'default';
        }
        this.templates[name] = { 'content': request.responseText, 'async': async };
        if (async) {
            this.templates[name]['request'] = request;
            this.templates[name]['loaded'] = false;
        } else {
            this.templates[name]['loaded'] = true;
        }
    } else {
        throw "Error loading template";
    }
}

Template.prototype.assign = function(variable, value)
{
    this.vars[variable] = value;
}

Template.prototype.isLoaded = function(name)
{
    if (!name) {
        name = 'default';
    }
    return this.templates[name] && this.templates[name]['loaded'];
}

Template.prototype.isLoaded = function(name)
{
    if (!name) {
        name = 'default';
    }
    return this.templates[name] && this.templates[name]['loaded'];
}

Template.prototype.runWhenLoaded = function(callable)
{
    /*
    if (!name) {
        name = 'default';
    }
    if (this.templates[name]) {
        throw('Template not in list');
    } else {
         if (this.templates[name]['loaded']) {
            callable();
         } else {
            this.templates[name].request.onreadystatechanged = function(obj) { return function() { if (this.templates[name].request.readystate = ) callable;
         }
    }
    if (!this.isLoaded(name))
    */
}

Template.prototype.get = function(name)
{
    if (!name) {
        name = 'default';
    }
    var result = this.templates[name]['content'];
    var vars = this.vars;
    if (result === false) {
        throw "Template not loaded";
    }
    result = result.replace(
        /<\?=\$([a-zA-Z_]*)\?>/g,
        function (str, key, offset, s) {
            return vars[key];
        }
    );
    return result;
}

Template.prototype.print = function(doc, name)
{
    if (!doc) {
        doc = document;
    }
    if (!name) {
        name = 'default';
    }
    doc.open();
    doc.write(this.get(name));
    doc.close();
}

Template.prototype.replaceContents = function(element, name)
{
    if (!name) {
        name = 'default';
    }
    element.innerHTML = this.get(name);
}