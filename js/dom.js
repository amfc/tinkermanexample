var ua = navigator.userAgent.toLowerCase(); 
var DOM_IsGecko = ua.indexOf('gecko') != -1;
var DOM_IsIE = ua.indexOf('msie') != -1 && !DOM_IsOpera;

function DOM_ReplaceText(element, text)
{
    DOM_RemoveAllChildren(element);
    element.appendChild(document.createTextNode(text));
}

function DOM_RemoveAllChildren(element)
{
    while (element.childNodes.length > 0) {
        element.removeChild(element.childNodes[0]);
    }
}

function DOM_PreventDefault(event)
{
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
}

function DOM_StopPropagation(event)
{
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        window.event.cancelBubble = true;
    }
}

function DOM_AddEventListener(element, event_string, handler)
{
    if (element.addEventListener) {
        element.addEventListener(event_string, handler, false);
    } else {
        element.attachEvent("on" + event_string, handler);
    }
}

function DOM_RemoveEventListener(element, event_string, handler)
{
    if (element.addEventListener) {
        element.removeEventListener(event_string, handler, false);
    } else {
        element.detachEvent("on" + event_string, handler);
    }
}


// These are used to add or remove an event handler to an object preserving the "this" reference

var DOM_Obj_event_listeners_count = 0;

function DOM_AddObjEventListener(obj, element, event_string, handler)
{
    var item, pos = DOM_Obj_event_listeners_count;
    ++DOM_Obj_event_listeners_count;
    if (!element.DOM_ObjEventListeners) {
        element.DOM_ObjEventListeners = {};
    }
    item = {
        obj: obj,
        element: element,
        event_string: event_string,
        handler: handler
    };
    item['internal_handler'] = function(event) { DOM_RunObjEventHandler(event, item) };
    element.DOM_ObjEventListeners[pos] = item;
    DOM_AddEventListener(element, event_string, item.internal_handler);
}

function DOM_RemoveObjEventListener(obj, element, event_string, handler)
{
    var item, pos;
    for (pos in element.DOM_ObjEventListeners) {
        item = element.DOM_ObjEventListeners[pos];
        if (item.obj == obj && item.element == element && item.event_string == event_string && item.handler == handler) {
            DOM_RemoveEventListener(element, event_string, item.internal_handler);
            delete(element.DOM_ObjEventListeners[pos]);
            break;
        }
    }
}

function DOM_RunObjEventHandler(event, item)
{
    item.handler.call(item.obj, event);
}

