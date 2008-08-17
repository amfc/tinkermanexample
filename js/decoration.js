function Decoration(element, type, segment_length, border_width, line_width, padding, color, background_color)
{
    if (typeof element == 'string') {
        element = document.getElementById(element);
    }
    if (type) {
        this.decoration_type = type;
    } else {
        this.decoration_type = 'zigzag';
    }
    if (line_width) {
        this.decoration_line_width = line_width;
    } else {
        this.decoration_line_width = 4;
    }
    if (border_width) {
        this.decoration_border_width = border_width;
    } else {
        this.decoration_border_width = 0;
    }
    if (padding) {
        this.decoration_padding = padding;
    } else {
        this.decoration_padding = 0;
    }
    if (color) {
        this.decoration_color = color;
    } else {
        this.decoration_color = 'red';
    }
    if (background_color) {
        this.decoration_background_color = background_color;
    } else {
        this.decoration_background_color = false;
    }
    if (segment_length) {
        this.decoration_segment_length = segment_length;
    } else {
        this.decoration_segment_length = 10;
    }
    
    this.element = element;
    
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';
    
    this.element.parentNode.insertBefore(this.canvas, element);
    
    if (DOM_GetCurrentStyle(element, 'position') == 'static') {
        element.style.position = 'relative'; // This is to make the decoration appear below the element
    }
    DOM_AddEventListener(window, 'resize', function(obj) { return function() { obj.redraw() } }(this) );
    
    this.redraw();
}

Decoration.prototype.createZigzagPath = function()
{
    var x = this.decoration_border_width + this.corner_width / 2, y = this.decoration_border_width + this.corner_width / 2;
    this.context.beginPath();
    this.context.lineTo(x, y);
    var i;
    var direction = -1;
    for (i = 0; i < this.steps_x; i++) {
        y += direction * this.decoration_border_width;
        x += this.step_x;
        direction = direction * -1;
        this.context.lineTo(x, y);
    }
    direction = 1;
    for (i = 0; i < this.steps_y; i++) {
        y += this.step_y;
        x += direction * this.decoration_border_width;
        direction = direction * -1;
        this.context.lineTo(x, y);
    }
    for (i = 0; i < this.steps_x; i++) {
        y += direction * this.decoration_border_width;
        x -= this.step_x;
        direction = direction * -1;
        this.context.lineTo(x, y);
    }
    direction = -1;
    for (i = 0; i < this.steps_y; i++) {
        y -= this.step_y;
        x += direction * this.decoration_border_width;
        direction = direction * -1;
        this.context.lineTo(x, y);
    }
    this.context.closePath();
}

Decoration.prototype.createStampPath = function()
{
    var x = this.decoration_border_width + this.corner_width / 2, y = this.decoration_border_width + this.corner_width / 2;
    this.context.beginPath();
    this.context.lineTo(x, y);
    var i;
    var step = 0;
    for (i = 0; i < this.steps_x; i++) {
        x += this.step_x;
        if (step == 0) {
            this.context.lineTo(x, y);
        } else if (step == 1) {
            this.context.lineTo(x, y - this.decoration_border_width);
        } else if (step == 2) {
            this.context.lineTo(x, y);
        }
        step++;
        if (step > 2) {
            step = 0;
        }
    }
    step = 0;
    for (i = 0; i < this.steps_y; i++) {
        y += this.step_y;
        if (step == 0) {
            this.context.lineTo(x, y);
        } else if (step == 1) {
            this.context.lineTo(x + this.decoration_border_width, y);
        } else if (step == 2) {
            this.context.lineTo(x, y);
        }
        step++;
        if (step > 2) {
            step = 0;
        }
    }
    step = 0;
    for (i = 0; i < this.steps_x; i++) {
        x -= this.step_x;
        if (step == 0) {
            this.context.lineTo(x, y);
        } else if (step == 1) {
            this.context.lineTo(x, y + this.decoration_border_width);
        } else if (step == 2) {
            this.context.lineTo(x, y);
        }
        step++;
        if (step > 2) {
            step = 0;
        }
    }
    step = 0;
    for (i = 0; i < this.steps_y; i++) {
        y -= this.step_y;
        if (step == 0) {
            this.context.lineTo(x, y);
        } else if (step == 1) {
            this.context.lineTo(x - this.decoration_border_width, y);
        } else if (step == 2) {
            this.context.lineTo(x, y);
        }
        step++;
        if (step > 2) {
            step = 0;
        }
    }
    this.context.closePath();
}

Decoration.prototype.drawHorizontalWave = function(pos, amplitude, length)
{
    this.context.bezierCurveTo(pos.x, pos.y - amplitude, pos.x + length, pos.y - amplitude, pos.x + length, pos.y);
    pos.x += length;
}

