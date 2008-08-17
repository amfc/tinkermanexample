// File Input Prevent Keys
// Prohibits keyboard entry (or in explorer pastes) into a file input (allowing TAB and ENTER)
// Version 1
// Requires: DOM

function FileInputPreventKeys(fileinput_element)
{
    this.element = fileinput_element;
    DOM_AddEventListener(this.element, 'keypress', function(event) { if (event.keyCode != 9 && event.keyCode != 13) { return DOM_PreventDefault(event) } });
    if (DOM_IsIE) {
        this.element.onpaste = function() { event.returnValue = false };
    }
}
