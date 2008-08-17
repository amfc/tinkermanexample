<?php

function EndWithError($message, $title = 'Error')
{
    global $ERROR_FUNCTION;
    
    if (isset($ERROR_FUNCTION)) {
        $ERROR_FUNCTION($message, $title);
    } else {
        die($message);
    }
}

function gMsg($string, $title = false, $color = 'gray', $margin_left = '0pt')
{
    $r = "<pre><div style='background-color: white; font-family: monospace; font-size: 8pt; border: solid $color medium; padding: 0.5em; margin: 5pt; margin-left: $margin_left; white-space: -moz-pre-wrap'>";
    if ($title !== false) {
        $r .= "<strong>$title</strong>\n";
    }
    $r .= $string . "</div></pre>";
    return $r;
}

function eMsg($string, $title = false, $color = 'gray', $margin_left = '0pt')
{
    echo gMsg($string, $title, $color, $margin_left);
}

function gTextVar($variable)
{
    ob_start();
    var_dump($variable);
    $string = ob_get_contents();
    ob_end_clean();
    return trim($string);
}

function gVar($variable, $title = false, $color = 'gray', $margin_left = '0pt')
{
    ob_start();
    var_dump($variable);
    $string = htmlspecialchars(ob_get_contents());
    ob_end_clean();
    return gMsg($string, $title, $color, $margin_left);
}

function eVar($string, $title = false, $color = 'gray', $margin_left = '0pt')
{
    echo gVar($string, $title, $color, $margin_left);
}

class DEB_TimeClass
{
    var $start;
    var $end;
    
    function DEB_TimeClass()
    {
        $t = explode(" ", microtime());
        $this->start = $t[0] + $t[1]; 
    }
    
    function get()
    {
        $t = explode(" ", microtime());
        $this->end = $t[0] + $t[1]; 
        return $this->end - $this->start;
    }
}

function DEB_Log($text, $title = '')
{
    global $TIEMPO;
    if ($TIEMPO) {
        error_log(RAND_ID . ' - ' . number_format($TIEMPO->get(), 3) . ' - ' . ($title ? $title . ' - ' : '') . $text);
    } else {
        error_log(RAND_ID . ' - ' . ($title ? $title . ' - ' : '') . $text);
    }
}

function DEB_LogVar($variable, $title = '')
{
    DEB_Log(gTextVar($variable), $title);
}

function DEB_LogWithTrace($message, $title = '')
{
    $traces = debug_backtrace();
    $text = 'Backtrace:';
    foreach ($traces as $trace) {
        $text .= "\n";
        if (isset($trace['class'])) {
            $text .= $trace['class'];
            if (isset($trace['type'])) {
                $text .= $trace['type'];
            } else {
                $text .= ', ';
            }
            if (isset($trace['function'])) {
                $text .= $trace['function'] . '()';
            }
        } else if (isset($trace['function'])) {
            $text .= $trace['function'] . '()';
        }
        if (isset($trace['file'])) {
            $text .= ' - "' . $trace['file'] . '"';
        }
        if (isset($trace['line'])) {
            $text .= ' - line ' . $trace['line'];
        }
    }
    
    DEB_Log($message . "\n" . $text, $title);
}

?>