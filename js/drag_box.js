// DBX: Drag Box
// -----------------------------------------------------------
// Version 2.1
//
// Requires: DOM
//

function DBX_DragBox(element, force_proportion, pixel_image_src)
{
    this.element = element;
    
    this.blink_timer_id = false; 
    this.blinking = false;
    this.blinking_now = false;
    
    this.box_size = 7;
    this.indent_size = this.box_size / 2;
    this.selection_border_width = 1;
    this.dragging_mode = false;
    this.pixel_image_src = pixel_image_src;
    
    this.drag_boxes_hidden = false;
    
    this.boxes = [];
    
    this.max_steps = 9;
    
    this.delta_n_move = 1;
    this.delta_n_event = 1;
    
    this.position = new DBX_Position(this.element, this.indent_size, force_proportion);
    this.position.drag_obj = this;
    this.requested_pos = false;
    
    this.container_div = document.createElement('div');
    this.container_div.className = 'drag-container';
    this.container_div.style.zIndex = '1';
    
    this.focused = false;
    
    //this.element.parentNode.insertBefore(this.container_div, this.element);
    document.body.insertBefore(this.container_div, document.body.firstChild);
    
    this.n_box = this.createBox('n');
    this.e_box = this.createBox('e');
    this.s_box = this.createBox('s');
    this.w_box = this.createBox('w');
    
    this.updateExtraBoxesDisplay();
    
    this.nw_box = this.createBox('nw');
    this.ne_box = this.createBox('ne');
    this.se_box = this.createBox('se');
    this.sw_box = this.createBox('sw');
    
    this.selection_box = this.createSelectionDiv(this.position.width - this.selection_border_width, this.position.height - this.selection_border_width);
    
    this.redraw();
    
    // Create an array with all the boxes plus the selection box to attach them the events
    var boxes = this.boxes.copy();
    boxes[boxes.length] = this.selection_box;
    
    this.hideBoxes();
    
    var i;
    if (DOM_IsIE) {
        for (i = 0; i < boxes.length; i++) {
            boxes[i].DragBoxObj = this;
            DOM_AddEventListener(boxes[i], 'mousedown', function(obj) { return function(event) { obj.onBoxMouseDown(event) } }(this) );
            DOM_AddEventListener(boxes[i], 'drag', Function('return false;'));
        }
        DOM_AddEventListener(document, 'mousemove', function(obj) { return function(event) { obj.onDocumentMouseMove(event) } }(this) );
        DOM_AddEventListener(document, 'mouseup', function(obj) { return function(event) { obj.onDocumentMouseUp(event) } }(this) );
    } else {
        for (i = 0; i < boxes.length; i++) {
            boxes[i].DragBoxObj = this;
            DOM_AddEventListener(boxes[i], 'mousedown', function(obj) { return function(event) { obj.onBoxMouseDown(event) } }(this) );
            DOM_AddEventListener(boxes[i], 'mouseup', function(obj) { return function(event) { obj.onBoxMouseUp(event) } }(this) );
            DOM_AddEventListener(boxes[i], 'mousemove', function(obj) { return function(event) { obj.onBoxMouseMove(event) } }(this) );
        }
    }
    
    DOM_AddEventListener(window, 'resize', function(obj) { return function(event) { obj.redraw() } }(this) );
    DOM_AddEventListener(document, 'keydown', function(obj) { return function(event) { obj.onDocumentKeyDown(event) } }(this) );
    DOM_AddEventListener(document, 'focus', function(obj) { return function(event) { obj.blur() } }(this) );
    
    if (VAR_IsUndefined(document.onfocuschange_listeners)) {
        document.onfocuschange_listeners = [];
    }
    
    DOM_AddOnFocusChangeListener(function(obj) { return function(data) { if (data != obj) { obj.blur() } } }(this));
    
    this.setBlink(true);
}

DBX_DragBox.prototype.hide = function()
{
    this.container_div.style.display = 'none';
}
    
DBX_DragBox.prototype.show = function()
{
    this.container_div.style.display = '';
}

