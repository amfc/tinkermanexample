// DIC: Dictionary object
// -----------------------------------------------
// Version 2.1
//
// Requires: none


// keys_and_values is optional and can be an array in the form [[key, value], ...]

function DIC_Iterator(dict_obj)
{
    this.obj = dict_obj;
    this.value = null;
    this.key = null;
    this.currentIndex = 0;
}

DIC_Iterator.prototype.current = function()
{
    if (this.currentIndex < this.obj.length) {
        this.key = this.obj.keys[this.currentIndex];
        this.value = this.obj.values[this.currentIndex];
        return true;
    } else {
        this.value = null;
        this.key = null;
        return false;
    }
}

DIC_Iterator.prototype.next = function()
{
    var current = this.current();
    if (current !== false) {
        this.currentIndex++;
    }
    return current;
}

DIC_Iterator.prototype.reset = function()
{
    this.currentIndex = 0;
}

function DIC_Dict(keys_and_values)
{
    this.currentIndex = 0;
    this.length = 0;
    this.values = [];
    this.keys = [];
    
    if (typeof keys_and_values != 'undefined') {
        var i;
        for (i = 0; i < keys_and_values.length; i++) {
            this.set(keys_and_values[i][0], keys_and_values[i][1]);
        }
    }
}

DIC_Dict.prototype.get = function(key)
{
    for (var i = 0; i < this.length; i++) {
        if (this.keys[i] == key) {
            return this.values[i];
        }
    }
    throw new this.keyDoesNotExistException(key);
}
    
// This is like get, but returns 0 if the key does not exist
DIC_Dict.prototype.getValue = function(key)
{
    var value, e;
    try {
        value = this.get(key);
    } catch (e) {
        value = 0;
    }
    return value;
}

DIC_Dict.prototype.set = function(key, value)
{
    for (var i = 0; i < this.length; i++) {
        if (this.keys[i] == key) {
            this.values[i] = value;
            return;
        }
    }
    this.keys.push(key);
    this.values.push(value);
    this.length++;
}

// Adds 1 (or value) to the key in the dictionary, if the key does not exist, create it
DIC_Dict.prototype.add = function(key, value)
{
    if (typeof value == 'undefined') {
        value = 1;
    }
    for (var i = 0; i < this.length; i++) {
        if (this.keys[i] == key) {
            this.values[i] += value;
            return;
        }
    }
    this.keys.push(key);
    this.values.push(value);
    this.length++;
}

DIC_Dict.prototype.unset = function(key)
{
    for (var i = 0; i < this.length; i++) {
        if (this.keys[i] == key) {
            this.keys.splice(i, 1);
            this.values.splice(i, 1);
            this.length--;
            return;
        }
    }
    throw new this.keyDoesNotExistException(key);
}

DIC_Dict.prototype.has = function(key)
{
    for (var i = 0; i < this.length; i++) {
        if (this.keys[i] == key) {
            return true;
        }
    }
    return false;
}

DIC_Dict.prototype.current = function()
{
    if (this.currentIndex < this.length) {
        return [this.keys[this.currentIndex], this.values[this.currentIndex]];
    } else {
        return false;
    }
}

DIC_Dict.prototype.next = function()
{
    var current = this.current();
    if (current !== false) {
        this.currentIndex++;
    }
    return current;
}

DIC_Dict.prototype.reset = function()
{
    this.currentIndex = 0;
}

DIC_Dict.prototype.getIterator = function()
{
    return new DIC_Iterator(this);
}

DIC_Dict.prototype.keyDoesNotExistException = function(key)
{
    this.type = 'key_does_not_exist';
    this.toString = function()
    {
        return "Key '" + key + "' is not present in the dictionary";
    }
}

DIC_Dict.prototype.toString = function()
{
    var str = '<';
    for (var i = 0; i < this.length; i++) {
        if (i) {
            str += ', ';
        }
        str += this.keys[i] + ': ' + this.values[i];
    }
    return str + '>';
}

DIC_Dict.prototype.map = function(callback)
{
    for (var i = 0; i < this.length; i++) {
        callback(this.keys[i], this.values[i]);
    }
}