Decoration.prototype.drawVerticalWave = function(pos, amplitude, length)
{
    this.context.bezierCurveTo(pos.x - amplitude, pos.y, pos.x - amplitude, pos.y + length, pos.x, pos.y + length);
    pos.y += length;
}

Decoration.prototype.createWavePath = function()
{
    var amplitude = this.decoration_border_width / 2;
    var pos = {
        x: this.corner_width + this.decoration_border_width - amplitude,
        y: this.corner_width + this.decoration_border_width - amplitude
    };
    this.context.beginPath();
    this.context.moveTo(pos.x, pos.y)
    var i;
    var direction = -1;
    if (this.decoration_type == 'rope') {
        var wave_switch_horizontal = 1;
    } else {
        var wave_switch_horizontal = 0;
    }
    if (this.decoration_type == 'wave') {
        var wave_switch_vertical = 1;
    } else {
        var wave_switch_vertical = 0;
    }
    for (i = 0; i < this.steps_x; i++) {
        if ((wave_switch_horizontal + i) & 1) {
            this.drawHorizontalWave(pos, -amplitude, this.step_x);
        } else {
            this.drawHorizontalWave(pos, amplitude, this.step_x);
        }
    }
    for (i = 0; i < this.steps_y; i++) {
        if ((wave_switch_vertical + i) & 1) {
            this.drawVerticalWave(pos, -amplitude, this.step_y);
        } else {
            this.drawVerticalWave(pos, amplitude, this.step_y);
        }
    }
    for (i = 0; i < this.steps_x; i++) {
        if ((wave_switch_horizontal + i) & 1) {
            this.drawHorizontalWave(pos, amplitude, -this.step_x);
        } else {
            this.drawHorizontalWave(pos, -amplitude, -this.step_x);
        }
    }
    for (i = 0; i < this.steps_y; i++) {
        if ((wave_switch_vertical + i) & 1) {
            this.drawVerticalWave(pos, amplitude, -this.step_y);
        } else {
            this.drawVerticalWave(pos, -amplitude, -this.step_y);
        }
    }
    this.context.closePath();
}

Decoration.prototype.createPath = function()
{
    if (this.decoration_type == 'zigzag') {
        this.createZigzagPath();
    } else if (this.decoration_type == 'wave' || this.decoration_type == 'rounded' || this.decoration_type == 'rope') {
        this.createWavePath();
    } else if (this.decoration_type == 'stamp') {
        this.createStampPath();
    }
}

Decoration.prototype.animateBorderWidth = function(start_value, end_value, step, delay)
{
    start_value += step;
    if ((step > 0 && start_value > end_value) || (step < 0 && start_value < end_value)) {
        start_value = end_value;
    }
    this.decoration_border_width = start_value;
    this.redraw()
    if ((step > 0 && start_value < end_value) || (step < 0 && start_value > end_value)) {
        if (this.animate_border_width_timeout) {
            clearTimeout(this.animate_border_width_timeout);
        }
        this.animate_border_width_timeout = setTimeout(function(obj) { return function() { obj.animateBorderWidth(start_value, end_value, step, delay) } }(this), delay);
    }
}

Decoration.prototype.animateLineWidth = function(start_value, end_value, step, delay)
{
    start_value += step;
    if ((step > 0 && start_value > end_value) || (step < 0 && start_value < end_value)) {
        start_value = end_value;
    }
    this.decoration_line_width = start_value;
    this.redraw()
    if ((step > 0 && start_value < end_value) || (step < 0 && start_value > end_value)) {
        if (this.animate_line_width_timeout) {
            clearTimeout(this.animate_line_width_timeout);
        }
        this.animate_line_width_timeout = setTimeout(function(obj) { return function() { obj.animateLineWidth(start_value, end_value, step, delay) } }(this), delay);
    }
}

Decoration.prototype.animatePadding = function(start_value, end_value, step, delay)
{
    start_value += step;
    if ((step > 0 && start_value > end_value) || (step < 0 && start_value < end_value)) {
        start_value = end_value;
    }
    this.decoration_padding = start_value;
    this.redraw()
    if ((step > 0 && start_value < end_value) || (step < 0 && start_value > end_value)) {
        if (this.animate_padding_timeout) {
            clearTimeout(this.animate_padding_timeout);
        }
        this.animate_padding_timeout = setTimeout(function(obj) { return function() { obj.animatePadding(start_value, end_value, step, delay) } }(this), delay);
    }
}

