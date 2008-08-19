function Highlighter(q) {
    function splitWords(str)
    {
        function trim(s)
        {
            var whitespace = " \t\n\r";
            var i, s2;
            for (i = 0; i < s.length; i++) {
                var c = s.charAt(i);
                if (whitespace.indexOf(c) == -1) {
                    break;
                }
            }
            s = s.substr(i);
            for (i = s.length; i > 0; i--) {
                var c = s.charAt(i);
                if (whitespace.indexOf(c) == -1) {
                    break;
                }
            }
            s = s.substr(0, i + 1);
            return s;
        }
        str = trim(str);
        if (str) {
            return str.split(/\s+/);
        } else {
            return []
        }
    }
    
    function sortByStringLength(array)
    {
        function cloneArray(arr)
        {
            var out = [];
            for (var i in arr) {
                out[i] = arr[i];
            }
            return out;
        }
        var unsorted = true, temp_word;
        array = cloneArray(array); // make a copy of the array
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

    function createHighlightedText(text, unsorted_words, sorted_words)
    {
        // It replaces any accented character from the string with an unaccented version
        function replaceSpecialChars(str)
        {
            function replaceSpecialChar(chr)
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

            return str.replace(/á|é|í|ó|ú|à|è|ì|ò|ù|â|ê|î|ô|û|ä|ë|ï|ö|ü|ñ/ig, replaceSpecialChar);
        }
        function escapeForRegexp(str)
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

        var replaced_text = replaceSpecialChars(text).toLowerCase();
        element = document.createElement('span');
        if (sorted_words.length == 0) {
            element.appendChild(document.createTextNode(text));
            return document.createTextNode(text);
        }
        var regexp_str = '(';
        var i, word;
        for (i = 0; i < sorted_words.length; i++) {
            word = escapeForRegexp(replaceSpecialChars(sorted_words[i]).toLowerCase());
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
            new_span = document.createElement('span');
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

    if (q) {
        var unsorted_words = splitWords(q);
        var sorted_words = sortByStringLength(unsorted_words);
    }
    this.getText = function(str) {
        if (q) {
            return createHighlightedText(str, unsorted_words, sorted_words);
        } else {
            return document.createTextNode(str);
        }
    }
}
