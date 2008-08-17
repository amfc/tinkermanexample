function PopupButton(element, popup_element, default_action)
{
    this.click = function(event)
    {
        // Primero hay que ver si el click fue dentro del botón o a la derecha (dentro de los últimos 16 pixels que son la flecha para abajo)
        var button = DOM_GetElementFromEvent(event);
        var obj = button.handlerObject;
        var click_pos = DOM_GetPositionFromEvent(event);
        var pos = DOM_GetPosition(button);
        var scroll_pos = DOM_GetScrollBarPositions();
        var min_x = pos.x;
        var max_x = pos.x + button.offsetWidth - 19;
        var min_y = pos.y;
        var max_y = pos.y + button.offsetHeight;
        
        //alert('(' + min_x + '-' + max_x + ',' + min_y + '-' + max_y + ') / click: (' + click_pos.x + 'x' + click_pos.y + ') / scroll: (' + scroll_pos.x + ',' + scroll_pos.y + ')'); 
        if (click_pos.x < min_x || click_pos.x > max_x || click_pos.y < min_y || click_pos.y > max_y) { // Está afuera del botón, hay que mostrar las opciones
            DOM_StopPropagation(event);
            obj.toggle();
            return DOM_PreventDefault(event);
        } else { // Está adentro del botón, hay que guardar
            default_action();
        }
    }
    
    this.clickOutside = function(event)
    {
        // Primero hay que ver si el click fue dentro del botón o totalmente fuera
        var obj = document.current_popup_button;
        var click_pos = DOM_GetPositionFromEvent(event);
        var popup = obj.popup_element;
        var pos = DOM_GetPosition(popup);
        var min_x = pos.x;
        var max_x = pos.x + popup_element.offsetWidth;
        var min_y = pos.y;
        var max_y = pos.y + popup_element.offsetHeight;
        if (click_pos.x < min_x || click_pos.x > max_x || click_pos.y < min_y || click_pos.y > max_y) { // Está afuera del botón, hay que ocultarlo
            obj.collapse();
            //DOM_StopPropagation(event);
            return DOM_PreventDefault(event);
        }
    }
    
    this.toggle = function()
    {
        if (!this.expanded) { // Expand
            this.expand();
        } else { // Colapse
            this.collapse();
        }
    }
    
    this.collapse = function()
    {
        DOM_RemoveEventListener(document, 'click', this.clickOutside);
        document.current_popup_button = null;
        this.popup_element.style.visibility = 'hidden';
        this.expanded = false;
    }
    
    this.expand = function()
    {
        var pos = DOM_GetPosition(this.element);
        if ((this.popup_element.offsetHeight + pos.y + 4) > document.body.offsetHeight) {
            this.popup_element.style.top = pos.y - this.popup_element.offsetHeight + 'px';
        } else {
            this.popup_element.style.top = pos.y + this.element.offsetHeight + 'px';
        }
        this.popup_element.style.left = pos.x + 'px';
        this.popup_element.style.visibility = 'visible';
        
        document.current_popup_button = this;
        DOM_AddEventListener(document, 'click', this.clickOutside);
        this.expanded = true;
    }
    
    this.element = element;
    this.popup_element = popup_element;
    this.expanded = false;
    
    this.element.handlerObject = this;
    
    DOM_AddEventListener(this.element, 'click', this.click);
}
