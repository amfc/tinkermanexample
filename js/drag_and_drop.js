// DAP: Drag and drop object
// -----------------------------------------------
// Version 1
//
// Requires: VAR, DOM

// ............................................................
/*

Usage:

To make an object a source or target do:

obj = new DAP_DragAndDrop(element, data, can_drag, can_drop, onDrag, onDrop)

data: This is user data which can be used for tracking. It can be of any type and it won't be used internally by this object.

can_drag: If this object can be a possible source of a drag operation (default: true)

can_drop: If this object can be a possible target (default: true)

onDrag: This is a function which will be called whenever a drag operation is happening over a widget

    It will be called as:
    
    onDrag(src_data, dst_data, src_obj, dst_obj)
    
    src_data, dst_data: the user data which was added when the object was created of the source and destination elements
    src_element, dst_element: references to the source and destination html elements
    
    It must return true if a drop operation will be accepted with this item as a target
    
    If you omit it it will assume any drop is posible

onDrop: This is a function which will be called whenever a drag operation is has been completed

    It will be called as:
    
    onDrop(src_data, dst_data, src_obj, dst_obj)
    
    src_data, dst_data: the user data which was added when the object was created of the source and destination elements
    src_element, dst_element: references to the source and destination html elements
    
    It does have to return anything
    
    If you omit it the source and destination objects will be swapped

To use this you will need this css selectors:


.{element-class-name}-dragging {
    border-color: black !important;
    cursor: -moz-grabbing !important;
}

.{element-class-name}-dragging .{element-class-name}-draggable{
    cursor: -moz-grabbing !important;
}

.{element-class-name}-dropping {
    border-color: red !important;
}

.{element-class-name}-draggable {
    border: medium solid orange;
    cursor: -moz-grab;
}
*/

var DAP_Dragging_obj = null;
var DAP_Dropping_obj = null;

function DAP_FindObj(event)
{
    var element = DOM_GetElementFromEvent(event);
    while (!element.obj && element.parentNode) {
        element = element.parentNode;
    }
    return element.obj;
}

function DAP_DragAndDrop(element, data, can_drag, can_drop, onDrag, onDrop)
{
    this.DAP_dragging = false;
    
    this.dropping = false;
    
    this.element = element;
    
    this.data = data;
    
    this.class_name = element.className;
    
    if (VAR_IsUndefined(can_drag)) {
        this.can_drag = true;
    } else {
        this.can_drag = can_drag;
    }
    
    if (VAR_IsUndefined(can_drop)) {
        this.can_drop = true;
    } else {
        this.can_drop = can_drop;
    }
    
    if (VAR_IsUndefined(onDrag) || !onDrag) {
        this.onDrag = function(src_data, dst_data, src_element, dst_element) {
            return true;
        }
    } else {
        this.onDrag = onDrag;
    }
    
    if (VAR_IsUndefined(onDrop) || !onDrop) {
        this.onDrop = function(src_data, dst_data, src_element, dst_element) {
            DOM_SwapElements(dst_element, src_element);
        }
    } else {
        this.onDrop = onDrop;
    }
    
    this.init();
}



DAP_DragAndDrop.prototype.onMouseDown = function(event)
{
    obj = DAP_FindObj(event);
    
    if (!obj) {
        return;
    }
    
    if (obj.can_drag && DOM_GetButtonFromEvent(event) == 'left') {
        DAP_Dragging_obj = obj;
        obj.element.className = VAR_AddWord(obj.element.className, obj.class_name + '-dragging');
        var body = document.getElementsByTagName('body')[0];
        body.className = VAR_AddWord(body.className, 'dragging');
        return DOM_PreventDefault(event);
    }
}

