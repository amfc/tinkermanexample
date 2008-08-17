// HTM: HTML Editor
// Requires: REC
// Version 1.1

function HTM_RestoreDesignMode(parent_node)
{
    if (DOM_IsGecko) {
        var iframes = parent_node.getElementsByTagName('iframe');
        var i;
        for (i = 0; i < iframes.length; i++) {
            if (iframes[i].HTM_Editor) {
                iframes[i].HTM_Editor.activateDesignMode()
            }
        }
    }
}

function HTM_Editor(element_id, create_link_text, field_name, required, properties, had_data)
{
    this.element_id = element_id;
    this.hidden_element = document.getElementById('HTM_' + element_id + '_hidden');
    this.iframe_id = 'HTM_' + this.element_id + '_iframe';
    this.form_document = document;
    this.create_link_text = create_link_text;
    this.events_added = false;
    this.possiblyChanged = false;
    this.had_data = had_data;
    this.init(this.iframe_id, field_name, required, properties);
}

HTM_Editor.prototype = new REC_Field;

HTM_Editor.prototype.activateDesignMode = function()
{
    var iframe = this.form_document.getElementById(this.iframe_id);
    this.doc = iframe.contentWindow.document;
    try {
        this.doc.designMode = "on";
        this.doc = this.form_document.getElementById(this.iframe_id).contentWindow.document;
        if (navigator.userAgent.toLowerCase().indexOf("gecko") != -1) {
            this.doc.execCommand('useCSS', false, true);
        }
        if (!this.events_added) {
            DOM_AddObjEventListener(this, this.doc, 'blur', this.onBlur);
            DOM_AddObjEventListener(this, iframe, 'blur', this.onBlur);
            DOM_AddObjEventListener(this, this.doc, 'keydown', this.onEvent);
            DOM_AddObjEventListener(this, this.doc, 'click', this.onEvent);
            this.events_added = true;
            this.hidden_element.value = this.get();
        }
    } catch (e) {
        // alert(e);
    }
}

HTM_Editor.prototype.onBlur = function()
{
    if (this.possiblyChanged) {
        var new_value = this.get();
        if (this.hidden_element.value != new_value) {
            this.privOnChange();
            this.hidden_element.value = new_value;
        }
        this.possiblyChanged = false;
    }
}

HTM_Editor.prototype.onEvent = function()
{
    this.possiblyChanged = true;
}

HTM_Editor.prototype.update = function()
{
    this.hidden_element.value = this.get();
}

HTM_Editor.prototype.privOnChange = function()
{
    this.runOnChange();
}

HTM_Editor.prototype.format = function(command)
{
    this.doc.execCommand(command, false, null);
}

HTM_Editor.prototype.style = function(format)
{
    this.doc.execCommand('formatblock', false, format);
    document.getElementById('HTM_' + this.element_id + '_select').selectedIndex = 0;
}
    
HTM_Editor.prototype.link = function()
{
    var url;
    if (url = prompt(this.create_link_text, "")) {
        this.doc.execCommand("Unlink", false, null);
        this.doc.execCommand("CreateLink", false, url);
    }
}

HTM_Editor.prototype.get = function()
{
    if (this.doc) {
        return this.doc.body.innerHTML;
    } else {
        return false;
    }
}

HTM_Editor.prototype.set = function(new_data)
{
    this.doc.body.innerHTML = new_data;
}

HTM_Editor.prototype.hasData = function()
{
    if (!this.doc) {
        return this.had_data == 1;
    }
    var i = 0;
    var text = this.get();
    var in_tag = false;
    var c;
    while (i < text.length) {
        c = text.charAt(i);
        if (in_tag) {
            if (c == '>') {
                in_tag = false;
            }
        } else if (c == '<') {
            in_tag = true;
        } else if (c == '&') {
            if (text.substr(i + 1, 5) == 'nbsp;') {
                i += 5;
            } else {
                return true;
            }
        } else if (!VAR_IsWhitespace(c)) {
            return true;
        }
        i++;
    }
    return false;
}

HTM_Editor.prototype.focus = function()
{
    this.form_document.getElementById(this.iframe_id).contentWindow.focus();
}
