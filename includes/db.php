<?php

function DB_Escape($text)
{
    $text = strtr($text, array(
      '\\' => '\\\\',
      '\'' => '\\\'',
      '"' => '\\"',
    ));
    return $text;
}

function DB_EscapeLike($text)
{
    $text = strtr($text, array(
      '\\' => '\\\\',
      '\'' => '\\\'',
      '"' => '\\"',
      '%' => '\\%',
      '_' => '\\_',
    ));
    return $text;
}


function DB_Query($query)
{
    if (DEBUG >= 4) {
        DEB_Log($query);
    }
    return mysql_query($query);
}

function DB_QueryOrEnd($query, $message = 'Database error')
{
    $res = DB_Query($query);
    if (!$res) {
        DEB_LogWithTrace("Query:\n" . $query . "\nError:\n" . mysql_error(), 'DB SQL error');
        EndWithError($message);
    }
    return $res;
}

function DB_GetOneAssocOrEnd($query, $sql_error = 'Database error', $not_found_error = 'Record not found')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    if (!$row = mysql_fetch_assoc($res)) {
        DEB_LogWithTrace("Query:\n" . $query, 'DB Record not found');
        EndWithError($not_found_error);
    }
    mysql_free_result($res);
    return $row;
}

function DB_GetOneAssoc($query, $sql_error = 'Database error')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    $row = mysql_fetch_assoc($res);
    mysql_free_result($res);
    if ($row) {
        return $row;
    } else {
        return array();
    }
}

function DB_GetAllAssocOrEnd($query, $sql_error = 'Database error')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    $rows = array();
    while ($row = mysql_fetch_assoc($res)) {
        $rows[] = $row;
    }
    mysql_free_result($res);
    return $rows;
}

?>