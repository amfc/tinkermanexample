function REC_Hide(element)
{
    element.style.visibility='hidden';
}

function REC_Show(element)
{
    element.style.visibility='visible';
}


var REC_Whitespace = " \t\n\r";

function REC_IsEmpty(s)
{
    return ((s == null) || (s.length == 0))
}

function REC_IsNumber(s, min, max)
{
    var n;
    n = Number(s);
    if ((!REC_IsWhitespace(s)) && (n != NaN) && (n >= min) && (n <= max)) {
        return true;
    } else {
        return false;
    }
}

function REC_IsHour(s, min, max)
{
    var h, m;
    s = REC_RemoveWhitespace(s);
    if (s.substr(s.length-3)=='hs.') {
        s=s.substr(0, s.length-3);
    } else if (s.substr(s.length-2)=='hs') {
        s=s.substr(0, s.length-2);
    }  else if (s.substr(s.length-1)=='h') {
        s=s.substr(0, s.length-1);
    }
    
    s = REC_RemoveWhitespace(s);
    s = s.split(':');
    if (s.length==2 && (h=Number(s[0]))!=NaN && h>=min && h<=max && (m=Number(s[1]))!=NaN && m>=0 && m<60) {
        return true;
    } else {
        return false;
    }
}

function REC_RemoveWhitespace(s)
{
    var i, s2;
    for (i=0; i<s.length; i++) {
        var c = s.charAt(i);
        if (REC_Whitespace.indexOf(c) == -1) {
            break;
        }
    }
    
    s=s.substr(i);
    
    for (i=s.length; i>0; i--) {
        var c = s.charAt(i);
        if (REC_Whitespace.indexOf(c) == -1) {
            break;
        }
    }
    
    s = s.substr(0, i+1);
    return s;
}

function REC_IsWhitespace(s)
{
    var i;
    // Is s empty?
    if (REC_IsEmpty(s)) {
        return true;
    }
    // Search through string's characters one by one
    // until we find a non-whitespace character.
    // When we do, return false; if we don't, return true.
    for (i = 0; i < s.length; i++) {
        // Check that current character isn't whitespace.
        var c = s.charAt(i);
        if (REC_Whitespace.indexOf(c) == -1) {
            return false;
        }
    }
    // All characters are whitespace.
    return true;
}

function REC_IsEmail(s)
{
    if (REC_IsEmpty(s)) {
        return false
    }
    
    // is s whitespace?
    if (REC_IsWhitespace(s)) {
        return false;
    }
    
    // there must be >= 1 character before @, so we
    // start looking at character position 1
    // (i.e. second character)
    var i = 1;
    var sLength = s.length;
    
    // look for @
    while ((i < sLength) && (s.charAt(i) != "@")) {
        i++
    }
    
    if ((i >= sLength) || (s.charAt(i) != "@")) {
        return false;
    } else {
        i += 2;
    }
    
    // look for .
    while ((i < sLength) && (s.charAt(i) != ".")) {
        i++
    }
    
    // there must be at least one character after the .
    if ((i >= sLength - 1) || (s.charAt(i) != ".")) {
        return false;
    } else {
        return true;
    }
}

function REC_GetPosition(element)
{
    var pos = { x:0 ,y:0 };
    do {
        pos.x += parseInt(element.offsetLeft);
        pos.y += parseInt(element.offsetTop);
        element = element.offsetParent;
    } while (element);
    return pos;
}

// Validation

function REC_ValidateDecimalField(element, min, max, number_digits, fraction_digits)
{
    var n;
    s = element.value.replace(/,/, '.');
    n = Number(s);
    if ((!REC_IsWhitespace(s)) && (n != NaN) && (n >= min) && (n <= max)) {
        if (Math.floor(n).toString().length > number_digits) { // The number is too long
            element.style.color = '#ff0000';
        } else {
            element.style.color = '#000000';
            element.value = n.toFixed(fraction_digits).toString();
        }
    } else {
        element.style.color = '#ff0000';
    }
}

function REC_ValidateEmail(element)
{
    if (REC_IsEmail(element.value)) {
        element.style.color = '#000000';
    } else {
        element.style.color = '#ff0000';
    }
}

function REC_IsKeypress(event)
{
    return (event.keyCode == 13);
}

function REC_GetRadioValue(name)
{
    var elements = document.getElementsByName(name);
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            return elements[i].value;
        }
    }
    return false;
}

function REC_InArray(needle, haystack)
{
    for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) {
            return true;
        }
    }
    return false;
}

function REC_Field(id, name, required, properties)
{
    if (id) {
        this.init(id, name, required, properties);
    }
}

