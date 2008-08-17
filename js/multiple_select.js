function REC_MultipleSelect(element_name, ids, names, selected_ids, on_change_js)
{
    this.ids = ids;
    this.names = names;
    this.element_name = element_name;
    this.selected_ids = selected_ids;
    this.on_change_js = on_change_js;
    this.create();
    this.refresh();
}

REC_MultipleSelect.prototype.create = function()
{
    str = '';
    str += '<div class="select_multiple" id="REC_MultipleSelect_div_' + this.element_name + '">';
    str += '    <select size="4" multiple="multiple" title="Disponibles"></select>';
    str += '    <div>';
    str += '        <button type="button" title="Agregar">&nbsp;&gt;&gt;&nbsp;</button>';
    str += '        <button type="button" title="Quitar">&nbsp;&lt;&lt;&nbsp;</button>';
    str += '    </div>';
    str += '    <select size="4" multiple="multiple" title="Seleccionados"></select>';
    str += '    <input type="hidden" name="' + this.element_name + '" id="' + this.element_name + '"/>';
    str += '</div>';
    str += '<div class="spacer"></div>';
    document.write(str);
    var div = document.getElementById('REC_MultipleSelect_div_' + this.element_name);
    var elements = div.getElementsByTagName('select');
    this.available_element = elements[0];
    this.available_element.ondblclick = function(obj) { return function() { obj.select() } }(this);
    this.selected_element = elements[1];
    this.selected_element.ondblclick = function(obj) { return function() { obj.unselect() } }(this);
    
    this.available_element.onkeydown = function(obj) { return function(event) { if (event.keyCode == 13 || event.keyCode == 39) { obj.selectItems() } } }(this);
    this.selected_element.onkeydown = function(obj) { return function(event) { if (event.keyCode == 13 || event.keyCode == 37) { obj.unselectItems() } } }(this);
    
    this.hidden_element = div.getElementsByTagName('input')[0];
    elements = div.getElementsByTagName('button');
    elements[0].onclick = function(obj) { return function() { obj.selectItems() } }(this);
    elements[1].onclick = function(obj) { return function() { obj.unselectItems() } }(this);
}

REC_MultipleSelect.prototype.focus = function()
{
    this.available_element.focus();
}

REC_MultipleSelect.prototype.setOptions = function(ids, names, values)
{
    this.ids = ids;
    this.names = names;
    this.selected_ids = values;
    this.refresh();
}

REC_MultipleSelect.prototype.isSelected = function(id)
{
    for (var i = 0; i < this.selected_ids.length; i++) {
        if (this.selected_ids[i] == id) {
            return true;
        }
    }
    return false;
}

REC_MultipleSelect.prototype.selectItem = function(id, dont_run_on_change)
{
    this.selected_ids
    this.selected_ids[this.selected_ids.length] = id;
    if (!dont_run_on_change) {
        this.onChange();
    }
}

REC_MultipleSelect.prototype.onChange = function()
{
    if (typeof this.on_change_js == 'string') {
        eval(this.on_change_js);
    } else if (typeof this.on_change_js == 'function') {
        this.on_change_js();
    }
}

REC_MultipleSelect.prototype.selectItems = function()
{
    var id, i;
    for (i = 0; i < this.available_element.options.length; i++) {
        if (this.available_element.options[i].selected) {
            id = this.available_element.options[i].value;
            this.selectItem(id, true);
        }
    }
    this.refresh();
    this.onChange();
}

REC_MultipleSelect.prototype.unselectItems = function()
{
    var id, i;
    for (i = 0; i < this.selected_element.options.length; i++) {
        if (this.selected_element.options[i].selected) {
            id = this.selected_element.options[i].value;
            this.unselectItem(id, true);
        }
    }
    this.refresh();
    this.onChange();
}

REC_MultipleSelect.prototype.unselectItem = function(id, dont_run_on_change)
{
    var i, temp;
    for (i = 0; i < this.selected_ids.length; i++) {
        if (this.selected_ids[i] == id) {
            temp = [];
            this.selected_ids = temp.concat(this.selected_ids.slice(0, i),this.selected_ids.slice(i + 1));
            if (!dont_run_on_change) {
                this.onChange();
            }
            return true;
        }
    }
    return false;
}

REC_MultipleSelect.prototype.select = function()
{
    var selectedIndex = this.available_element.selectedIndex;
    if (selectedIndex >= 0) {
        id = this.available_element.options[selectedIndex].value;
        if (id > 0 && !this.isSelected(id)) {
            this.selectItem(id);
            this.refresh();
            this.onChange();
        }
    }
}

REC_MultipleSelect.prototype.unselect = function()
{
    var selectedIndex = this.selected_element.selectedIndex;
    if (selectedIndex >= 0) {
        id = this.selected_element.options[selectedIndex].value;
        if (id > 0 && this.isSelected(id)) {
            this.unselectItem(id);
            this.refresh();
            this.onChange();
        }
    }
}

REC_MultipleSelect.prototype.getName = function(id)
{
    for (var i = 0; i < this.ids.length; i++) {
        if (this.ids[i] == id) {
            return this.names[i];
        }
    }
    return false;
}

REC_MultipleSelect.prototype.refresh = function()
{
    var id, i, text;
    
    for (i = this.available_element.options.length - 1; i >= 0; i--) {
        this.available_element.options[i] = null;
    }
    
    for (i = this.selected_element.options.length - 1; i >= 0; i--) {
        this.selected_element.options[i] = null;
    }
    
    for (i=0; i<this.ids.length; i++) {
        id = this.ids[i];
        if (!this.isSelected(id)) {
            this.available_element.options[this.available_element.options.length] = new Option(this.names[i], id);
        } else {
            this.selected_element.options[this.selected_element.options.length] = new Option(this.names[i], id);
        }
    }
    
    text = '';
    for (i = 0; i < this.selected_ids.length; i++) {
        var id = this.selected_ids[i];
        if (i > 0) {
            text += ',';
        }
        text += id;
    }
    this.hidden_element.value = text;
}