DBX_DragBox.prototype.setCallback = function(function_ref)
{
    this.position.callback = function_ref;
}

DBX_DragBox.prototype.createBox = function(drag_mode)
{
    if (DOM_IsIE) {
        var box = document.createElement('img');
    } else {
        var box = document.createElement('div');
    }
    box.className = 'drag-box drag-box-' + drag_mode;
    box.BoxDragMode = drag_mode;
    box.style.width = this.box_size + 'px';
    box.style.height = this.box_size + 'px';
    box.style.zIndex = '2';
    if (!DOM_IsIE) {
        var img = document.createElement('img');
        img.src = this.pixel_image_src;
        img.style.width = '1px';
        img.style.height = '1px';
        box.appendChild(img);
    }
    this.container_div.appendChild(box);
    this.boxes[this.boxes.length] = box;
    return box;
}

DBX_DragBox.prototype.createSelectionDiv = function(width, height)
{
    var box;
    if (DOM_IsIE) {
        box = document.createElement('img');
        box.src = this.pixel_image_src;
    } else {
        box = document.createElement('div');
        var img = document.createElement('img');
        img.src = this.pixel_image_src;
        img.style.width = '1px';
        img.style.height = '1px';
        box.appendChild(img);
    }
    box.className = 'drag-selection';
    box.BoxDragMode = 'move';
    box.style.borderWidth = this.selection_border_width;
    box.style.zIndex = '1';
    box.galleryImg = 'no'; // This is for ie
    //box.tabIndex = 0; // This would allow the div to gain focus, but will result in a border being drawn
    this.container_div.appendChild(box);
    return box;
}

// This is used on both mozilla and ie
DBX_DragBox.prototype.onBoxMouseDown = function(event)
{
    var element, obj;
    
    var button = DOM_GetButtonFromEvent(event);
    
    if (button != 'left') {
        return true;
    }
    
    if (!this.focused) {
        this.focus();
    }
    
    var element = DOM_GetElementFromEvent(event);
    var pos = DOM_GetPositionFromEvent(event);
    
    this.dragging_mode = element.BoxDragMode;
    this.requested_pos = this.position.getPos();
    this.original_pos = this.position.getPos();
    
    this.hideBoxes();
    this.drag_x0 = pos.x;
    this.drag_y0 = pos.y;
    
    DOM_StopPropagation(event);
    return DOM_PreventDefault(event);
}

// This is only used in mozilla so there is no need for ie compatibility
DBX_DragBox.prototype.onBoxMouseUp = function(event)
{
    if (DOM_GetButtonFromEvent(event) != 'left') {
        return true;
    }
    
    this.dragging_mode = false;
    if (this.focused) {
        this.showBoxes();
    }
    
    DOM_StopPropagation(event);
    return DOM_PreventDefault(event);
}

// This is only used in gecko
DBX_DragBox.prototype.onBoxMouseMove = function(event)
{
    if (DOM_GetButtonFromEvent(event) != 'left') {
        return true;
    }
    
    if (this.dragging_mode != false) {
        
        var pos = DOM_GetPositionFromEvent(event);
        
        var delta_x = pos.x - this.drag_x0;
        var delta_y = pos.y - this.drag_y0;
        this.drag_x0 = pos.x;
        this.drag_y0 = pos.y;
        
        this.move(this.dragging_mode, delta_x, delta_y);
    }
    
    DOM_StopPropagation(event);
    return DOM_PreventDefault(event);
}

// This is only used on ie
DBX_DragBox.prototype.onDocumentMouseMove = function(event)
{
    var element, obj;
    
    if (DOM_GetButtonFromEvent(event) != 'left') {
        return true;
    }
    
    if (this.dragging_mode != false) {
        var pos = DOM_GetPositionFromEvent(event);
        var delta_x = pos.x - this.drag_x0;
        var delta_y = pos.y - this.drag_y0;
        //this.log('moviendo... (' + delta_x + ',' + delta_y + ')');
        this.drag_x0 = pos.x;
        this.drag_y0 = pos.y;
        if (delta_x || delta_y) {
            this.move(this.dragging_mode, delta_x, delta_y);
        }
        return false;
    }
}

