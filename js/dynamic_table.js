// DYT: Dynamic Table
// -----------------------------------------------
// Version 2
//
// Requires:
// * DOM: DOM functions version 2 (dom2.js)
// * VAR: Variable functions version 2 (
// * XML: XML functions version 2 (

function DYT_DynamicTable(element, show_add_row, css_class_prefix, columns, rows, images_path)
{
    
    // PUBLIC: bool addRow
    // Adds a new row to the table
    
    this.addRow = function(row_data, values, ignore_required)
    {
        var valor, td, tr, input, i, row_number, ok, del_row_element;
        if (!ignore_required) {
            for (i = 0; i < this.required_columns.length; i++) {
                ok = 0;
                for (h = 0; h < values.length; h++) {
                    if ((values[h][0] == this.columns[i][0]) && (values[h][1])) {
                        ok = 1;
                        break;
                    }
                }
                if (ok == 0) {
                    return false;
                }
            }
        }
        
        if (!this.rows) {
            this.empty_element.style.display = 'none';
        }

        row_number = this.rows;
        tr = document.createElement('tr');
        this.addAssignedRowEventListeners(tr, 1 /* row_type: regular */);
        tr.className = this.getRowElementClassName(this.rows & 1); // !(this.rows & 1) returns 1 if the row is odd
        this.rows_inputs[row_number] = [];
        
        for (i = 0; i < this.columns.length; i++) {
            value = '';
            for (h = 0; h < values.length; h++) {
                if (values[h][0] == this.columns[i][0]) {
                    value = values[h][1];
                }
            }
            cell_class_name = this.getEditCellClassName(this.columns[i][0]);//'row_general ' + this.css_class_prefix + '-cell ' + this.css_class_prefix + '-cell-' + this.columns[i][0];
            element_class_name = this.getEditElementClassName(this.columns[i][0]); //'form_general ' + this.css_class_prefix + '-element ' + this.css_class_prefix + '-element-' + this.columns[i][0];
            
            input = this.addInputCell(tr, value, cell_class_name, element_class_name, 0, this.columns[i][2], this.columns[i][3], this.columns[i][4], this.columns[i][5], 1 /*row_type: regular*/);
            this.rows_inputs[row_number][i] = input;
            this.addAssignedCellEventListeners(input, this.columns[i][0] /* column id */, this.columns[i][2] /* cell_type */, 1 /* row_type: regular */);
            if (this.columns[i][2] != 4) {
                DOM_AddEventListener(input, 'keydown', this.onCellKeydown);
                DOM_AddEventListener(input, 'keypress', this.onCellKeypress);
            }
        }
        // The 'remove row' link
        td = document.createElement('td');
        td.className = this.css_class_prefix + "-cell";
        del_row_element = document.createElement('a');
        del_row_element.href = 'javascript:void(null)';
        /*img = document.createElement('IMG');
        img.src = this.images_path + "shared/buttons/delete.gif";
        img.alt = this.remove_label;
        a.appendChild(img);
        img.style.border = 'none';
        img.dynamic_table = this;
        */
        del_row_element.appendChild(document.createTextNode(this.remove_label));
        del_row_element.dynamic_table = this;
        DOM_AddEventListener(del_row_element, 'click', this.onRemoveRow);
        this.addAssignedCellEventListeners(del_row_element, false, 99 /* cell_type */, 1 /* row_type: regular */);
        td.appendChild(del_row_element);
        tr.appendChild(td);
        this.rows++;
        this.rows_data[this.rows_data.length] = row_data;
        this.rows_element.appendChild(tr);
        
        /* These are the link elements which allows you to remove rows */
        this.rows_del_row_elements[this.rows_del_row_elements.length] = del_row_element;
        
        if (this.on_row_change) {
            this.on_row_change(this);
        }
        
        return true;
    }
    
    // PUBLIC: void addRequiredColumn
    // This column will be required for the row to be added
    this.addRequiredColumn = function(column_id)
    {
        this.required_columns[this.required_columns.length] = this.getColumnNumber(column_id);
    }
    
    // PUBLIC: string getXML
    // Get the values of all the rows in XML format
    this.getXML = function()
    {
        var xml = new XML_Handler('rows');
        var i, j, row, column, value;
        for (i = 0; i < this.rows; i++) {
            row = xml.document.createElement('row');
            if (this.rows_data[i] && this.rows_data[i].id) {
                row.setAttribute('id', this.rows_data[i].id);
            }
            for (j = 0; j < this.columns.length; j++) {
                value = this.rows_inputs[i][j].value;
                if (value) {
                    column = xml.document.createElement('column');
                    column.setAttribute('type', this.columns[j][0]);
                    column.appendChild(xml.document.createTextNode(value));
                    row.appendChild(column);
                }
            }
            xml.documentElement.appendChild(row);
        }
        return xml.serializeToString();
    }
    
    // PUBLIC: bool addColumn
    // Adds a new column to the table
    
    // id is the id of the new column
    // name is the title that that column will have
    // type is the type of the column:
    //      0 -> input text
    //      1 -> combo box (type_options will be an array with the ids and names of the elements)
    //      2 -> html element
    //      3 -> text
    //      4 -> textarea
    // type_options is only used for combo boxes and it is an array of ids and values like this:
    //      [[id, value],]
    // on_change will be called whenever a text field in the column is changed like this:
    //      on_change(dynamic_table, column_id, row_number, element)
    //          dynamic_table is a reference to the dynamic table object that generated the call
    //          column_id and row_number specify the cell which has been changed
    //          element is the html element which has been changed (generally an input text)
    // on_validate is the function that will be called to validate the format and contents of the cell
    //      if a function is given (and not false or undefined) it will be called every time the contents of the cell changes
    //      if the function returns true then the change will be accepted, if it is false it will be discarded.
    //      if the return value is not a boolean it will be taken as the new value.
    this.addColumn = function(id, name, type, type_options, on_change, on_validate)
    {
        var i, td, input, tr, column_number;
        
        if (VAR_IsUndefined(type_options)) {
            type_options = false;
        }
        
        if (VAR_IsUndefined(on_change)) {
            on_change = false;
        }
        
        if (VAR_IsUndefined(on_validate)) {
            on_validate = false;
        }
        
        if (this.getColumnNumber(id) !== null) {
            return false;
        }
        
        column_number = this.columns.length;
        
        // Title
        var td = document.createElement('TD');
        td.appendChild(document.createTextNode(name));
        td.className = this.css_class_prefix + '-title-cell';
        this.titles_element.firstChild.insertBefore(td, this.titles_element.firstChild.lastChild);
        
        // Rows
        tr = this.rows_element.firstChild;

        for (i = 0; i < this.rows; i++) {
            tr = this.rows_element.childNodes[i];
            input = this.addInputCell(tr.lastChild, false, this.getEditCellClassName(id), this.getEditElementClassName(id), 1, type, type_options, on_change, on_validate, 1 /*row_type: regular*/);
            this.rows_inputs[i][column_number] = input;
            input.dynamic_table_row_type = 1;
            this.addAssignedCellEventListeners(input, id, type, 1); // 1 -> regular row
            DOM_AddEventListener(input, 'keydown', this.onCellKeydown);
            if (type != 4) { // textareas should not trigger add on enter
                DOM_AddEventListener(input, 'keypress', this.onAddNewKeypress);
            }
        }
        
        // Add new
        if (this.show_add_row) {
            input = this.addInputCell(this.add_row_element.firstChild.lastChild, '', this.getAddNewCellClassName(id), this.getAddNewElementClassName(id), 1, type, type_options, false, on_validate, 1 /*row_type: add_new*/);
            if (input) {
                DOM_AddEventListener(input, 'keydown', this.onAddNewKeydown);
                if (type != 4) { // textareas should not trigger add on enter
                    DOM_AddEventListener(input, 'keypress', this.onAddNewKeypress);
                }
            }
            input.dynamic_table_row_type = 2;
            this.add_new_inputs[this.add_new_inputs.length] = input;
            this.addAssignedCellEventListeners(input, id, type, 2); // 2 -> "add new" row
        }
        
        this.columns[column_number] = [id, name, type, type_options, on_change, on_validate];
        
        if (this.on_row_change) {
            this.on_row_change(this);
        }
        
        return true;
    }
    
    this.setOnRowChange = function(method) /* This is fired whenever a row or column is added or removed */
    {
        this.on_row_change = method;
    }
    
    // PUBLIC: void addCellEventListener
    // This is used to add event handlers to all the cells o to a group of cells
    //
    // If you specify a column_id and it isn't false then only those cells are handled (the cell_type won't be considered)
    // If you specify a cell_type and it isn't false then only those columns which share that cell_type are handled
    // cell_type is the type of the column:
    //      false -> this applies to any cell
    //      0     -> input text
    //      1     -> combo box (type_options will be an array with the ids and names of the elements)
    //      2     -> html element
    //      3     -> text
    //      99    -> 'action' cells (the 'delete row' or 'add row' links)
    // Row_type is:
    //          false -> this applies to any row
    //          1     -> this only applies to the regular rows (not the add new row)
    //          2     -> this only applies to the add new row
    // The event_string is the dom event string, without the "on" ("change", "mouseover", etc)
    //
    // Note that the column does not need to exist before adding the event listener. When it becomes created the event will be attached.
    this.addCellEventListener = function(event_string, handler, column_id, cell_type, row_type)
    {
        var i, j, e;
        if (VAR_IsUndefined(column_id)) column_id = false;
        if (VAR_IsUndefined(cell_type)) cell_type = false;
        if (VAR_IsUndefined(row_type)) row_type = false;
        
        // First we add it to the list of event handler to keep
        this.cell_event_listeners[this.cell_event_listeners.length] = [column_id, cell_type, row_type, event_string, handler];
        
        // Now we attach the event to all cells which already exist
        
        // Regular rows
        if (row_type == false || row_type == 1) {
            if (column_id) {
                var col_number = this.getColumnNumber(cell_id);
                if (col_number !== null) {
                    for (j = 0; j < this.rows; j++) {
                        e = this.rows_inputs[j][col_number];
                        DOM_AddEventListener(e, event_string, handler);
                    }
                }
            } else {
                for (i = 0; i < this.columns.length; i++) {
                    if (!cell_type || this.columns[i][2] == cell_type) {
                        for (j = 0; j < this.rows; j++) {
                            e = this.rows_inputs[j][col_number];
                            DOM_AddEventListener(e, event_string, handler);
                        }
                    }
                }
                if (!cell_type || cell_type == 99) {
                    for (j = 0; j < this.rows; j++) {
                        DOM_AddEventListener(this.rows_del_row_elements[j], event_string, handler);
                    }
                }
            }
        }
        
        // "Add new" rows
        
        if (this.show_add_row && (row_type == false || row_type == 2)) {
            for (i = 0; i < this.columns.length; i++) {
                if (!column_id || this.columns[i][0] == column_id) {
                    if (!cell_type || (column_id == false && this.columns[i][2] == cell_type)) {
                        e = this.add_new_inputs[i];
                        DOM_AddEventListener(e, event_string, handler);
                    }
                }
            }
            if (!cell_type || cell_type == 99) {
                DOM_AddEventListener(this.add_row_action_element, event_string, handler);
            }
        }

    }
    
    // PUBLIC: void addRowEventListener
    // This is used to add event handlers to all the rows o to a group of rows
    //
    // Row_type is:
    //          false -> this applies to any row
    //          1     -> this only applies to the regular rows (not the add new row)
    //          2     -> this only applies to the add new row
    // The event_string is the dom event string, without the "on" ("change", "mouseover", etc)
    //
    // Note that the row does not need to exist before adding the event listener. When it becomes created the event will be attached.
    this.addRowEventListener = function(event_string, handler, row_type)
    {
        var row;
        if (VAR_IsUndefined(row_type)) row_type = false;
        
        // First we add it to the list of event handler to keep
        this.row_event_listeners[this.row_event_listeners.length] = [row_type, event_string, handler];
        
        // Now we attach the event to all cells which already exist
        
        // Regular rows
        if (row_type == false || row_type == 1) {
            row = this.rows_element.firstChild;
            while (row != null) {
                DOM_AddEventListener(row, event_string, handler);
                row = row.nextSibling;
            }
        }
        
        // "Add new" rows
        
        if (this.show_add_row && (row_type == false || row_type == 2)) {
            DOM_AddEventListener(this.add_row_element.firstChild, event_string, handler);
        }

    }
    
    // PUBLIC: void setSortFunction
    // Sets the function that will be called to sort the table
    // It will be called with two arrays for the rows as returned by getRow
    // The comparison function must return an integer less than, equal to,
    //      or greater than zero if the first argument is considered to be
    //      respectively less than, equal to, or greater than the second.
    this.setSortFunction = function(func)
    {
        this.sort_function = func;
    }
    
    // PUBLIC: void setEmptyText
    // Sets the text that will be displayed if there is no row on the table
    // If it's false then the text will be disabled
    this.setEmptyText = function(text)
    {
        this.empty_text = text;
        DOM_ReplaceText(this.empty_element.firstChild.firstChild, text);
    }
    
    // PUBLIC: bool sort
    // This will sort the row list using the function specified with setSortFunction
    // It will return true if the sort was successful, false otherwise
    this.sort = function(focus_column_id, focus_row)
    {
        if (VAR_IsUndefined(focus_row)) {
            focus_row = false;
        }
        if (this.sort_function) {
            var exchange = true, i, j, r, temp, order = [];
            for (i = 0; i < this.rows; i++) {
                order[i] = i;
            }
            
            while (exchange) {
                exchange = false;
                for (i = 1; i < this.rows; i++) {
                    if (this.sort_function(this.getRow(order[i - 1]), this.getRow(order[i])) > 0) {
                        temp = order[i];
                        order[i] = order[i - 1];
                        order[i - 1] = temp;
                        exchange = true;
                    }
                }
            }
            
            if (focus_row !== false) {
                focus_row = order.indexOf(focus_row);
            }
            
            for (i = 0; i < this.rows; i++) {
                if (order[i] != i) { // If the row changed its position
                    for (j = i + 1; j < this.rows; j++) {
                        if (order[j] == i) {
                            order[j] = order[i];
                            break;
                        }
                    }
                    
                    temp = this.rows_inputs[i];
                    this.rows_inputs[i] = this.rows_inputs[order[i]];
                    this.rows_inputs[order[i]] = temp;
                    
                    temp = this.rows_data[i];
                    this.rows_data[i] = this.rows_data[order[i]];
                    this.rows_data[order[i]] = temp;
                    
                    temp = this.rows_del_row_elements[i];
                    this.rows_del_row_elements[i] = this.rows_del_row_elements[order[i]];
                    this.rows_del_row_elements[order[i]] = temp;
                    
                    DOM_SwapElements(this.getRowElement(i), this.getRowElement(order[i]));
                    
                }
            }
            
            var row = this.rows_element.firstChild, is_odd_class, is_even_class;
            is_odd_class = this.getRowElementClassName(true);
            is_even_class = this.getRowElementClassName(false);
            for (i = 0; row != null && i < this.rows; i++) {
                is_odd = i & 1;
                row.className = row.className.replace(is_odd ? is_even_class : is_odd_class, is_odd ? is_odd_class : is_even_class);
                row = row.nextSibling;
            }
            
            
            if (focus_row !== false) {
                if (document.all) {
                    setTimeout(this.rows_inputs[focus_row][this.getColumnNumber(focus_column_id)].focus, 100);
                } else {
                    this.rows_inputs[focus_row][this.getColumnNumber(focus_column_id)].focus();
                }
            }
            
            return true;
        } else {
            return false;
        }
    }
    
    // PUBLIC: focusElement
    // Sets the focus to this cell
    this.focusElement = function(column_id, row_number)
    {
        var col_number = this.getColumnNumber(column_id);
        if (col_number !== null) {
            this.rows_inputs[row_number][col_number].focus();
        } else {
            return null;
        }
    }
    
    // PUBLIC: removeRow
    // Removes the row row_number from the table
    this.removeRow = function(row_number)
    {
        var row_nodes, row_node, i;
        var row_nodes = this.rows_element.childNodes;
        if (row_number >= row_nodes.length) {
            return false;
        }
        row_node = row_nodes[row_number];
        this.rows_element.removeChild(row_node);
        this.rows--;
        if (!this.rows)
            this.empty_element.style.display = '';
        this.rows_inputs.splice(row_number, 1);
        this.rows_data.splice(row_number, 1);
        this.rows_del_row_elements.splice(row_number, 1);

        if (this.on_row_change) {
            this.on_row_change(this);
        }
    }
    
    // PUBLIC: removeColumn
    // Removes a column from the table
    this.removeColumn = function(id)
    {
        var i, td, input, tr, column_number;
        
        if ((column_number = this.getColumnNumber(id)) === null) {
            return false;
        }
        
        // Title
        
        this.titles_element.firstChild.removeChild(this.titles_element.firstChild.childNodes[column_number]);
        
        
        // Rows
        tr = this.rows_element.firstChild;

        for (i = 0; i < this.rows; i++) {
            tr = this.rows_element.childNodes[i];
            tr.removeChild(tr.childNodes[column_number]);
            this.rows_inputs[i].splice(column_number, 1);
        }
        
        // Add new
        if (this.show_add_row) {
            this.add_new_inputs.splice(column_number, 1);
            this.add_row_element.firstChild.removeChild(this.add_row_element.firstChild.childNodes[column_number]);
        }
        this.columns.splice(column_number, 1);
        if (this.on_row_change) {
            this.on_row_change(this);
        }
        return true;
    }
    
    // PUBLIC: getRow
    // Gets all the data and values associated with a row
    // Returns an array like this:
    //  [row_data_array, row_values_array]
    // row_data_array and row_values_array are arrays like this:
    //  [[column_id, value],]
    this.getRow = function(row_number)
    {
        var i, h, row, value;
        row = [];
        for (i = 0; i < this.columns.length; i++) {
            if (value = this.rows_inputs[row_number][i].value) {
                row[row.length] = [this.columns[i][0], value];
            }
        }
        return [this.rows_data[row_number], row];
    }
    
    // PUBLIC: getColumnAndRowByElement
    // Gets an element's column_id and row number by its element
    // Returns and array [column_id, row_number, column_number]
    this.getColumnAndRowByElement = function(element)
    {
        var obj, cell, column_number, column_id, row, row_number;
        
        obj = element.dynamic_table;
        cell = element.parentNode;
        column_number = 0;
        
        while ((cell = cell.previousSibling) != null) {
            column_number++;
        }
        
        column_id = obj.columns[column_number][0];
        
        row = element.parentNode.parentNode;
        
        if (element.dynamic_table_row_type == 1) {
            row_number = 0;
            while ((row = row.previousSibling) != null) {
                row_number++;
            }
        } else {
            row_number = -1;
        }
        return [column_id, row_number, column_number];
    }
    
    this.setCell = function(cell_id, row_number, value)
    {
        var col_number = this.getColumnNumber(cell_id);
        if (col_number !== null) {
            this.rows_inputs[row_number][col_number].value = value;
        } else {
            return null;
        }
    }
    
    this.getCell = function(cell_id, row_number)
    {
        var col_number = this.getColumnNumber(cell_id);
        if (col_number !== null) {
            return this.rows_inputs[row_number][col_number].value;
        } else {
            return null;
        }
    }
    
    this.getRowData = function(row_number)
    {
        return this.rows_data[row_number];
    }
    
    this.getAddNewData = function(row_number)
    {
        return this.add_new_data;
    }
    
    this.setRowData = function(row_number, new_data)
    {
        this.rows_data[row_number] = new_data;
    }
    
    // PUBLIC: void setAddNewData
    // Associate data to the row to be added (it will be associated to the new row, if added)
    this.setAddNewData = function(new_data)
    {
        this.add_new_data = new_data;
    }
    
    // PRIVATE EVENT HANDLERS
    
    this.onCellChange_change = function(event)
    {
        var obj, cell, element, c, column_id, row, result;
        
        element = DOM_GetElementFromEvent(event);
        
        obj = element.dynamic_table;
        cell = obj.getColumnAndRowByElement(element);
        column_id = cell[0];
        row = cell[1];
        c = cell[2];
        
        if (obj.columns[c][5]) { // on_validate
            result = obj.columns[c][5](element);

            if (result == false) {
                return;
            }
        }
        
        if (obj.columns[c][4]) {
            obj.columns[c][4](obj, column_id, row, element);
        }
    }
    
    this.onCellKeypress_change = function(event)
    {
        element = DOM_GetElementFromEvent(event);
        
        /* enter */
        if (event.keyCode == 13) {
            var obj, cell, column_id, row, c, result;
            obj = element.dynamic_table;
            cell = obj.getColumnAndRowByElement(element);
            column_id = cell[0];
            row = cell[1];
            c = cell[2];
            
            if (obj.columns[c][4] || obj.columns[c][5]) { // on_change or on_validate
                if (obj.columns[c][2] != 4 && event.preventDefault) {
                    event.preventDefault();
                }
                
                
                if (obj.columns[c][5]) { // on_validate
                    result = obj.columns[c][5](element);
                    if (result == false) {
                        return false;
                    }
                }
                if (obj.columns[c][4]) {
                    obj.columns[c][4](obj, column_id, row, element);
                }
            }
            return false;
        }
        return true;
    }
    
    this.onCellKeypress = function(event)
    {
        if (event.keyCode == 13) {
            return DOM_PreventDefault(event);
        }
    }
    
    this.onCellKeydown = function(event)
    {
        element = DOM_GetElementFromEvent(event);
        
        /* up, down */
        if (event.keyCode == 38 || event.keyCode == 40) {
            var obj = element.dynamic_table;
            var cell = element.parentNode;
            var c = 0;
            while ((cell = cell.previousSibling) != null) {
                c++;
            }
            column_id = obj.columns[c][0];
            
            var row = element.parentNode.parentNode;
            var r = 0;
            while ((row = row.previousSibling) != null) {
                r++;
            }
            
            if (obj.columns[c][2] != 4) {
                if (event.keyCode == 38) {
                    if (r > 0) {
                        obj.focusElement(column_id, --r);
                    } else {
                        obj.add_new_inputs[c].focus();
                    }
                } else if (event.keyCode == 40) {
                    r++;
                    if (r < obj.rows) {
                        obj.focusElement(column_id, r);
                    }
                }
                return DOM_PreventDefault(event);
            }
        }
        return true;
    }
    
    this.onAddNewKeydown = function(event)
    {
        var element, i, values = [];
        
        element = DOM_GetElementFromEvent(event);
        
        var obj = element.dynamic_table;
        if (event.keyCode == 40 && obj.rows > 0) {
            var cell = element.parentNode;
            var c = 0;
            while ((cell = cell.previousSibling) != null) {
                c++;
            }
            obj.focusElement(obj.getColumnId(c), 0);
        }
    }
    
    this.onAddNewKeypress = function(event)
    {
        var element;
        
        element = DOM_GetElementFromEvent(event);
        
        var obj = element.dynamic_table;
        if (event.keyCode == 13) {
            if (obj.addThisRow()) {
                obj.add_new_inputs[0].focus();
            }
            return DOM_PreventDefault(event);
        }
    }
    
    this.onRemoveRow = function(event)
    {
        element = DOM_GetElementFromEvent(event);
        
        var row = element.parentNode.parentNode;
        
        var i = 0;
        while ((row = row.previousSibling) != null) {
            i++;
        }
        element.dynamic_table.removeRow(i);
    }
    
    // This is fired when the user clicks on the "Add" link
    this.onAddRow = function(event)
    {
        var element;
        
        element = DOM_GetElementFromEvent(event);
        
        return element.dynamic_table.addThisRow();
    }
    
    // PRIVATE: createTable
    // Creates the main html elements for the table
    this.createTable = function()
    {
        var table, tr, td, i, img, a;
        
        table = document.createElement('table');
        table.cellSpacing = 0; // This is the only way I found to make IE remove those spaces since it doesn't follow css
        table.className = this.css_class_prefix;
        
        // Titles
        
        this.titles_element = document.createElement('thead');
        table.appendChild(this.titles_element);
        tr = document.createElement('tr');
        this.titles_element.appendChild(tr);
        
        // The last empty cell of the titles
        
        td = document.createElement('td');
        td.className = this.css_class_prefix + '-title-cell';
        td.appendChild(document.createTextNode(' '));
        tr.appendChild(td);
        
        if (this.show_add_row) {
            // Add new
            
            this.add_row_element = document.createElement('tbody');
            table.appendChild(this.add_row_element);
            tr = document.createElement('tr');
            this.add_row_element.appendChild(tr);
            tr.className = this.css_class_prefix + "-row-add";
            
            // The add button
            td = document.createElement('td');
            td.width = 15;
            td.className = this.css_class_prefix + "-cell";
            this.add_row_action_element = document.createElement('A');
            this.add_row_action_element.href = 'javascript:void(null)';
            this.add_row_action_element.dynamic_table = this;
            /*
            img = document.createElement('IMG');
            img.src = this.images_path + "shared/buttons/add.gif";
            img.alt = this.add_label;
            a.appendChild(img);
            img.dynamic_table = this;
            img.style.border = 'none';
            */
            
            this.add_row_action_element.appendChild(document.createTextNode(this.add_label));
            
            DOM_AddEventListener(this.add_row_action_element, 'click', this.onAddRow);
            td.appendChild(this.add_row_action_element);
            this.add_row_element.firstChild.appendChild(td);
        }
        
        // Rows
        
        this.rows_element = document.createElement('tbody');
        table.appendChild(this.rows_element);
        
        this.empty_element = document.createElement('tbody');
        tr = document.createElement('tr');
        td = document.createElement('td');
        td.colSpan = 99;
        td.className = this.css_class_prefix + '-empty-text-td';
        tr.appendChild(td);
        this.empty_element.appendChild(tr);
        table.appendChild(this.empty_element);
        
        
        this.element.appendChild(table);
        
    }
    
    // PRIVATE: addInputCell
    // Create a new input cell to be added either on the add new row or on any other
    
    // if options is defined it means that a select will be created with those options, instead of a text input
    this.addInputCell = function(where_element, value, td_class_name, element_class_name, before, type, type_options, on_change, on_validate, row_type)
    {
        var tr, td, element, i, option, sub_element;
        td = document.createElement('td');
        td.className = td_class_name;
        if (type == 0) { // Input
            element = document.createElement('input');
            element.type = 'text';
            if (type_options) {
                sub_element = document.createTextNode(' ' + type_options);
            }
        } else if (type == 1) { // Select
            element = document.createElement('select');
            option = document.createElement('option');
            option.value = '';
            option.appendChild(document.createTextNode('Seleccione'));
            element.appendChild(option);
            for (i = 0; i < type_options.length; i++) {
                option = document.createElement('option');
                option.value = type_options[i][0];
                option.appendChild(document.createTextNode(type_options[i][1]));
                element.appendChild(option);
            }
        } else if (type == 2) { // Html Element
            if (value) {
                element = value;
            } else {
                element = document.createElement('span');
            }
        } else if (type == 3) { // Text
            element = document.createElement('span');
            if (value) {
                element.appendChild(document.createTextNode(value));
            }
        } else if (type == 4) { // Textarea
            element = document.createElement('textarea');
            if (type_options) {
                sub_element = document.createTextNode(' ' + type_options);
            }
        }
        if (type == 0 || type == 1 || type == 4) { // Input or select or textarea
            if (value !== false) {
                element.value = value;
            }
            element.className = element_class_name;
            element.dynamic_table = this;
            if (on_change || on_validate) {
                DOM_AddEventListener(element, 'change', this.onCellChange_change);
                DOM_AddEventListener(element, 'keypress', this.onCellKeypress_change);
            }
        }
        if (element) {
            element.dynamic_table_row_type = row_type;
            td.appendChild(element);
            if (sub_element) {
                td.appendChild(sub_element);
            }
            if (before) { // If we have to add the cell before the element
                where_element.parentNode.insertBefore(td, where_element);
            } else { // Or if we have to append it
                where_element.appendChild(td);
            }
        }
        return element;
    }
    
    
    // PRIVATE: addThisRow
    // Adds the current new row to the table
    this.addThisRow = function()
    {
        var i, values = [];
        // validation
        for (i = 0; i < this.columns.length; i++) {
            if (this.columns[i][5] && this.columns[i][5](this.add_new_inputs[i]) === false) {
                alert('Hay campos con errores');
                return false;
            }
        }
        
        for (i = 0; i < this.columns.length; i++) {
            values[values.length] = [this.columns[i][0], this.add_new_inputs[i].value];
        }
        if (this.addRow(this.add_new_data, values)) {
            for (i = 0; i < this.add_new_inputs.length; i++) {
                this.add_new_inputs[i].value = '';
            }
            this.add_new_data = false;
            return true;
        } else {
            alert('Faltan campos requeridos');
            return false;
        }
    }
    
    // PRIVATE: addAssignedCellEventListeners
    // This adds all the already added event listeners to a new cell
    //
    // Cell is the html element (generally an input, but it depends on cell_type) on which the events will be added
    // Column_id and Cell_type are the id and the type of the cell on which the events will be added
    // Row_type is:
    //          1     -> this one is a regular row (not the "add new" row)
    //          2     -> this one is an "add new" row
    this.addAssignedCellEventListeners = function(cell, column_id, cell_type, row_type)
    {
        var i;
        // this.cell_event_listeners = [[column_id, cell_type, row_type, event_string, handler], ]
        for (i = 0; i < this.cell_event_listeners.length; i++) {
            if (this.cell_event_listeners[i][2] !== false && this.cell_event_listeners[i][2] != row_type) { // row_type
                continue;
            }
            if (this.cell_event_listeners[i][0] == false) { // column_id
                if (this.cell_event_listeners[i][1] !== false && this.cell_event_listeners[i][1] != cell_type) { // cell_type
                    continue;
                }
            } else if (this.cell_event_listeners[i][0] != column_id) { // column_id
                continue;
            }
            DOM_AddEventListener(cell, this.cell_event_listeners[i][3], this.cell_event_listeners[i][4]);
        }
    }
    
    this.addAssignedRowEventListeners = function(row, row_type)
    {
        var i;
        // this.row_event_listeners = [[row_type, event_string, handler], ]
        for (i = 0; i < this.row_event_listeners.length; i++) {
            if (this.row_event_listeners[i][0] !== false && this.row_event_listeners[i][0] != row_type) { // row_type
                continue;
            }
            DOM_AddEventListener(row, this.row_event_listeners[i][1], this.row_event_listeners[i][2]);
        }
    }
    
    // PRIVATE: getColumnNumber
    // Gets the index of the column by id
    this.getColumnNumber = function(id)
    {
        var i;
        for (i = 0; i < this.columns.length; i++) {
            if (this.columns[i][0] == id) {
                return i;
            }
        }
        return null;
    }
    
    // PRIVATE: getColumnId
    // Gets the id of the column based on its index
    this.getColumnId = function(number)
    {
        return this.columns[number][0];
    }
    
    // PRIVATE: getRowElement
    // Gets the html element of the row
    this.getRowElement = function(number)
    {
        var row = this.rows_element.firstChild;
        var i;
        for (i = 0; row != null && i < number; i++) {
            row = row.nextSibling;
        }
        return row;
    }
    
    // PRIVATE functions to handle the CSS class names
    
    this.getEditCellClassName = function(column_name)
    {
        return this.css_class_prefix + '-cell ' + this.css_class_prefix + '-cell-' + column_name;
    }
    
    this.getEditElementClassName = function(column_name)
    {
        return this.css_class_prefix + '-element ' + this.css_class_prefix + '-element-' + column_name;
    }
    
    this.getAddNewCellClassName = function(column_name)
    {
        return this.css_class_prefix + '-cell ' + this.css_class_prefix + '-cell-' + column_name;
    }
    
    this.getAddNewElementClassName = function(column_name)
    {
        return this.css_class_prefix + '-element ' + this.css_class_prefix + '-element-' + column_name;
    }
    
    this.getRowElementClassName = function(is_odd)
    {
        return this.css_class_prefix + '-row-' + ((is_odd) ? 'odd' : 'even');
    }
    

    
    var i;
    
    this.element = element;
    this.empty_element = false; // The element that shows "there are no elements"
    this.add_row_action_element = false; // The "action" element that will add a new row. A link ("A") html element.
    
    this.add_label = 'Agregar';
    this.remove_label = 'Quitar';
    this.images_path = images_path;
    
    if (css_class_prefix) {
        this.css_class_prefix = css_class_prefix;
    } else {
        this.css_class_prefix = 'dynamic-table';
    }
    
    this.show_add_row = show_add_row;
    this.add_new_inputs = [];
    this.rows_inputs = [];
    this.rows_data = []; /* This is for attaching data to rows */
    
    this.rows_del_row_elements = []; /* These are the link elements which allows you to remove rows */
    this.add_row_element = false; // This is the link element which allows you to add rows
    
    this.add_new_data = false; /* This is for attaching data to the "add new" row */
    
    this.required_columns = [];
    this.on_row_change = false;
   
    this.columns = []; // [[id, name, type, type_options, on_change, on_validate], ];
        
    this.cell_event_listeners = []; // [[column_id, cell_type, row_type, event_string, handler], ]
    this.row_event_listeners = []; // [[row_type, event_string, handler], ]
    
    this.sort_function = false; // The function used in this.sort();
    
    this.rows = 0;
    this.createTable();
    if (columns) {
        for (i = 0; i < columns.length; i++) {
            this.addColumn(columns[i][0], columns[i][1], columns[i][2], columns[i][3]);
        }
        if (rows) {
            for (i = 0; i < rows.length; i++) {
                this.addRow(rows[i][0], rows[i][1]);
            }
        }
    }
    
}