Decoration.prototype.getCornerWidth = function(segment_length, border_width, line_width)
{
    /* This is when two lines intersect: The maximum corner width is a function of
       the border_width, the segment length and the line width:
                ^
              / | \
             /  |  \
            /   |   \
           /    |    \
          /\    | h  /\
         /  \   |   /  \
        /    \  |  /    \
       /      \ | /      \
      /        \|/        \
     /         /\          \
    /        /   \          \  */
    if (this.decoration_type != 'zigzag' && this.decoration_type != 'stamp') {
        return 1;
    }
    var angle = Math.atan(segment_length / border_width);
    var h = line_width / Math.sin(angle);
    if (Math.ceil(h) - h > 0.7) {
        return Math.floor(h);
    } else {
        return Math.ceil(h);
    }
}

Decoration.prototype.redraw = function()
{
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.corner_width = this.getCornerWidth(this.decoration_segment_length, this.decoration_border_width, this.decoration_line_width);
    var pos = DOM_GetPosition(this.element);
    var decoration_width = this.element.clientWidth + 2 * (this.decoration_border_width + this.decoration_padding + this.corner_width);
    var decoration_height = this.element.clientHeight + 2 * (this.decoration_border_width + this.decoration_padding + this.corner_width);
    this.canvas.style.left = (pos.x - this.decoration_border_width - this.decoration_padding - this.corner_width) + 'px';
    this.canvas.style.top = (pos.y - this.decoration_border_width - this.decoration_padding - this.corner_width) + 'px';
    this.canvas.width = decoration_width;
    this.canvas.height = decoration_height;
    this.context.lineWidth = this.decoration_line_width;
    
    if (this.decoration_type == 'zigzag' || this.decoration_type == 'stamp') {
        var inner_width = this.element.clientWidth + this.corner_width + 2 * this.decoration_padding;
        var inner_height = this.element.clientHeight + this.corner_width + 2 * this.decoration_padding;
    } else {
        var inner_width = this.element.clientWidth + 2 * this.decoration_padding + this.decoration_border_width;
        var inner_height = this.element.clientHeight + 2 * this.decoration_padding + this.decoration_border_width;
    }
    
    this.steps_x = Math.floor(inner_width / this.decoration_segment_length);
    this.steps_y = Math.floor(inner_height / this.decoration_segment_length);
    
    if (this.decoration_type == 'zigzag') {
        if (this.steps_x & 1) {
            this.steps_x += 1;
        }
        if (this.steps_y & 1) {
            this.steps_y += 1;
        }
    } else if (this.decoration_type == 'stamp') {
        if (this.steps_x % 3 == 2) {
            this.steps_x -= 1;
        } else if (this.steps_x % 3 == 0) {
            this.steps_x += 1;
        }
        if (this.steps_y % 3 == 2) {
            this.steps_y -= 1;
        } else if (this.steps_y % 3 == 0) {
            this.steps_y += 1;
        }
    } else {
        if (!(this.steps_x & 1)) {
            this.steps_x -= 1;
        }
        if (!(this.steps_y & 1)) {
            this.steps_y -= 1;
        }
    }
    
    this.step_x = inner_width / this.steps_x;
    this.step_y = inner_height / this.steps_y;
    
    if (this.decoration_background_color) {
        this.context.fillStyle = this.decoration_background_color;
        this.createPath();
        this.context.fill();
    }
    this.createPath();
    this.context.strokeStyle = this.decoration_color;
    this.context.stroke();
    /*
    this.context.beginPath();
    var dist = this.corner_width + this.decoration_border_width;
    this.context.rect(dist, dist, decoration_width - 2 * dist, decoration_height - 2 * dist);
    this.context.lineWidth = 1;
    this.context.strokeStyle = 'cyan';
    this.context.closePath();
    this.context.stroke();
    */
}

Decoration.prototype.isOverCanvas = function(x, y)
{
    var pos = DOM_GetPosition(this.canvas);
}

Decoration.prototype.setRollover = function(over_method, out_method)
{
    this.over_method = over_method;
    this.out_method = out_method;
    this.over = false;
    
    this.canvas.onmouseover = function(obj)
    {
        return function(event)
        {
            if (!obj.over) {
                obj.over = true;
                obj.over_method();
            }
        };
    }(this);
    
    this.canvas.onmouseout = function(obj)
    {
        return function(event)
        {
            var pos = DOM_GetPosition(obj.canvas);
            if (obj.over && (event.pageX < pos.x || event.pageX > pos.x + obj.canvas.width || event.pageY < pos.y || event.pageY > pos.y + obj.canvas.height)) {
                obj.over = false;
                obj.out_method();
            }
        };
    }(this);
    
}

Decoration.prototype.setOnMouseOut = function(method)
{
    var pos = DOM_GetPosition(this.canvas);
    d6.canvas.onmouseout = function() { d6.decoration_type = 'wave'; d6.redraw(); };
}