// This is only used on ie
DBX_DragBox.prototype.onDocumentMouseUp = function(event)
{
    if (DOM_GetButtonFromEvent(event) != 'left') {
        return true;
    }
    
    if (this.dragging_mode != false) {
        this.dragging_mode = false;
        this.requested_pos = this.position.getPos();
        this.showBoxes();
        DOM_StopPropagation(event);
        return DOM_PreventDefault(event);
    }
}

DBX_DragBox.prototype.onDocumentKeyDown = function(event)
{
    if (this.dragging_mode != false && event.keyCode == 27) { // 27 = ESC
        this.cancelDrag();
        DOM_StopPropagation(event);
        return DOM_PreventDefault(event);
    }
}

DBX_DragBox.prototype.cancelDrag = function()
{
    this.dragging_mode = false;
    this.position.x = this.original_pos.x;
    this.position.y = this.original_pos.y;
    this.position.width = this.original_pos.w;
    this.position.height = this.original_pos.h;
    this.position.update();
    this.redraw();
    if (this.focused) {
        this.showBoxes();
    }
}

DBX_DragBox.prototype.hideBoxes = function()
{
    var i;
    for (i = 0; i < this.boxes.length; i++) {
        this.boxes[i].className = 'drag-box-hidden drag-box-' + this.boxes[i].BoxDragMode;
    }
    this.drag_boxes_hidden = true;
}

DBX_DragBox.prototype.showBoxes = function()
{
    var i;
    for (i = 0; i < this.boxes.length; i++) {
        this.boxes[i].className = 'drag-box drag-box-' + this.boxes[i].BoxDragMode;
    }
    this.drag_boxes_hidden = false;
}

DBX_DragBox.prototype.redraw = function()
{
    var offset = this.position.getElementPosition();
    if (DOM_IsIE) {
        offset.x++;
        offset.y++;
    }
    this.nw_box.style.left = Math.round(this.position.nw.x + offset.x) + 'px';
    this.nw_box.style.top = Math.round(this.position.nw.y + offset.y) + 'px';
    
    this.ne_box.style.left = Math.round(this.position.ne.x + offset.x) + 'px';
    this.ne_box.style.top = Math.round(this.position.ne.y + offset.y) + 'px';
    
    this.se_box.style.left = Math.round(this.position.se.x + offset.x) + 'px';
    this.se_box.style.top = Math.round(this.position.se.y + offset.y) + 'px';
    
    this.sw_box.style.left = Math.round(this.position.sw.x + offset.x) + 'px';
    this.sw_box.style.top = Math.round(this.position.sw.y + offset.y) + 'px';
    
    if (typeof this.position.force_proportion != 'number') {
        this.n_box.style.left = Math.round(this.position.n.x + offset.x) + 'px';
        this.n_box.style.top = Math.round(this.position.n.y + offset.y) + 'px';
        
        this.e_box.style.left = Math.round(this.position.e.x + offset.x) + 'px';
        this.e_box.style.top = Math.round(this.position.e.y + offset.y) + 'px';
        
        this.s_box.style.left = Math.round(this.position.s.x + offset.x) + 'px';
        this.s_box.style.top = Math.round(this.position.s.y + offset.y) + 'px';
        
        this.w_box.style.left = Math.round(this.position.w.x + offset.x) + 'px';
        this.w_box.style.top = Math.round(this.position.w.y + offset.y) + 'px';
    }
    
    this.selection_box.style.top = Math.round(this.position.y - this.selection_border_width + offset.y) + 'px';
    this.selection_box.style.left = Math.round(this.position.x - this.selection_border_width + offset.x) + 'px';
    if (this.position.width > 0 && this.position.height > 0) {
        if (DOM_IsIE) { // IE...
            this.selection_box.style.width = Math.round(this.position.width) + 'px';
            this.selection_box.style.height = Math.round(this.position.height) + 'px';
        } else { // Standards...
            this.selection_box.style.width = Math.round(this.position.width) + 'px';
            this.selection_box.style.height = Math.round(this.position.height) + 'px';
        }
    }
    
    if (this.dragging_mode == false) {
        if (this.position.width < (this.box_size * 2) || this.position.height < (this.box_size * 2)) {
            if (!this.drag_boxes_hidden) {
                this.hideBoxes();
            }
        } else {
            if (this.drag_boxes_hidden) {
                if (this.focused) {
                    this.showBoxes();
                }
            }
        }
    }
}