// id is the user selectable html element (not a hidden)
// name is the name of the field in the database
// properties is an object { funcname: parameters }
REC_Field.prototype.init = function(id, name, required, properties)
{
    this.id = id;
    this.name = name;
    this.required = required;
    this.element = document.getElementById(this.id);
    this.errorFunctions = [ this.getErrorRequired ];
    this.onChangeFunctions = [];

    if (properties) {
        var i;
        for (i = 0; i < properties.length; i++) {
            this[properties[i][0]].apply(this, properties[i][1]);
        }
    }
    this.setElementOnChange();
}

REC_Field.prototype.get = function()
{
    return this.element.value;
}

REC_Field.prototype.set = function(value)
{
    this.element.value = value;
}

REC_Field.prototype.hasData = function(value)
{
    return !!this.element.value;
}

REC_Field.prototype.getError = function()
{
    var i, str = '', temp;
    for (i = 0; i < this.errorFunctions.length; i++) {
        if (temp = this.errorFunctions[i].call(this)) {
            if (str) {
                str += ', ';
            }
            str += temp;
        }
    }
    return str || false;
}

REC_Field.prototype.getErrorRequired = function()
{
    if (this.required && !this.hasData()) {
        return 'Campo requerido';
    } else {
        return false;
    }
}

REC_Field.prototype.addErrorCondition = function(func)
{
    this.errorFunctions[this.errorFunctions.length] = func;
}

REC_Field.prototype.focus = function()
{
    if (this.tabs !== true) {
        var tab = this.tabs[0];
        if (tab != EDT_EditRecord.currentTab) {
            EDT_EditRecord.toggleTab(tab);
        }
    }
    this.element.focus();
}

REC_Field.prototype.runOnChange = function()
{
    var i;
    for (i = 0; i < this.onChangeFunctions.length; i++) {
        this.onChangeFunctions[i]();
    }
}

REC_Field.prototype.addOnChange = function(func)
{
    this.onChangeFunctions[this.onChangeFunctions.length] = func;
}

REC_Field.prototype.setElementOnChange = function()
{
    DOM_AddEventListener(this.element, 'change', function(obj) { return function() { obj.runOnChange() } }(this));
}

REC_Field.prototype.removeOnChange = function(func)
{
    var i;
    for (i = 0; i < this.onChangeFunctions.length; i++) {
        if (this.onChangeFunctions[i] == func) {
            this.onChangeFunctions.splice(i, 1);
            break;
        }
    }
}

REC_Field.prototype.update = function()
{
}

REC_Field.prototype.setProperties = function(properties)
{
    var property;
    for (property in properties) {
        this[property] = properties[property];
    }
}

function REC_FieldCheckbox(field, name, required, properties)
{
    this.init(field + '_item', name, required, properties);
    this.hidden_id = field + '_hidden';
    this.hidden_element = document.getElementById(this.hidden_id);
}

REC_FieldCheckbox.prototype = new REC_Field;

REC_FieldCheckbox.prototype.get = function()
{
    return this.element.checked ? 1 : 0;
}

REC_FieldCheckbox.prototype.hasData = function()
{
    return true;
}

REC_FieldCheckbox.prototype.setElementOnChange = function()
{
    DOM_AddEventListener(this.element, 'click', function(obj) { return function() { obj.runOnChange() } }(this));
}

REC_FieldCheckbox.prototype.set = function(value)
{
    var old_value = this.get();
    if (value != old_value) {
        this.element.checked = true;
        this.runOnChange();
    }
}

REC_FieldCheckbox.prototype.update = function()
{
    var value = this.get();
    if (value != this.hidden_element.value) {
        this.hidden_element.value = value;
    }
}

function REC_FieldText(id, name, required, properties)
{
    this.init(id, name, required, properties);
}

REC_FieldText.prototype = new REC_Field;

REC_FieldText.prototype.setMaxLength = function(max)
{
    this.max_length = max;
    this.max_length_obj = new TextareaMaxLength(this.element, this.max_length);
    this.addErrorCondition(
        function ()
        {
            if (this.element.value.length > this.max_length) {
                return 'El texto supera el largo máximo';
            } else {
                return false;
            }
        }
    );
}

function REC_FieldReference(id, name, required, properties)
{
    this.init(id, name, required, properties);
}

REC_FieldReference.prototype = new REC_Field;

REC_FieldReference.prototype.hasData = function()
{
    return this.get() != '0';
}

function REC_FieldTl(id, name, required, properties, tl_obj)
{
    tl_obj.on_change_js = function(obj) { return function() { obj.runOnChange() } }(this);
    this.init(id, name, required, properties);
}

REC_FieldTl.prototype = new REC_Field;

REC_FieldReference.prototype.hasData = function()
{
    return this.get() != '0';
}

function REC_Record()
{
    this.fields = [];
}

REC_Record.prototype.addField = function(field_obj)
{
    this.fields[this.fields.length] = field_obj;
}
