<?

function JS_GetObj($elemento)
{
    $tipo = gettype($elemento);
    $numeros = array("integer", "double");
    $resultado = '';
    if (in_array($tipo, $numeros)) {
        $resultado .= "$elemento";
    } else if ($tipo == 'boolean') {
        $resultado .= ($elemento) ? '1' : '0';
    } else if ($tipo == 'string') {
        $resultado .= "'" . JS_Escape($elemento) . "'";
    } else if ($tipo == 'array') {
        reset($elemento);
        $is_dict = (count($elemento) && key($elemento) !== 0); // We only use dictionaries if the array first key is not the number 0
        if ($is_dict) {
            $resultado .= "{";
            $i = 0;
            foreach ($elemento as $key => $val) {
                if ($i) {
                    $resultado .= ', ';
                }
                $resultado .= JS_GetObj($key) . ': ' . JS_GetObj($val);
                $i++;
            }
            $resultado .= "}";
        } else {
            $resultado .= "[";
            $i = 0;
            foreach ($elemento as $val) {
                if ($i) {
                    $resultado .= ', ';
                }
                $resultado .= JS_GetObj($val);
                $i++;
            }
            $resultado .= "]";
        }
    } else if ($tipo == 'NULL') {
        $resultado .= 'null';
    } else {
        return false;
    }
    return $resultado;
}

function JS_Escape($str)
{
    return strtr($str, array("'" => "\\'", "\n" => "\\n", "\r" => "\\r"));
}


?>