DBX_DragBox.prototype.notices = new DIC_Dict();

DBX_DragBox.prototype.notice = function(category, message)
{
    this.notices.set(category, message);
    
    var pair, text = '', b, i;
    
    this.notices.reset();
    
    if (VAR_IsUndefined(this.notice_element)) {
        this.notice_element = document.createElement('div');
        this.notice_element.style.border = '2px solid black';
        this.notice_element.style.whiteSpace = 'pre';
        this.notice_element.style.padding = '6px';
        this.notice_element.style.margin = '3px';
        document.body.appendChild(this.notice_element);
    }
    
    DOM_RemoveAllChilds(this.notice_element);
    
    keys = this.notices.keys.copy();
    
    keys.sort();
    
    for (i = 0; i < keys.length; i++) {
        pair = [keys[i], this.notices.get(keys[i])];
        var b = document.createElement('b');
        this.notice_element.appendChild(b);
        b.appendChild(document.createTextNode(pair[0] + ': '));
        this.notice_element.appendChild(document.createTextNode(pair[1]));
        this.notice_element.appendChild(document.createElement('br'));
    }
}

DBX_DragBox.prototype.log = function(message)
{
    if (VAR_IsUndefined(this.log_number)) {
        this.log_number = 1;
        this.log_count = 1;
    }
    
    this.notice('log_' + this.log_number, this.log_count + ' - ' + message);
    this.log_number++;
    this.log_count++;
    if (this.log_number > 10) {
        this.log_number = 1;
    }
}

DBX_DragBox.prototype.move = function(drag_mode, delta_x, delta_y)
{
    // this.notice('drag_mode', drag_mode);
    //this.log('move: (' + delta_x + ',' + delta_y + ')');
    this.delta_n_move++;
    if (this.delta_n_move > this.max_steps) {
        this.delta_n_move = 1;
    }
    with (this.requested_pos) {
        if (drag_mode == 'move') {
            x += delta_x;
            y += delta_y;
        } else {
            if (drag_mode == 'n' || drag_mode == 'nw' || drag_mode == 'ne') {
                y += delta_y;
                h -= delta_y;
            }
            if (drag_mode == 'e' || drag_mode == 'ne' || drag_mode == 'se') {
                w += delta_x;
            }
            if (drag_mode == 's' || drag_mode == 'sw' || drag_mode == 'se') {
                h += delta_y;
            }
            if (drag_mode == 'w' || drag_mode == 'sw' || drag_mode == 'nw') {
                x += delta_x;
                w -= delta_x;
            }
        }
    }
    // this.notice('requested_pos', '(' + this.requested_pos.x + ',' + this.requested_pos.y + ',h:' + this.requested_pos.h + ',w:' + this.requested_pos.w + ')');
    
    if (this.position.set(drag_mode, this.requested_pos)) {
        this.redraw();
    }
    
}

DBX_DragBox.prototype.blink = function()
{
    if (this.blinking_now) {
        this.container_div.className = 'drag-container';
        this.blinking_now = false;
    } else {
        this.container_div.className = 'drag-container-blink';
        this.blinking_now = true;
    }
    this.blink_timer_id = window.setTimeout(function(obj) { return function() { obj.blink() } } (this), 1000);
}

