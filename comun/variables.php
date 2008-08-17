<?php

// VAR: Variable functions
// Array, string and time functions

// Obtiene un array con el índice y el elemento de un array que sea igual al texto $str, sin considerar mayúsculas ni minúsculas
function VAR_ArraySearchCI($str, $array)
{
    $result = preg_grep('/^' . preg_quote($str, '/') . '$/i', $array);
    if ($result) {
        return current($result);
    } else {
        return false;
    }
}

function VAR_IsValidEmail($email)
{
    return preg_match('/^([a-z_\-0-9.]+)@((?:[\-a-z0-9]+)(?:\.(?:[\-a-z0-9.])+))$/i', $email);
}

function VAR_StartsWith($texto_a_buscar, $texto_completo)
{
    if (substr($texto_completo, 0, strlen($texto_a_buscar)) == $texto_a_buscar) {
        if ($texto_completo == $texto_a_buscar) {
            return '';
        } else {
            return substr($texto_completo, strlen($texto_a_buscar));
        }
    } else {
        return false;
    }
}

function VAR_EndsWith($texto_a_buscar, $texto_completo)
{
    $indice = strlen($texto_completo) - strlen($texto_a_buscar);
    if (substr($texto_completo, $indice) == $texto_a_buscar) {
        if ($texto_completo == $texto_a_buscar) {
            return '';
        } else {
            return substr($texto_completo, 0, $indice);
        }
    } else {
        return false;
    }
}

function VAR_ArrayStartsWith($elementos_a_buscar, $array_completo)
{
    while (count($elementos_a_buscar)) {
        if (!count($array_completo)) {
            return false;
        }
        if (!(array_shift($elementos_a_buscar) == array_shift($array_completo))) {
            return false;
        }
    }
    return $array_completo;
}


function VAR_RemoveAccents($text)
{
    return strtr(
        strtr($text,
            'ŠŽšžŸÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöøùúûüýÿ',
            'SZszYAAAAAACEEEEIIIINOOOOOOUUUUYaaaaaaceeeeiiiinoooooouuuuyy'
        ),
        array(
            'Þ' => 'TH', 'þ' => 'th', 'Ð' => 'DH', 'ð' => 'dh', 'ß' => 'ss', 'Œ' => 'OE', 'œ' => 'oe', 'Æ' => 'AE', 'æ' => 'ae', 'µ' => 'u'
        )
    );
}

function VAR_GenerateCode($length)
{
    $chars = array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    $r = '';
    for ($i = 0; $i < $length; $i++) {
        $r .= $chars[mt_rand(0, count($chars) - 1)];
    }
    return $r;
}

if (!function_exists('array_combine')) {
    function array_combine($keys, $values)
    {
        $array = array();
        for ($i = 0; $i < count($keys); $i++) {
            $array[$keys[$i]] = $values[$i];
        }
        return $array;
    }
}

function VAR_Highlight($texto, $palabras, $clase = 'highlight')
{
    $trans = array();
    $i = 0;
    
    $texto_sin_acentos = strtolower(VAR_RemoveAccents($texto));
    
    for($i = 0; $i < count($palabras); $i++) {
        $palabras[$i] = strtolower(VAR_RemoveAccents($palabras[$i]));
    }
    
    $trans = array();
    foreach ($palabras as $palabra) {
        $len = strlen($palabra);
        $offset = 0;
        if ($len <= 0) {
            continue;
        }
        while (($pos = strpos($texto_sin_acentos, $palabra, $offset)) !== false) {
            $palabra_exacta = substr($texto, $pos, $len);
            if (!isset($trans[$palabra_exacta]))
            $trans[$palabra_exacta] = "<span class='$clase'>$palabra_exacta</span>";
            $offset = $pos+$len;
        }
    }
    $texto = strtr($texto, $trans);
    
    return $texto;
}

// Deja sólo los primeros caracteres del texto (intentando cortar sólo en una palabra)
function VAR_CutText($texto, $largo)
{
    if (strlen($texto) > $largo) {
        $str = substr($texto, 0, $largo);
        if ($pos = strrpos($str, ' ')) {
            $str = substr($str, 0, $pos - 1);
        }
        $str .= '...';
        $texto = $str;
    }
    return $texto;
}

// Esta función es para reemplazar cosas como %1, %2, %3 en el texto $texto... por variables
// Ejemplo: ParametrizarTexto('%1 texto con %2 valores', $valor1, $valor2);
function VAR_ReplaceParameters($texto)
{
    $c = func_num_args();
    for ($i = 1; $i < $c; $i++) {
        $arg = func_get_arg($i);
        $texto = str_replace('%' . $i, $arg, $texto);
    }
    return $texto;
}

