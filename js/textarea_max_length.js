// Textarea max length
// Sets a maximum length to a textarea html element
// Version 1
// Requires: DOM, Array

function TextareaMaxLength(textarea_element, max_length, prevent_entry)
{
    this.element = textarea_element;
    this.max_length = max_length;
    if (prevent_entry) {
        this.prevent_entry = true;
    } else {
        this.prevent_entry = false;
    }
    
    DOM_AddEventListener(this.element, 'change', function(obj) { return function(event) { obj.change(event); } }(this));
    DOM_AddEventListener(this.element, 'keyup', function(obj) { return function(event) { obj.keyup(event); } }(this));
    
    if (this.prevent_entry) {
        if (this.element.value.length > this.max_length) {
            this.overwrite_mode = false;
            this.element.value = this.element.value.substr(0, this.max_length);
            this.last_correct_value = this.element.value;
        }
        if (DOM_IsIE) {
            this.element.onbeforepaste = function() { event.returnValue = false };
            this.element.onpaste = function(obj) { return function() { obj.pasteForIE(); } }(this);
        }
        
        DOM_AddEventListener(this.element, DOM_IsIE  ? 'keydown' : 'keypress', function(obj) { return function(event) { obj.keydown(event); } }(this));
        
    }
    
    this.label_element = EDT_FindLabel(textarea_element.id, textarea_element);
    this.label_element.appendChild(document.createElement('br'));
    this.length_element = document.createElement('span');
    this.length_element.className = 'max_length';
    this.label_element.appendChild(this.length_element);
    this.updateText();
}

TextareaMaxLength.prototype.updateText = function()
{
    var text = '';
    var count;
    if (this.element.value.length > this.max_length) {
        this.length_element.className = 'alert';
        count = this.element.value.length - this.max_length;
        text = count;
        if (count == 1) {
            text += ' caracter excedente';
        } else {
            text += ' caracteres excedentes';
        }
    } else {
        this.length_element.className = 'max_length';
        count = this.max_length - this.element.value.length;
        text = count;
        if (count == 1) {
            text += ' caracter restante';
        } else {
            text += ' caracteres restantes';
        }
    }
    DOM_ReplaceText(this.length_element, text);
    
}

TextareaMaxLength.prototype.pasteForIE = function()
{
    var text_range = document.selection.createRange();
    var new_text_max_length = this.max_length + text_range.text.length - this.element.value.length;
    if (new_text_max_length < 0) {
        text_range.text = '';
        event.returnValue = false;
        return;
    }
    var new_text = window.clipboardData.getData("Text");
    if (new_text.length > new_text_max_length) {
        new_text = new_text.substr(0, new_text_max_length);
    }
    text_range.text = new_text;
    
    window.event.returnValue = false;
}

TextareaMaxLength.prototype.keydown = function(event)
{
    if (this.element.value.length <= this.max_length) {
        this.last_correct_value = this.element.value;
        this.last_selection = DOM_GetTextareaSelection(this.element);
    }
    
    if (this.element.value.length >= this.max_length) {
        if (event.ctrlKey || event.altKey) {
            return;
        }
        
        if (event.keyCode == 45) {
            this.overwrite_mode = !this.overwrite_mode;
            return;
        }
        
        var selection = DOM_GetTextareaSelection(this.element);
        
        if (selection[1] - selection[0] > 0) {
            return;
        }
        
        if (this.overwrite_mode) {
            if (selection[1] == selection[0] && selection[1] == this.element.value.length < 0) {
                return;
            }
        }
        
        if ([35, 36, 37, 38, 39, 40, 16, 46, 8, 13].indexOf(event.keyCode) === false) {
            DOM_PreventDefault(event);
        }
    }
}

TextareaMaxLength.prototype.keyup = function()
{
    if (this.prevent_entry && this.element.value.length > this.max_length) {
        if (!DOM_IsIE) { // In IE we already handle paste
            var extra_length = this.element.value.length - this.max_length;
            if (extra_length > 1) { // If this is true it must come from a paste and we will try to correct the max text
                var inserted_text = this.element.value.substr(this.last_selection[0], this.element.value.length - this.last_correct_value.length);
                var before = this.last_correct_value.substr(0, this.last_selection[0]);
                var new_text = inserted_text.substr(0, this.max_length - this.last_correct_value.length);
                var after = this.last_correct_value.substr(this.last_selection[1]);
                new_pos = this.last_selection[1] + new_text.length;
                this.last_selection = [new_pos, new_pos];
                this.last_correct_value = before + new_text + after;
            }
        }
        this.element.value = this.last_correct_value;
        DOM_SetTextareaSelection(this.element, this.last_selection);
    }
    this.updateText();
}

TextareaMaxLength.prototype.change = function()
{
    if (this.prevent_entry && this.element.value.length > this.max_length) {
        var selection = DOM_GetTextareaSelection(this.element);
        this.element.value = this.element.value.substr(0, this.max_length);
        DOM_SetTextareaSelection(this.element, selection);
    }
    this.updateText();
}