// Set whether the selection box should blink or not
DBX_DragBox.prototype.setBlink = function(value)
{
    if (value == this.blinking) {
        return;
    }
    // this.log('set-blick: ' + value);
    this.blinking = value;
    if (value) {
        this.blink();
    } else {
        if (this.blink_timer_id) {
            window.clearTimeout(this.blink_timer_id);
        }
        this.container_div.className = 'drag-container';
    }
}

DBX_DragBox.prototype.update = function()
{
    this.position.correctSize();
    this.redraw();
}

DBX_DragBox.prototype.blur = function()
{
    if (this.focused) {
        // this.setBlink(false);
        this.hideBoxes();
        this.focused = false;
    }
}

DBX_DragBox.prototype.focus = function()
{
    DOM_DispatchOnFocusChangeEvent(this);
    // this.setBlink(true);
    this.showBoxes();
    this.focused = true;
}

DBX_DragBox.prototype.setContainerSize = function(w, h)
{
    this.position.max_x = w;
    this.position.max_y = h;
}

// This hides/shows the n, s, w, e boxes depending of the value of this.force_proportion
// If the proportion is fixed it hides them, otherwise it shows them
DBX_DragBox.prototype.updateExtraBoxesDisplay = function(w, h)
{
    if (typeof this.force_proportion != 'number') {
        this.n_box.style.display = '';
        this.s_box.style.display = '';
        this.w_box.style.display = '';
        this.e_box.style.display = '';
    } else {
        this.n_box.style.display = 'none';
        this.s_box.style.display = 'none';
        this.w_box.style.display = 'none';
        this.e_box.style.display = 'none';
    }
}

// This is for setting the selection minimun size. You should call .update() after changing it.
DBX_DragBox.prototype.setMinSize = function(w, h)
{
    if (w > this.position.max_x || h > this.position.max_y) {
        throw 'Minimun size exceeds maximun';
        return;
    }
    
    this.position.min_width = w;
    this.position.min_height = h;
}

// This is for setting the selection proportion. You should call .update() after changing it.
// The proportion can be false (no constrains), a number (width/height constrain) or an array [min_proportion, max_proportion]
DBX_DragBox.prototype.setProportion = function(proportion)
{
    this.force_proportion = proportion;
    this.position.force_proportion = proportion;
    this.updateExtraBoxesDisplay();
}

function DBX_Position(element, indent_size, force_proportion)
{
    this.element = element;
    
    this.callback = new Function('return false;');
    
    this.indent_size = indent_size;
    
    // The width and height of the image
    this.width = 147;
    this.height = 102;
    this.max_x = 147;
    this.max_y = 102;
    
    this.force_proportion = force_proportion;
    
    this.x = 0;
    this.y = 0;
    
    this.min_width = 10;
    this.min_height = 10;
    
    this.min_x = 0;
    this.min_y = 0;
    
    this.update();
}

DBX_Position.prototype.update = function()
{
    this.center_w = this.x + (this.width / 2) - this.indent_size - 1;
    this.center_h = this.y + (this.height / 2) - this.indent_size - 1;
    
    this.left = this.x - this.indent_size - 2;
    this.right = this.x + this.width - this.indent_size - 1;
    
    this.top = this.y - this.indent_size - 2;
    this.bottom = this.y + this.height - this.indent_size - 1;
    
    // The different positions of the image
    this.n = {x: this.center_w, y: this.top};    // North
    this.s = {x: this.center_w, y: this.bottom}; // South
    this.w = {x: this.left, y: this.center_h};   // West
    this.e = {x: this.right, y: this.center_h};  // East
    
    this.nw = {x: this.left, y: this.top};       // Northwest
    this.ne = {x: this.right, y: this.top};      // Northeast
    this.sw = {x: this.left, y: this.bottom};    // Southwest
    this.se = {x: this.right, y: this.bottom};   // Southeast
    
    this.updateValues();
}

// This gets the reference element position and updates its internal offsets so that the selection is kept there
DBX_Position.prototype.getElementPosition = function()
{
    var pos = DOM_GetPosition(this.element);
    return pos;
}