function VAR_MysqlToTimestamp($mysql_date)
{
    if (list($year, $month, $day) = explode('-', $mysql_date)) {
        return mktime(0, 0, 0, $month, $day, $year);
    } else {
        return false;
    }
}

function VAR_DaysPassedSince($timestamp)
{
    return (int) ((time() - $timestamp) / 86400);
}

// Removes the html entities
function VAR_HtmlEntityDecode($string)
{
    $trans_tbl = get_html_translation_table(HTML_ENTITIES);
    $trans_tbl = array_flip($trans_tbl);
    return strtr($string, $trans_tbl);
}

function VAR_HtmlIsEmpty($string)
{
    $i = 0;
    $in_tag = false;
    $in_entity = false;
    $entity = '';
    while ($i < strlen($string)) {
        $c = $string{$i};
        if (!$in_tag) {
            if ($in_entity) {
                if ($c == ';') {
                    $in_entity = false;
                    if ($entity != 'nbsp') {
                        return false;
                    }
                } else {
                    $entity .= $c;
                }
            } else if ($c == '<') {
                $in_tag = true;
            } else if ($c == '&') {
                $in_entity = true;
                $entity = '';
            } else if ($c != ' ' && $c != "\t" && $c != "\r" && $c != "\n") {
                return false;
            }
        } else {
            if ($c == '>') {
                $in_tag = false;
            }
        }
        $i++;
    }
    return true;
}

// Replaces some captured text back into a regexp
// Example:
// with parameters: "hi/how_are_you/([a-z]*)/", array(0 -> ..., 1 -> "pete")
// returns: array("hi/how_are_you/pete/", array(1 -> "[a-z]*", ...))
function VAR_ReplaceInRegexp($regexp, $captures)
{
    $replace_n = 0;
    $out = '';
    $pos = 0;
    $replaced_captures = array();
    while ($pos < strlen($regexp)) {
        $char = $regexp{$pos};
        if ($char == '\\') {
            $escaped = true;
            $char = $regexp{$pos++};
        } else {
            $escaped = false;
        }
        if (!$escaped && $char == '(') {
            if ($regexp{$pos + 1} == '?' && ($regexp{$pos + 2} == ':' || $regexp{$pos + 2} == '#')) {
                $pos += 3;
                if ($regexp{$pos - 1} == '#') {
                    while ($regexp{$pos++} != ')') {
                    }
                }
            } else {
                // encontré un abrir paréntesis, busco el cerrar paréntesis que le corresponda
                $deepness = 1;
                $start_pos = $pos;
                $pos++;
                $replace_n++;
                while ($pos < strlen($regexp) && ($deepness > 0)) {
                    $char = $regexp{$pos};
                    if ($char == '\\') {
                        $escaped = true;
                        $char = $regexp{$pos++};
                    } else {
                        $escaped = false;
                    }
                    if (!$escaped) {
                        if ($char == '(') {
                            $deepness++;
                            if ($regexp{$pos + 1} == '?' && ($regexp{$pos + 2} == ':' || $regexp{$pos + 2} == '#')) {
                                $pos = $pos + 2;
                            } else {
                                $replace_n++;
                            }
                        } else if ($char == ')') {
                            $deepness--;
                        }
                    }
                    $pos++;
                }
                $replaced_captures[$replace_n] = substr($regexp, $start_pos + 1, $pos - $start_pos - 2);
                $out .= $captures[$replace_n];
            }
        } else if (!($escaped && $char == ')')) { // Las ')' no escapadas no las mostramos
            $out .= $char;
            $pos++;
        }
    }
    return array($out, $replaced_captures);
}

function VAR_GetSimpleFileNameForUrl($original_name)
{
    $original_name = VAR_RemoveAccents(strtolower(substr($original_name, 0, 30)));
    $allowed_chars = 'abcdefghijklmnopqrstuvwxyz0123456789-_.,';
    $new_name = '';
    for ($i = 0; $i < strlen($original_name); $i++) {
        $char = $original_name{$i};
        if (strpos($allowed_chars, $char) !== false) {
            $new_name .= $char;
        } else {
            $new_name .= '-';
        }
    }
    return $new_name;
}

function VAR_GetSimpleNameForUrl($text)
{
    $ok = 'abcdefghijklmnopqrstuvwxy0123456789+-.,';
    
    $text = strtolower(VAR_RemoveAccents($text));
    $out = '';
    for ($i = 0; $i < strlen($text); $i++) {
        if (strpos($ok, $text{$i}) !== false) {
            $out .= $text{$i};
        } else if ($i && !($text{$i - 1} == '-')) {
            $out .= '-';
        }
    }
    while (substr($text, -1) == '-') {
        $text = substr($text, 0, strlen($text) - 1);
    }
    return $out;
}


?>