DAP_DragAndDrop.prototype.onMouseUp = function(event)
{
    if (DAP_Dragging_obj != null) {
        var src_obj, dst_obj, tmp1, tmp2, tmp_pos, tmp_pos2, body;
        
        src_obj = DAP_Dragging_obj;
        DAP_Dragging_obj = null;
        src_obj.element.className = VAR_RemoveWord(src_obj.element.className, src_obj.class_name + '-dragging');
        
        body = document.getElementsByTagName('body')[0];
        body.className = VAR_RemoveWord(body.className, 'dragging');
        
        if (DAP_Dropping_obj != null) {
            dst_obj = DAP_FindObj(event);
            if (dst_obj) {
                DAP_Dropping_obj.releaseDrop();
                dst_obj.onDrop(src_obj.data, dst_obj.data, src_obj.element, dst_obj.element);
            }
        }
        
        return DOM_PreventDefault(event);
    }
}

DAP_DragAndDrop.prototype.onDocumentKeyPress = function(event)
{
    if (DAP_Dragging_obj) {
        if (event.keyCode == 27) { // Esc
            this.releaseDrag();
            if (DAP_Dropping_obj) {
                DAP_Dropping_obj.releaseDrop();
            }
            DOM_StopPropagation(event);
            return DOM_PreventDefault(event);
        }
    }
}

DAP_DragAndDrop.prototype.onMouseOver = function(event)
{
    if (DAP_Dragging_obj != null) {
        obj = DAP_FindObj(event);
        if (!obj) {
            return;
        }
        if (obj != DAP_Dragging_obj && obj.can_drop && obj.onDrag(DAP_Dragging_obj.data, obj.data, DAP_Dragging_obj.element, obj.element)) {
            obj.grabDrop();
        }
        return DOM_PreventDefault(event);
    }
}

DAP_DragAndDrop.prototype.onMouseOut = function(event)
{
    obj = DAP_FindObj(event);
    if (!obj) {
        return;
    }
    if (obj.dropping) {
        obj.releaseDrop();
    }
    return DOM_PreventDefault(event);
}

DAP_DragAndDrop.prototype.releaseDrop = function()
{
    if (this.dropping) {
        this.element.className = VAR_RemoveWord(this.element.className, this.class_name + '-dropping');
        this.dropping = false;
        DAP_Dropping_obj = null;
    }
}

DAP_DragAndDrop.prototype.releaseDrag = function(event)
{
    var body = document.getElementsByTagName('body')[0];
    body.className = VAR_RemoveWord(body.className, 'dragging');
    DAP_Dragging_obj.element.className = VAR_RemoveWord(DAP_Dragging_obj.element.className, DAP_Dragging_obj.class_name + '-dragging');
    DAP_Dragging_obj = null;
}

DAP_DragAndDrop.prototype.grabDrop = function()
{
    if (DAP_Dropping_obj != this) {
        this.element.className = VAR_AddWord(this.element.className, this.class_name + '-dropping');
        this.dropping = true;
        if (DAP_Dropping_obj) {
            DAP_Dropping_obj.releaseDrop();
        }
        DAP_Dropping_obj = this;
    }
}

DAP_DragAndDrop.prototype.init = function()
{
    this.element.obj = this;
    if (this.can_drag) {
        this.element.className = VAR_AddWord(this.element.className, this.class_name + '-draggable');
    }
    this.element.onselectstart = new Function ("return false");
    
    DOM_AddEventListener(document, 'keypress', function(obj) { return function(event) { return obj.onDocumentKeyPress(event) } }(this));
    
    DOM_AddEventListener(this.element, 'mousedown', this.onMouseDown);
    DOM_AddEventListener(document, 'mouseup', this.onMouseUp);
    DOM_AddEventListener(this.element, 'mouseover', this.onMouseOver);
    DOM_AddEventListener(this.element, 'mouseout', this.onMouseOut);
    
    if (typeof DAP_Dragging_obj == 'undefined') {
        DAP_Dragging_obj = null;
    }
    if (typeof DAP_Dropping_obj == 'undefined') {
        DAP_Dropping_obj = null;
    }
}
