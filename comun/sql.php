<?php

// SQL: SQL Classes and functions

// Requires: DB

// Version 1.4

class SQL_Insert
{
    var $fields = array();
    var $table;
    
    function SQL_Insert($table)
    {
        $this->table = $table;
    }
    
    function set($field, $value)
    {
        $this->fields[$field] = array(true, $value);
    }
    
    function setUnquoted($field, $value)
    {
        $this->fields[$field] = array(false, $value);
    }
    
    function get()
    {
        $sql = "INSERT INTO {$this->table} (";
        $c = 0;
        foreach ($this->fields as $field => $array_value) {
            if ($c > 0) {
                $sql .= ", ";
            }
            $sql .= $field;
            $c++;
        }
        $sql .= ") VALUES (";
        $c = 0;
        foreach ($this->fields as $field => $array_value) {
            if ($c > 0) {
                $sql .= ", ";
            }
            if ($array_value[0]) { // Must it be quoted?
                $sql .= "'" . addslashes($array_value[1]) . "'";
            } else {
                $sql .= addslashes($array_value[1]);
            }
            $c++;
        }
        $sql .= ")";
        return $sql;
    }
}

class SQL_Replace
{
    var $fields = array();
    var $table;
    
    function SQL_replace($table)
    {
        $this->table = $table;
    }
    
    function set($field, $value)
    {
        $this->fields[$field] = $value;
    }
    
    function get()
    {
        $sql = "REPLACE INTO {$this->table} (";
        $c = 0;
        foreach ($this->fields as $field => $value) {
            if ($c > 0) {
                $sql .= ", ";
            }
            $sql .= $field;
            $c++;
        }
        $sql .= ") VALUES (";
        $c = 0;
        foreach ($this->fields as $field => $value) {
            if ($c > 0) {
                $sql .= ", ";
            }
            $sql .= "'" . addslashes($value) . "'";
            $c++;
        }
        $sql .= ")";
        return $sql;
    }
}

class SQL_Select
{
    var $fields = array();  // SELECT field1, field2...
    var $tables = array();  // FROM table1, table2...
    var $table = false;  // table1
    var $wheres = array();  // WHERE where1, where2...
    var $havings = array(); // HAVING having1, having2...
    var $groups = array();  // GROUP BY group1, group2...
    var $orders = array();  // ORDER BY order1, order2...
    var $start = 0;         // LIMIT start, count
    var $count = false;
    var $distinct = false;
    
    var $left_join_tables = array();
    
    function SQL_Select($table = false, $as = false)
    {
        if ($as) {
            $this->table = $as;
            $this->addTable($table . " AS $as");
        } else {
            $this->table = $table;
            $this->addTable($table);
        }
    }
    
    function addField($field)
    {
        $this->fields[] = $field;
    }
    
    function setDistinct($value) /* true or false */
    {
        $this->distinct = (boolean) $value;
    }
    
    function addFields($fields, $table = false)
    {
        foreach ($fields as $field) {
            if ($table !== false) {
                $field = $table . '.' . $field;
            }
            $this->addField($field);
        }
    }
    
    function addTable($table)
    {
        $this->tables[] = $table;
    }
    
    function addLeftJoin($table, $on = false, $as = false)
    {
        if ($on === false) {
            if (!$this->table) {
                DEB_Log("A call to ->add_left_join was made without \$on and without a main table defined");
            }
            if ($as) {
                $on = "{$as}.id = {$this->table}.{$table}_id";
            } else {
                $on = "{$table}.id = {$this->table}.{$table}_id";
            }
        }
        if ($as) {
            $table = "$table AS $as";
        }
        
        $this->left_join_tables[] = array($table, '(' . $on . ')');
    }
    
    function addJoin($table, $on = false, $as = false)
    {
        if ($on === false) {
            if (!$this->tables) {
                DEB_Log("A call to ->add_join was made without \$on and without tables defined");
            }
            if ($as) {
                $on = "{$as}.id={$this->table}.{$table}_id";
            } else {
                $on = "{$table}.id={$this->table}.{$table}_id";
            }
        }
        
        if ($as) {
            $table = "$table AS $as";
        }
        
        $this->addTable($table);
        $this->addWhere("$on");
    }
    
    /* Add a table by left join considering the language */
    function addLangJoin($table, $lang_id = false, $table_as = false, $lang_as = false)
    {
        global $LANG_ID;
        if ($lang_id === false) {
            $lang_id = $LANG_ID;
        }
        if (!$this->table) {
            DEB_Log("A call to ->add_table_join was made without the main table defined");
        }
        if ($table_as) {
            $this->addLeftJoin("$table AS $table_as", "{$as}.id={$this->table}.{$table}_id");
            $table_nic = $table_as;
        } else {
            $this->addLeftJoin($table, "{$table}.id={$this->table}.{$table}_id");
            $table_nic = $table;
        }
        
        $lang_table = $table . '_idioma';
        
        if ($lang_as) {
            $lang_nic = $lang_as;
            $lang_table .= " AS $lang_as";
        } else {
            $lang_nic = $lang_table;
        }
        
        $this->addLeftJoin($lang_table, "$table_nic.{$table}_idioma_id={$lang_nic}.id && {$lang_nic}.idioma_id='" . addslashes($lang_id) . "'");
    }
    
