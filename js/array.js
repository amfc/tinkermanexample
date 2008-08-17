// Array functions
// -----------------------------------------------
// Version 2
//
// Requires: VAR (it must be loaded before!)
// 
// ......................................................
// Based on Array Extensions  v1.0.5
// http://www.dithered.com/javascript/array/index.html
// code by Chris Nott (chris@NOSPAMdithered.com - remove NOSPAM)
// Modified by Agustín Fernández

// Array.concat() - Join two arrays
if (VAR_IsUndefined(Array.prototype.concat) == true) {
    Array.prototype.concat = function (secondArray)
    {
        var firstArray = this.copy();
        for (var i = 0; i < secondArray.length; i++) {
            firstArray[firstArray.length] = secondArray[i];
        }
        return firstArray;
    }
}

// Array.copy() - Makes a copy of an array, not recursively (if its elements are array or objects they will be references)
if (VAR_IsUndefined(Array.prototype.copy) == true) {
    Array.prototype.copy = function()
    {
        var copy = new Array();
        for (var i = 0; i < this.length; i++) {
            copy[i] = this[i];
        }
        return copy;
    }
}

// Array.clone() - Makes a copy of an array, recursively (if its elements are arrays, they will be copied, however, if they are objects they will be references)
Array.prototype.clone = function()
{
    var out = [];
    for (i in this) {
        if (typeof this[i] == 'array') {
            out[i] = this[i].clone();
        } else {
            out[i] = this[i];
        }
    }
    return out;
}


// Array.pop() - Remove the last element of an array and return it
if (VAR_IsUndefined(Array.prototype.pop) == true) {
    Array.prototype.pop = function()
    {
        var lastItem = null;
        if ( this.length > 0 ) {
            lastItem = this[this.length - 1];
            this.length--;
        }
        return lastItem;
    }
}

// Array.push() - Add an element to the end of an array
if (VAR_IsUndefined(Array.prototype.push) == true) {
    Array.prototype.push = function()
    {
        var currentLength = this.length;
        for (var i = 0; i < arguments.length; i++) {
            this[currentLength + i] = arguments[i];
        }
        return this.length;
    }
}

// Array.shift() - Remove the first element of an array and return it
if (VAR_IsUndefined(Array.prototype.shift) == true) {
    Array.prototype.shift = function()
    {
        var firstItem = this[0];
        for (var i = 0; i < this.length - 1; i++) {
            this[i] = this[i + 1];
        }
        this.length--;
        return firstItem;
    }
}

// Array.slice() - Copy several elements of an array and return them
if (VAR_IsUndefined(Array.prototype.slice) == true) {
    Array.prototype.slice = function(start, end)
    {
        var temp;
        
        if (end == null || end == '') {
            end = this.length;
        } else if (end < 0) {
            // negative arguments measure from the end of the array
            end = this.length + end;
        }
        
        if (start < 0) {
            start = this.length + start;
        }
        
        // swap limits if they are backwards
        if (end < start) {
            temp  = end;
            end   = start;
            start = temp;
        }
        
        // copy elements from array to a new array and return the new array
        var newArray = new Array();
        
        for (var i = 0; i < end - start; i++) {
            newArray[i] = this[start + i];
        }
        
        return newArray;
    }
}

// Array.splice() - Splice out and / or replace several elements of an array and return any deleted elements
if (VAR_IsUndefined(Array.prototype.splice) == true) {
    Array.prototype.splice = function(start, deleteCount)
    {
        if (deleteCount == null || deleteCount == '') {
            deleteCount = this.length - start;
        }
        
        // create a temporary copy of the array
        var tempArray = this.copy();
        
        // Copy new elements into array (over-writing old entries)
        for (var i = start; i < start + arguments.length - 2; i++) {
            this[i] = arguments[i - start + 2];
        }
        
        // Copy old entries after the end of the splice back into array and return
        for (var i = start + arguments.length - 2; i < this.length - deleteCount + arguments.length - 2; i++) {
            this[i] = tempArray[i + deleteCount - arguments.length + 2];
        }
        this.length = this.length - deleteCount + (arguments.length - 2);
        return tempArray.slice(start, start + deleteCount);
    }
}

// Array.unshift - Add an element to the beginning of an array
if (VAR_IsUndefined(Array.prototype.unshift) == true) {
    Array.prototype.unshift = function(the_item)
    {
        for (loop = this.length-1 ; loop >= 0; loop--) {
            this[loop + 1] = this[loop];
        }
        this[0] = the_item;
        return this.length;
    }
}

// Array.indexOf - Gets the index of an element of an array or false if it doesn't exist
if (VAR_IsUndefined(Array.prototype.indexOf) == true) {
    Array.prototype.indexOf = function(item)
    {
        for (var i = 0; i <= this.length; i++) {
            if (this[i] == item) {
                return i;
            }
        }
        return false;
    }
}
