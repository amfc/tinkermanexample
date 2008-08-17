<?php

// DB: Database functions
// Requires: SQL, debug
// Version 1.2

function DB_GetRecordName($table, $id)
{
    $select = new SQL_Select($table);
    $select->addField("{$table}_idioma.nombre");
    $select->addLang($table);
    $select->addWhere("$table.id='" . addslashes($id) . "'");
    $q_str = $select->get();
    $q = DB_Query($q_str);
    if (!$q) {
        DEB_Log('Error en el query en el archivo ' . __FILE__ . ', línea ' . __LINE__ . ":\n\nQuery:\n" . $q_str . "\n\nError:\n" . mysql_error());
        EndWithError('Database error');
    }
    if ($row = mysql_fetch_row($q)) {
        return $row[0];
    } else {
        return false;
    }
}

function DB_GetRecordId($table, $name, $campos_extra = array(), $campos_extra_de_idioma = array())
{
    $name = trim(ucfirst(strtolower($name)));
    $q_str = "SELECT {$table}.id FROM {$table}, {$table}_idioma WHERE nombre='" . addslashes($name) . "' && idioma_id=1 && {$table}_idioma.id={$table}.{$table}_idioma_id";
    
    foreach ($campos_extra as $campo => $valor) {
        $q_str .= " && ($table.$campo='" . addslashes($valor) . "')";
    }
    
    $q = DB_Query($q_str);
    if (!$q) {
        eMsg("Error de SQL el campo $name:\n$q_str \n\n" . mysql_error(), "Error", 'red');
        return false;
    }
    if (mysql_num_rows($q) == 0) {
        $insert = new SQL_Insert("{$table}_idioma");
        $insert->set('nombre', $name);
        $insert->set('idioma_id', '1');
        $insert->set('fecha_de_creacion', 'NOW()', true);
        $insert->set('fecha_de_modificacion', 'NOW()', true);
        foreach ($campos_extra_de_idioma as $campo => $valor) {
            $insert->set("{$table}_idioma.$campo", $valor);
        }
        
        $q_str = $insert->get();
        if (!($q = DB_Query($q_str))) {
            eMsg("Error de SQL al insertar el idioma de $name:\n$q_str \n\n" . mysql_error(), "Error", 'red');
            return false;
        } else {
            $id = mysql_insert_id();
        }
        
        $insert = new SQL_Insert($table);
        $insert->set("{$table}_idioma_id", $id);
        $insert->set('fecha_de_creacion', 'NOW()', true);
        $insert->set('fecha_de_modificacion', 'NOW()', true);
        foreach ($campos_extra as $campo => $valor) {
            $insert->set("$table.$campo", $valor);
        }
        
        $q_str = $insert->get();
        if (!($q = DB_Query($q_str))) {
            eMsg("Error de SQL al insertar el nuevo registo $name:\n$q_str \n\n" . mysql_error(), "Error", 'red');
            return false;
        }
        
        return mysql_insert_id();
        
    } else {
        list($id) = mysql_fetch_row($q);
        return $id;
    }
}

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

function DB_GetOneOrEnd($query, $sql_error = 'Database error', $not_found_error = 'Record not found')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    if (!$row = mysql_fetch_row($res)) {
        DEB_LogWithTrace("Query:\n" . $query, 'DB Record not found');
        EndWithError($not_found_error);
    }
    mysql_free_result($res);
    return $row;
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

function DB_GetOne($query, $sql_error = 'Database error')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    $row = mysql_fetch_row($res);
    mysql_free_result($res);
    if ($row) {
        return $row;
    } else {
        return array();
    }
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

function DB_GetOneFieldOrEnd($query, $sql_error = 'Database error', $not_found_error = 'Record not found')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    if (!list($field) = mysql_fetch_row($res)) {
        DEB_LogWithTrace("Query:\n" . $query, 'DB Record not found');
        EndWithError($not_found_error);
    }
    mysql_free_result($res);
    return $field;
}

function DB_GetOneField($query, $sql_error = 'Database error', $not_found_error = 'Record not found')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    if (!list($field) = mysql_fetch_row($res)) {
        return false;
    }
    mysql_free_result($res);
    return $field;
}

function DB_GetAllOrEnd($query, $sql_error = 'Database error')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    $rows = array();
    while ($row = mysql_fetch_row($res)) {
        $rows[] = $row;
    }
    mysql_free_result($res);
    return $rows;
}

function DB_GetOneFieldForAllOrEnd($query, $sql_error = 'Database error')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    $fields = array();
    while ($row = mysql_fetch_row($res)) {
        $fields[] = $row[0];
    }
    mysql_free_result($res);
    return $fields;
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

// Returns a dictionary array having the first field as key and the second as value
// array( field1_row1 -> field2_row1, field2_row2 -> field2_row2, ... )
function DB_GetAllAsDictOrEnd($query, $sql_error = 'Database error')
{
    $res = DB_QueryOrEnd($query, $sql_error);
    $dict = array();
    while (list($key, $value) = mysql_fetch_row($res)) {
        $dict[$key] = $value;
    }
    mysql_free_result($res);
    return $dict;
}



?>