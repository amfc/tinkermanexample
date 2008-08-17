Log = function()
{
    var obj = new function()
    {
        this.n = 0;
        this.count = 0;
        this.element_created = false;
        
        this.dragging = false;
        this.y_position = 0;
        
        this.max_count = 20;
        
        this.append = false;
        
        this.createElement = function(tag_name)
        {
            element = document.createElement(tag_name);
            element.style.border = 'none';
            element.style.margin = '0';
            element.style.padding = '0';
            element.style.color = 'black';
            element.style.backgroundColor = 'white';
            element.style.fontFamily = 'monospace';
            element.style.fontSize = '9pt';
            return element;
        }
        
        this.log = function(message, title)
        {
            if (!this.element_created) {
                this.createMainElement();
            }
            
            if (this.count >= this.max_count) {
                if (!this.append) {
                    this.div.removeChild(this.div.lastChild);
                } else {
                    this.div.removeChild(this.div.firstChild);
                }
            } else {
                this.count++;
            }
            
            this.n++;
            
            var div = this.createElement('div');
            div.style.fontFamily = 'monospace';
            div.style.fontSize = '9pt';
            div.style.color = 'black';
            div.style.border = 'none';
            div.style.margin = '0';
            div.style.borderBottom = '1px solid #aaaaaa';
            div.style.padding = '2px';
            if (this.n & 1) {
                div.style.backgroundColor = '#faffff';
            } else {
                div.style.backgroundColor = '#fff3f2';
            }
            var em = this.createElement('em');
            em.appendChild(document.createTextNode(this.n));
            div.appendChild(em);
            div.appendChild(document.createTextNode(': '));
            if (title) {
                var strong = this.createElement('strong');
                strong.appendChild(document.createTextNode(title + ': '));
                div.appendChild(strong);
            }
            
            var i;
            if (message == null) {
                div.appendChild(document.createTextNode(typeof message));
                div.appendChild(document.createTextNode('-> null'));
            } else if (typeof message == 'object' && message.tagName) {
                div.appendChild(document.createTextNode(this.getHTMLElementLogText(message)));
            } else if (typeof message == 'object' && message.item) {
                var i = 0;
                div.appendChild(document.createTextNode('NodeList ->'));
                for (i = 0; i < message.length; i++) {
                    div.appendChild(this.createElement('br'));
                    div.appendChild(document.createTextNode(this.getHTMLElementLogText(message[i])));
                }
            } else if (typeof message == 'object' && message.constructor == Array) {
                var i = 0;
                div.appendChild(document.createTextNode('Array ->'));
                for (i = 0; i < message.length; i++) {
                    div.appendChild(this.createElement('br'));
                    div.appendChild(document.createTextNode(i + ' -> ' + message[i]));
                }
            } else if (typeof message != 'undefined' && typeof message.toString == 'function') {
                div.appendChild(document.createTextNode(typeof message));
                var parts = message.toString().split(/\n/);
                div.appendChild(document.createTextNode(' -> '));
                for (i = 0; i < parts.length; i++) {
                    if (i) {
                        div.appendChild(this.createElement('br'));
                    }
                    div.appendChild(document.createTextNode(parts[i]));
                }
            }
            
            if (!this.append) {
                this.div.insertBefore(div, this.div.firstChild);
            } else {
                this.div.appendChild(div);
            }
            
            return message;
        }
        
        this.getHTMLElementLogText = function(element)
        {
            var text = 'HTML ' + element.tagName.toUpperCase();
            if (element.tagName.toLowerCase() == 'input') {
                text += '[type=' + element.type + ']';
            }
            text += ' ->';
            if (element.id) {
                text += ' id=' + element.id;
            }
            if (element.name) {
                text += ' name=' + element.name;
            }
            if (element.className) {
                text += ' class=' + element.className;
            }
            return text;
        }
        
        this.onClick = function(event)
        {
            document.body.removeChild(this.container);
            this.element_created = false;
            this.count = 0;
            return false;
        }
        
        this.onBigDivMousedown = function(event)
        {
            this.dragging = true;
            this.drag_pos_x = event.clientX;
            this.drag_pos_y = event.clientY;
            this.original_drag_pos_y = event.clientY;
            this.big_div.style.borderColor = 'black';
            return false;
        }
        
        this.onDivMousedown = function(event)
        {
            DOM_StopPropagation(event);
        }
        
        this.onMousemove = function(event)
        {
            if (this.dragging) {
                var x = this.big_div.offsetLeft + event.clientX - this.drag_pos_x, y = this.big_div.offsetTop + event.clientY - this.drag_pos_y;
                //this.big_div.style.left = x + 'px';
                this.big_div.style.top = y + 'px';
                this.big_div.style.top = y + 'px';
                this.drag_pos_x = event.clientX;
                this.drag_pos_y = event.clientY;
                return false;
            }
        }
        
        this.onMouseup = function(event)
        {
            this.dragging = false;
            this.big_div.style.borderColor = 'gray';
            this.y_position = this.y_position + (this.drag_pos_y - this.original_drag_pos_y);
        }
        
        this.resizeElement = function()
        {
            var size = DOM_GetWindowInnerSize();
            this.container.style.width = size.w + 'px';
            var height = Math.floor(size.h / 4);
            this.container.style.height =  height + 'px';
            if (DOM_IsIE) {
                var pos = DOM_GetScrollBarPositions();
                this.container.style.top = Math.ceil(size.h - height + pos.y + this.y_position) + 'px';
            } else {
                this.container.style.top = Math.ceil(size.h - height + this.y_position) + 'px';
            }
        }
        
        this.createMainElement = function()
        {
            this.element_created = true;
            
            this.container = this.createElement('div');
            this.big_div = this.createElement('div');
            if (DOM_IsIE) {
                this.container.style.position = 'absolute';
            } else {
                this.container.style.position = 'fixed';
            }
            this.big_div.style.border = '2px solid gray';
            this.big_div.style.backgroundColor = 'white';
            this.big_div.style.padding = '5px';
            this.container.style.left = '0';
            this.container.zIndex = '100';
            this.big_div.style.fontWeight = 'bold';
            this.big_div.style.color = 'gray';
            DOM_AddEventListener(this.big_div, 'mousedown', function(obj) { return function(event) { return obj.onBigDivMousedown(event) } }(this));
            DOM_AddEventListener(document, 'mousemove', function(obj) { return function(event) { return obj.onMousemove(event) } }(this));
            DOM_AddEventListener(this.big_div, 'mouseup', function(obj) { return function(event) { return obj.onMouseup(event) } }(this));
            
            this.div = this.createElement('div');
            DOM_AddEventListener(this.div, 'mousedown', function(obj) { return function(event) { return obj.onDivMousedown(event) } }(this));
            this.div.style.border = '1px solid #ccc';
            this.div.style.backgroundColor = 'white';
            this.div.style.fontSize = '10px';
            this.div.style.padding = '5px';
            this.div.style.marginTop = '2px';
            this.div.style.fontWeight = 'normal';
            this.div.style.backgroundColor = '#fcfcfc';
            
            this.div.style.overflow = 'auto';
            var a = this.createElement('a');
            a.href = '#';
            a.style.fontWeight = 'normal';
            a.onclick = function(obj) { return function(event) { return obj.onClick(event) } }(this);
            a.appendChild(document.createTextNode('cerrar'));
            
            var span = this.createElement('span');
            span.style.color = 'gray';
            span.style.textTransform = 'uppercase';
            span.appendChild(document.createTextNode('Mensajes'));
            this.big_div.appendChild(span);
            this.big_div.appendChild(document.createTextNode(' - '));
            this.big_div.appendChild(a);
            this.big_div.appendChild(this.div);
            this.container.appendChild(this.big_div);
            
            this.resizeElement();
            
            document.body.insertBefore(this.container, document.body.firstChild);
            DOM_AddEventListener(window, 'resize', function (obj) { return function(event) { obj.resizeElement() } }(this));
            if (DOM_IsIE) {
                DOM_AddEventListener(window, 'scroll', function (obj) { return function(event) { obj.resizeElement() } }(this));
            }
        }
    }();
    
    return function(message, title) { return obj.log(message, title) }
}();