DBX_Position.prototype.updateValues = function()
{
    this.callback(this.x, this.y, this.width, this.height);
}

DBX_Position.prototype.getPos = function()
{
    return {'x': this.x, 'y': this.y, 'w': this.width, 'h': this.height};
}

DBX_Position.prototype.getMaxProportionalSize = function(max_w, max_h, new_proportion)
{
    var area_proportion = max_w / max_h;
    
    var new_h = max_h;
    var new_w = max_w;
    
    // this.drag_obj.log('proportion: ' + new_proportion.toSource());
    
    if (new_proportion !== false) { // There is a proportion set
        if (typeof new_proportion == 'object') { // The proportion is set through an array [min, max]
            if (area_proportion < new_proportion[0]) { // It should be wider
                new_w = max_w;
                new_h = new_w / new_proportion[0];
            } else if (new_proportion[1] && area_proportion > new_proportion[1]) { // It should be taller
                new_h = max_h;
                new_w = new_h * new_proportion[1];
            }
        } else { // The proportion is set through a number
            if (area_proportion < new_proportion) { // Our limiting axis is X
                new_w = max_w;
                new_h = new_w / new_proportion;
            } else { // Our limiting axis is Y (or they are equal)
                new_h = max_h;
                new_w = new_h * new_proportion;
            }
        }
    }
    // this.drag_obj.log('max size: ' + {w: new_w, h: new_h}.toSource());
    
    return {w: new_w, h: new_h};
}

DBX_Position.prototype.set = function(drag_mode, pos_obj)
{
    if (typeof this.force_proportion == 'object') {
        if (drag_mode == 'e' || drag_mode == 's') {
            drag_mode = 'se';
        } else if (drag_mode == 'w') {
            drag_mode = 'sw';
        } else if (drag_mode == 'n') {
            drag_mode = 'ne';
        }
    }
    
    var south = drag_mode == 's' || drag_mode == 'se' || drag_mode == 'sw';
    var north = drag_mode == 'n' || drag_mode == 'ne' || drag_mode == 'nw';
    var east = drag_mode == 'e' || drag_mode == 'se' || drag_mode == 'ne';
    var west = drag_mode == 'w' || drag_mode == 'nw' || drag_mode == 'sw';
    var diagonal = drag_mode == 'nw' || drag_mode == 'ne' || drag_mode == 'se' || drag_mode == 'sw';
    
    var proportion = this.force_proportion || this.width / this.height;
    
    // West resizements
    if (west) {
        if (pos_obj.x >= this.min_x && pos_obj.w >= this.min_width) { // within limits
            this.x = pos_obj.x;
            this.width = pos_obj.w;
        } else if (pos_obj.w >= this.min_width) { // too much to the left
            this.x = this.min_x;
            this.width = pos_obj.w + pos_obj.x - this.min_x;
        } else if (pos_obj.x >= this.min_x) { // too thin
            this.width = this.min_width;
            this.x = pos_obj.x + pos_obj.w - this.min_width;
        } else { // too much to the left and too thin
            this.width = this.min_width;
            this.x = this.min_x;
        }
    }
    
    // East resizements
    if (east) {
        if (pos_obj.w >= this.min_width && (pos_obj.x + pos_obj.w) <= this.max_x) { // Not too small and not too much to the right
            this.width = pos_obj.w;
        } else if ((pos_obj.x + pos_obj.w) <= this.max_x) { // too small
            this.width = this.min_width;
        } else { // too much to the right
            this.width = this.max_x - pos_obj.x;
        }
    }
    
    // North resizements
    if (north) {
        if (pos_obj.y >= this.min_y && pos_obj.h >= this.min_height) {
            this.y = pos_obj.y;
            this.height = pos_obj.h;
        } else if (pos_obj.h >= this.min_height) {
            this.y = this.min_y;
            this.height = pos_obj.h + pos_obj.y - this.min_y;
        } else if (pos_obj.y >= this.min_y) {
            this.height = this.min_height;
            this.y = pos_obj.y + pos_obj.h - this.min_height;
        } else {
            this.height = this.min_height;
            this.y = this.min_y;
        }
    }
    
    // South resizements
    if (south) {
        if (pos_obj.h >= this.min_height && (pos_obj.y + pos_obj.h) <= this.max_y) { // Not too small and not too much to the right
            this.height = pos_obj.h;
        } else if ((pos_obj.y + pos_obj.h) <= this.max_y) { // too small
            this.height = this.min_height;
        } else { // too much to the right
            this.height = this.max_y - pos_obj.y;
        }
    }
    
    // Move
    if (drag_mode == 'move') {
        if (pos_obj.x >= this.min_x && (pos_obj.x + pos_obj.w) <= this.max_x) { // If we are within the left and right limits
            this.x = pos_obj.x;
        } else if (pos_obj.x >= this.min_x) { // If we are within the left (but not right) limits
            this.x = this.max_x - this.width;
        } else {  // If we are within the right (but not left) limits
            this.x = this.min_x;
        }
        if (pos_obj.y >= this.min_y && (pos_obj.y + pos_obj.h) <= this.max_y) {
            this.y = pos_obj.y;
        } else if (pos_obj.y >= this.min_y) { // If we are within the top (but not bottom) limits
            this.y = this.max_y - this.height;
        } else {  // If we are within the bottom (but not top) limits
            this.y = this.min_y;
        }
    }
    
    // Force proportion
    
    if (this.force_proportion || diagonal) {
        var new_size = this.getMaxProportionalSize(this.width, this.height, proportion);
        
        if (east) { // East
            this.width = new_size.w;
        }
        
        if (north) { // North
            this.y = this.y + (this.height - new_size.h);
            this.height = new_size.h;
        }
        
        if (south) { // South
            this.height = new_size.h;
        }
        
        if (west) { // West
            this.x = this.x + (this.width - new_size.w);
            this.width = new_size.w;
        }
            
    }
    
    //this.drag_obj.log('pos-set: (' + this.x + ',' + this.y + '; w:' + this.width + ', h:' + this.height + ')');
    this.update();
    return true;
}

