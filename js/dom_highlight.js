// DMH: Dom Highlight, functions to highlight text inside a document
//
// Requires: VAR

function DMH_SortByStringLength(array)
{
    var unsorted = true, temp_word;
    array = VAR_CloneArray(array); // make a copy of the array
    while (unsorted) {
        unsorted = false; // we start suggesting that everything is sorted
        for (i = 0; i < array.length - 1; i++) {
            if (array[i].length < array[i + 1].length) { // if it is not sorted, flip and mark as unsorted
                temp_word = array[i];
                array[i] = array[i + 1];
                array[i + 1] = temp_word;
                unsorted = true;
            }
        }
    }
    return array;
}

function DMH_CreateHighlightedText(text, unsorted_words, sorted_words)
{
    var replaced_text = DMH_ReplaceSpecialChars(text).toLowerCase();
    if (VAR_IsUndefined(sorted_words)) {
        sorted_words = DMH_SortByStringLength(unsorted_words);
    }
    element = document.createElement('span');
    if (sorted_words.length == 0) {
        element.appendChild(document.createTextNode(text));
        return document.createTextNode(text);
    }
    var regexp_str = '(';
    var i, word;
    for (i = 0; i < sorted_words.length; i++) {
        word = DMH_EscapeForRegexp(DMH_ReplaceSpecialChars(sorted_words[i]).toLowerCase());
        if (i) regexp_str += '|';
        regexp_str += word;
    }
    regexp_str += ')';
    var regexp = new RegExp(regexp_str, 'i')
    var pos = 0;
    var local_pos = 0;
    var result;
    var new_string = '';
    var ii;
    var temp_text = replaced_text;
    var new_text, new_span;
    var matched_word;
    i = 0;
    while (1) {
        result = regexp.exec(temp_text);
        if (!result) {
            break;
        }
        // Unmatched text
        new_text = document.createTextNode(text.substr(pos, result.index));
        element.appendChild(new_text);
        new_span = document.createElement('SPAN');
        matched_word = result[1];
        new_span.className = 'highlighted';
        new_span.appendChild(document.createTextNode(text.substr(pos + result.index, matched_word.length)));
        element.appendChild(new_span);
        pos += result.index + matched_word.length;
        temp_text = temp_text.substr(result.index + matched_word.length);
        i++;
    }
    
    new_text = document.createTextNode(text.substr(pos));
    element.appendChild(new_text);
    return element;
}

function DMH_EscapeForRegexp(str)
{
    str = str.replace('\\', '\\\\');
    str = str.replace('|', '\\|');
    str = str.replace('(', '\\(');
    str = str.replace(')', '\\)');
    str = str.replace('\'', '\\\'');
    str = str.replace('"', '\\"');
    str = str.replace('%', '\\%');
    str = str.replace('+', '\\+');
    str = str.replace('*', '\\*');
    str = str.replace('{', '\\{');
    str = str.replace('.', '\\.');
    return str;
}


// It return an an unaccented version of an accented character
function DMH_ReplaceSpecialChar(chr)
{
    var special_chars = 'áéíóúàèìòùâêîôûäëïöüÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜñÑ';
    var replace_chars = 'aeiouaeiouaeiouaeiuoAEIOUAEIOUAEIOUAEIOUnN';
    var pos = special_chars.indexOf(chr);
    if (pos >= 0) {
        return replace_chars.charAt(pos);
    } else {
        return chr;
    }
}

// It replaces any accented character from the string with an unaccented version
function DMH_ReplaceSpecialChars(str)
{
    return str.replace(/á|é|í|ó|ú|à|è|ì|ò|ù|â|ê|î|ô|û|ä|ë|ï|ö|ü|ñ/ig, DMH_ReplaceSpecialChar);
}