    /* Add a language to an already joined table */
    function addLang($table, $lang_id = false, $table_as = false, $lang_as = false)
    {
        global $LANG_ID;
        
        if ($lang_id === false) {
            $lang_id = $LANG_ID;
        }
        
        if ($table_as) {
            $table_nic = $table_as;
        } else {
            $table_nic = $table;
        }
        
        $lang_table = $table . '_idioma';
        
        if ($lang_as) {
            $lang_nic = $lang_as;
            $lang_table .= " AS $lang_as";
        } else {
            $lang_nic = $lang_table;
        }
        
        $this->addLeftJoin($lang_table, "$table_nic.{$table}_idioma_id={$lang_nic}.id && {$lang_nic}.idioma_id='" . addslashes($lang_id) . "'");
    }
    
    function addWhereFieldIsInArray($field, $array)
    {
        $where = '';
        foreach ($array as $element) {
            if ($where) {
                $where .= ' || ';
            }
            $where .= '(' . $field . '="' . addslashes($element) . '")';
        }
        $this->addWhere($where);
    }
    
    function addWhereFieldIsNotInArray($field, $array)
    {
        if ($array) {
            $where = '';
            foreach ($array as $element) {
                if ($where) {
                    $where .= ' && ';
                }
                $where .= '(' . $field . '!="' . addslashes($element) . '")';
            }
            $this->addWhere($where);
        }
    }
    
    function addWhereFieldEquals($field, $value)
    {
        $where = $field . '="' . addslashes($value) . '"';
        $this->addWhere($where);
    }
    
    function addWhere($string)
    {
        $this->wheres[] = '(' . $string . ')';
    }
    
    function addHaving($string)
    {
        $this->havings[] = '(' . $string . ')';
    }
    
    function addGroup($string)
    {
        $this->groups[] = $string;
    }
    
    function addOrder($string)
    {
        $this->orders[] = $string;
    }
    
    function addLimit($start, $count)
    {
        $this->start = $start;
        $this->count = $count;
    }
    

    function get()
    {
        if (!$this->fields || !$this->tables) {
            DEB_Log("SQL_Select needs at least one table and one field");
            return false;
        }
        
        $sql = "SELECT ";
        
        if ($this->distinct) {
            $sql .= "DISTINCT ";
        }
        
        $sql .= implode(', ', $this->fields). " FROM (" . implode(', ', $this->tables) . ")";
        
        foreach ($this->left_join_tables as $table_join) {
            list($table, $on) = $table_join;
            $sql .= " LEFT JOIN $table ON $on";
        }
        
        if ($this->wheres) {
            $sql .= " WHERE " . implode(' && ', $this->wheres);
        }
        
        if ($this->havings) {
            $sql .= " HAVING " . implode(' && ', $this->havings);
        }
        
        if ($this->groups) {
            $sql .= " GROUP BY " . implode(', ', $this->groups);
        }
        
        if ($this->orders) {
            $sql .= " ORDER BY " . implode(', ', $this->orders);
        }
        
        if ($this->count) {
            $sql .= " LIMIT {$this->start}, {$this->count}";
        }
        
        return $sql;
    }
    
    function getCount()
    {
        if (!$this->tables) {
            DEB_Log("SQL_Select needs at least one table");
            return false;
        }
        
        $sql = "SELECT COUNT(*) FROM " . implode(', ', $this->tables);
        
        foreach ($this->left_join_tables as $table_join) {
            list($table, $on) = $table_join;
            $sql .= " LEFT JOIN $table ON $on";
        }
        
        if ($this->wheres) {
            $sql .= " WHERE " . implode(' && ', $this->wheres);
        }
        
        if ($this->havings) {
            $sql .= " HAVING " . implode(' && ', $this->havings);
        }
        
        if ($this->groups) {
            $sql .= " GROUP BY " . implode(', ', $this->groups);
        }
        
        if ($this->orders) {
            $sql .= " ORDER BY " . implode(', ', $this->orders);
        }
        
        return $sql;
    }
}

class SQL_Update
{
    var $fields = array();
    var $wheres = array();
    var $table;
    
    function SQL_Update($table)
    {
        $this->table = $table;
    }
    
    function set($field, $value)
    {
        $this->fields[$field] = $value;
    }
    
    function addWhere($condition)
    {
        $this->wheres[] = $condition;
    }
    
    function addWhereFieldEquals($field, $value)
    {
        $this->wheres[] = $field . '="' . DB_Escape($value) . '"';
    }
    
    function get()
    {
        $sql = "UPDATE {$this->table} SET ";
        $c = 0;
        foreach ($this->fields as $field => $value) {
            if ($c > 0) {
                $sql .= ", ";
            }
            $sql .= "$field='" . addslashes($value) . "'";
            $c++;
        }
        if ($this->wheres) {
            $sql .= ' WHERE ';
            foreach ($this->wheres as $i => $where) {
                if ($i > 0) {
                    $sql .= ' && ';
                }
                $sql .= '(' . $where . ')';
            }
        }
        return $sql;
    }
}


class SQL_Create
{
    var $fields;
    var $table;
    var $indexes = array();
    var $primary_keys = array();
    
    function SQL_Create($table)
    {
        $this->table = $table;
    }
    
    function add($field, $type)
    {
        $this->fields[$field] = array('type' => $type);
    }
    
    function setPrimaryKeys($fields)
    {
        $this->primary_keys = $fields;
    }
    
    function get()
    {
        $sql = 'CREATE TABLE ' . $this->table . ' (';
        $comma = false;
        foreach ($this->fields as $name => $field) {
            if ($comma) {
                $sql .= ', ';
            } else {
                $comma = true;
            }
            $sql .= $name . ' ' . $field['type'];
        }
        if ($this->primary_keys) {
            $sql .= ', PRIMARY KEY (' . implode(', ', $this->primary_keys) . ')';
        }
        $sql .= ')';
        return $sql;
    }
}


?>