DBX_Position.prototype.correctSize = function()
{
    
    var change = true;
    
    var loop = 1;
    
    while (loop <= 2 && change) {
        
        loop++;
        
        change = false;
        
        var new_size = this.getMaxProportionalSize(this.width, this.height, this.force_proportion);
        
        this.width = new_size.w;
        this.height = new_size.h;
    
        if (loop == 1) {
            
            if (this.width < this.min_width) {
                this.width = this.min_width;
            }
            
            if (this.height < this.min_height) {
                this.height = this.min_height;
            }
        }
        
        if (this.y + this.height > this.max_y) {
            this.y = this.max_y - this.height;
        }
        if (this.x + this.width > this.max_x) {
            this.x = this.max_x - this.width;
        }
        if (this.y + this.height > this.max_y) {
            this.y = this.max_y - this.height;
        }
        
        if (this.x + this.width > this.max_x) {
            if (this.max_x - this.width > this.min_x) {
                this.x = this.max_x - this.width;
            } else {
                this.x = this.min_x;
                this.width = this.max_x - this.min_x;
                change = true;
            }
        }
        
        if (this.x < this.min_x) {
            if (this.min_x + this.width < this.max_x) {
                this.x = this.min_x;
            } else {
                this.x = this.min_x;
                this.width = this.max_x - this.min_x;
                change = true;
            }
        }
        
        if (this.y + this.height > this.max_y) {
            if (this.max_y - this.height > this.min_y) {
                this.y = this.max_y - this.height;
            } else {
                this.y = min_y;
                this.height = this.max_y - this.min_y;
                change = true;
            }
        }
        
        if (this.y < this.min_y) {
            if (this.min_y + this.height < this.max_y) {
                this.y = this.min_y;
            } else {
                this.y = this.min_y;
                this.height = this.max_y - this.min_y;
                change = true;
            }
        }
        
    }
    this.update();
}