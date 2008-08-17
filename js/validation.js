// VLT: Validation functions
// -----------------------------------------------
// Version 2
//
// Requires:
// VAR: variables version 2

// Validation (these functions change the color of the element if their data is invalid)
// If there was no problem with the data then they return true
// If there was an uncorrectable problem and the data is not valid they return false
// If there was a problem but was corrected then they return the new value

function VLT_ValidateDecimalField(element, min, max, number_digits, fraction_digits)
{
    var n;
    s = element.value.replace(/,/, '.');
    n = Number(s);
    if ((!VAR_IsWhitespace(s)) && (n != NaN) && (n >= min) && (n <= max)) {
        if (Math.floor(n).toString().length > number_digits) { // The number is too long
            element.style.color = '#ff0000';
            return false;
        } else {
            element.style.color = '#000000';
            element.value = n.toFixed(fraction_digits).toString().replace(/\./, ',');
            return element.value;
        }
    } else {
        element.style.color = '#ff0000';
        return false;
    }
}

function VLT_ValidateEmail(element)
{
    if (VAR_IsEmail(element.value)) {
        element.style.color = '#000000';
        return true;
    } else {
        element.style.color = '#ff0000';
        return false;
    }
}

function VLT_ValidateHour(element, min, max)
{
    var h, m, s, temp, temp2;
    
    s = VAR_RemoveWhitespace(element.value);
    
    if (VAR_IsEmpty(s)) { // It's ok if it's empty
        element.style.color = '#000000';
        return true;
    }
    
    if (VAR_IsUndefined(min)) {
        min = 0;
    }
    
    if (VAR_IsUndefined(max)) {
        max = 23;
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
    if (s.length == 2 && (h = Number(s[0])) != NaN && h >= min && h <= max && (m = Number(s[1])) != NaN && m >= 0 && m < 60) {
        temp = h.toString();
        if (temp.length < 2) {
            temp = '0' + temp;
        }
        temp2 = m.toString();
        if (temp2.length < 2) {
            temp2 = '0' + temp2;
        }
        temp = temp + ':' + temp2;
        element.style.color = '#000000';
        if (element.value == temp) {
            return true;
        } else {
            element.value = temp;
            return temp;
        }
    } else if (s.length == 1 && (h = Number(s[0])) != NaN && h >= min && h <= max){
        temp = h.toString();
        if (temp.length < 2) {
            temp = '0' + temp;
        }
        element.style.color = '#000000';
        element.value = temp + ':00';
        return element.value;
    } else {
        element.style.color = '#ff0000';
        return false;
    }
    
}

function VLT_ValidateDate(element)
{
    var s, a, ok, day, month, year, temp;
    s = element.value;
    a = s.split('-');
    
    if (VAR_IsEmpty(s)) { // It's ok if it's empty
        element.style.color = '#000000';
        return true;
    }
    
    if (a.length == 1) {
        a = s.split('/');
    }
    
    if (a.length != 3 || !VAR_IsNumber(a[0], 1, 31)) {
        element.style.color = '#ff0000';
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
            element.style.color = '#ff0000';
            return false;
        }
    } else {
        if (a[1] >= 1 && a[1] <= 12) {
            month = a[1];
        } else {
            element.style.color = '#ff0000';
            return false;
        }
    }
    if (!VAR_IsNumber(a[2])) {
        element.style.color = '#ff0000';
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
        element.style.color = '#ff0000';
        return false;
    }
    
    element.style.color = '#000000';
    temp = day + '-' + VAR_MONTHS_SHORT[month - 1] + '-' + year.toString().substr(2);
    if (element.value == temp) {
        return true;
    } else {
        element.value = temp;
        return temp;
    }
}