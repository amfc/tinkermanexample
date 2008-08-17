// Check submit
// Version 1
//
// Requires: DOM, VAR

function CheckSubmit(campos_requeridos, nombres, texto_error)
{
    var campos_con_error = [];
    
    var record_form = document.getElementById('record_form');
    var ya_se_hizo_focus = false;
    var element, value;
    var i;
    var error;
    for (i = 0; i < campos_requeridos.length; i++) {
        element = record_form[campos_requeridos[i]];
        error = false;
        if (typeof element.value == 'undefined') { // checkbox
            value = DOM_GetRadioValue(campos_requeridos[i]);
        } else {
            value = element.value;
        }
        if (campos_requeridos[i].substr(0, 5) == 'email' && !VAR_IsEmail(value)) {
            campos_con_error[campos_con_error.length] = nombres[i] + ' (no es un email válido)';
            error = true;
        } else if (VAR_IsWhitespace(value)) {
            campos_con_error[campos_con_error.length] = nombres[i];
            error = true;
        }
        if (error && !ya_se_hizo_focus && element.focus) {
            element.focus();
            ya_se_hizo_focus = true;
        }
    }
    if (campos_con_error.length > 0) {
        var error = texto_error + '\n\n';
        for (i = 0; i < campos_con_error.length; i++) {
            error += campos_con_error[i] + '\n';
        }
        alert(error);
        return false;
    }
    return true;
}
