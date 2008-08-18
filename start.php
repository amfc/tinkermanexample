<?

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


function DB_QueryOrEnd($query, $message = 'Database error')
{
    $res = mysql_query($query);
    if (!$res) {
        error_log(mysql_error());
        die($message);
    }
    return $res;
}

function DB_GetOneAssocOrEnd($query, $sql_error = 'Database error', $not_found_error = 'Record not found')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    if (!$row = mysql_fetch_assoc($res)) {
        die($not_found_error);
    }
    mysql_free_result($res);
    return $row;
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

mysql_pconnect('localhost', 'root', '');
mysql_select_db('tinkerman_example');
mysql_query('SET NAMES utf8');

?>