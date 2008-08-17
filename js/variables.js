// VAR: Variable functions
// -----------------------------------------------
// Version 2.4
//
// Requires; none

var VAR_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var VAR_MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
var VAR_WHITESPACE = " \t\n\r";

function VAR_IsUndefined(property)
{
  return (typeof property == 'undefined');
}

function VAR_IsEmpty(s)
{
    return ((s == null) || (s.length == 0))
}

function VAR_IsNumber(s, min, max)
{
    var n;
    n = Number(s);
    if ((!VAR_IsWhitespace(s)) && !isNaN(n) && (VAR_IsUndefined(min) || (n >= min)) && (VAR_IsUndefined(max) || (n <= max))) {
        return true;
    } else {
        return false;
    }
}

function VAR_IsHour(s, min, max)
{
    var h, m;
    s = VAR_RemoveWhitespace(s);
    if (s.substr(s.length - 3) == 'hs.') {
        s = s.substr(0, s.length - 3);
    } else if (s.substr(s.length - 2) == 'hs') {
        s = s.substr(0, s.length - 2);
    }  else if (s.substr(s.length - 1) == 'h') {
        s = s.substr(0, s.length - 1);
    }
    
    s = VAR_RemoveWhitespace(s);
    s = s.split(':');
    if (s.length == 2 && (h = Number(s[0])) != NaN && h >= min && h <= max && (m = Number(s[1])) != NaN && m >= 0 && m < 60) {
        return true;
    } else {
        return false;
    }
}

function VAR_IsWhitespace(s)
{
    var i;
    // Is s empty?
    if (VAR_IsEmpty(s)) {
        return true;
    }
    // Search through string's characters one by one
    // until we find a non-whitespace character.
    // When we do, return false; if we don't, return true.
    for (i = 0; i < s.length; i++) {
        // Check that current character isn't whitespace.
        var c = s.charAt(i);
        if (VAR_WHITESPACE.indexOf(c) == -1) {
            return false;
        }
    }
    // All characters are whitespace.
    return true;
}

function VAR_IsEmail(s)
{
    if (VAR_IsEmpty(s)) {
        return false
    }
    
    // is s whitespace?
    if (VAR_IsWhitespace(s)) {
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

function VAR_IsArray(a)
{
    return typeof a == 'object' && a.constructor == Array;
}

function VAR_GetDateFromString(s)
{

    var a, ok, day, month, year, temp;
    
    a = s.split('-');
    
    if (a.length == 1) {
        a = s.split('/');
    }
    
    if (a.length != 3 || !VAR_IsNumber(a[0], 1, 31)) {
        return false;
    }
    
    day = Number(a[0]);
    
    if (!VAR_IsNumber(a[1])) {
        a[1] = VAR_RemoveWhitespace(a[1]).toLowerCase();
        ok = false;
        for (i = 0; i < 12; i++) {
            if (a[1] == VAR_MONTHS_SHORT[i].toLowerCase() || a[1] == VAR_MONTHS[i].toLowerCase()) {
                ok = true;
                month = i + 1;
                break;
            }
        }
        if (!ok) {
            return false;
        }
    } else {
        if (a[1] >= 1 && a[1] <= 12) {
            month = a[1];
        } else {
            return false;
        }
    }
    if (!VAR_IsNumber(a[2])) {
        return false;
    }
    a[2] = Number(a[2]).toString();
    
    if (a[2].length <= 2) {
        if (a[2] >= 69) {
            year = 1900 + Number(a[2]);
        } else {
            year = 2000 + Number(a[2]);
        }
    } else if (a[2].length == 4) {
        year = Number(a[2]);
    } else {
        return false;
    }
    
    return {'day': day, 'month': month, 'year': year};
}

function VAR_GetHourFromString(str)
{
    var h, m, s, temp, temp2;
    
    s = VAR_RemoveWhitespace(str);
    
    if (VAR_IsEmpty(s)) { // It's ok if it's empty
        return false;
    }
    
    if (s.substr(s.length - 3) == 'hs.') {
        s = s.substr(0, s.length - 3);
    } else if (s.substr(s.length - 2) == 'hs') {
        s = s.substr(0, s.length - 2);
    }  else if (s.substr(s.length - 1) == 'h') {
        s = s.substr(0, s.length - 1);
    }
    s = VAR_RemoveWhitespace(s);
    
    s = s.split(':');
    if (s.length == 2 && (h = Number(s[0])) != NaN && h >= 0 && h <= 23 && (m = Number(s[1])) != NaN && m >= 0 && m < 60) {
        return {'hour': h, 'minutes': m};
    } else if (s.length == 1 && (h = Number(s[0])) != NaN && h >= 0 && h <= 23){
        return {'hour': h, 'minutes': 0};
    } else {
        return false;
    }
}

function VAR_RemoveWhitespace(s)
{
    var i, s2;
    for (i=0; i<s.length; i++) {
        var c = s.charAt(i);
        if (VAR_WHITESPACE.indexOf(c) == -1) {
            break;
        }
    }
    
    s=s.substr(i);
    
    for (i=s.length; i>0; i--) {
        var c = s.charAt(i);
        if (VAR_WHITESPACE.indexOf(c) == -1) {
            break;
        }
    }
    
    s = s.substr(0, i+1);
    return s;
}

function VAR_AddWord(str, word)
{
    var list, i;
    list = str.split(/\s+/);
    for (i = 0; i < list.length; i++) {
        if (list[i] == word) {
            return str;
        }
    }
    if (i) {
        str += ' ';
    }
    return str + word;
}

function VAR_RemoveWord(str, word)
{
    var list, i, str2 = '', c = 0;
    list = str.split(/\s+/);
    for (i = 0; i < list.length; i++) {
        if (list[i] != word) {
            if (c) {
                str2 += ' ';
            }
            str2 += list[i];
            c++;
        }
    }
    return str2;
}

function VAR_HasWord(str, word)
{
    var list, i;
    list = str.split(/\s+/);
    for (i = 0; i < list.length; i++) {
        if (list[i] == word) {
            return true;
        }
    }
    
    return false;
}

function VAR_EndsWith(complete_string, part)
{
    return complete_string.substr(-part.length) == part;
}

function VAR_StartsWith(complete_string, part)
{
    if (complete_string.substr(0, part.length) == part) {
        return complete_string.substr(part.length);
    } else {
        return false;
    }
}

function VAR_HtmlSpecialChars(str)
{
    str = str.replace('&', '&amp;');
    str = str.replace('<', '&lt;');
    str = str.replace('>', '&gt;');
    str = str.replace('"', '&quot;');
    return str;
}

function VAR_NlToBr(source_code)
{
    return source_code.replace(/\r\n|\r|\n/g, '<br>');
}

function VAR_SplitWords(str)
{
    str = VAR_RemoveWhitespace(str);
    if (str) {
        return str.split(/\s+/);
    } else {
        return []
    }
}

// Array.clone() - Makes a copy of an array, recursively (if its elements are arrays, they will be copied, however, if they are objects they will be references)
function VAR_CloneArray(arr)
{
    var out = [];
    for (i in arr) {
        if (typeof arr[i] == 'array') {
            out[i] = arr[i].clone();
        } else {
            out[i] = arr[i];
        }
    }
    return out;
}
