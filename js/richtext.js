// RTE: Cross-Browser Rich Text Editor
//
// Requires: DOM
//
// http://www.kevinroth.com/rte/demo.htm
// Written by Kevin Roth (kevin@NOSPAMkevinroth.com - remove NOSPAM)
//
// Adapted by Agustín Fernández

// init variables

var RTE_isRichText = false;
var RTE_rng;
var RTE_currentRTE;
var RTE_allRTEs = "";

var RTE_nonWorkingRTEs = [];

var RTE_isIE;
var RTE_isGecko;
var RTE_isSafari;
var RTE_isKonqueror;

var RTE_imagesPath;
var RTE_includesPath;
var RTE_cssFile;

//var RTE_listOfRTEs = [];

function RTE_InitRTE(imgPath, incPath, css) {
    //set browser vars
    var ua = navigator.userAgent.toLowerCase();
    RTE_isIE = ((ua.indexOf("msie") != -1) && (ua.indexOf("opera") == -1) && (ua.indexOf("webtv") == -1)); 
    RTE_isGecko = (ua.indexOf("gecko") != -1);
    RTE_isSafari = (ua.indexOf("safari") != -1);
    RTE_isKonqueror = (ua.indexOf("konqueror") != -1);
    
    //check to see if designMode mode is available
    if (document.getElementById && document.designMode && !RTE_isSafari && !RTE_isKonqueror) {
        RTE_isRichText = true;
    }
    
    if (!RTE_isIE) document.captureEvents(Event.MOUSEOVER | Event.MOUSEOUT | Event.MOUSEDOWN | Event.MOUSEUP);
    document.onmouseover = RTE_RaiseButton;
    document.onmouseout  = RTE_NormalButton;
    document.onmousedown = RTE_LowerButton;
    document.onmouseup   = RTE_RaiseButton;
    
    //set paths vars
    RTE_imagesPath = imgPath;
    RTE_includesPath = incPath;
    RTE_cssFile = css;
    
    if (RTE_isRichText) document.writeln('<style type="text/css">@import "' + RTE_includesPath + 'rte.css";</style>');
    
    DOM_AddPageLoadEvent(RTE_CorrectNonWorkingRTEs);
    //DOM_AddPageLoadEvent(RTE_CompleteDrawingRTEs);
    
    //for testing standard textarea, uncomment the following line
    //RTE_isRichText = false;
}

//function RTE_CompleteDrawingRTEs()
//{
//    var i;
//    for (i = 0; i < RTE_listOfRTEs.length; i++) {
//        RTE_EnableDesignMode(RTE_listOfRTEs[i].name, RTE_listOfRTEs[i].html, RTE_listOfRTEs[i].readOnly);
//    }
//}

function RTE_WriteRichText(rte, html, width, height, buttons, readOnly) {
    if (RTE_isRichText) {
        if (RTE_allRTEs.length > 0) RTE_allRTEs += ";";
        RTE_allRTEs += rte;
        RTE_WriteRTE(rte, html, width, height, buttons, readOnly);
    } else {
        RTE_WriteDefault(rte, html, width, height, buttons, readOnly);
    }
}

function RTE_WriteDefault(rte, html, width, height, buttons, readOnly) {
    if (!readOnly) {
        document.writeln('<textarea name="' + rte + '" id="' + rte + '" style="width: ' + width + 'px; height: ' + height + 'px;">' + html + '</textarea>');
    } else {
        document.writeln('<textarea name="' + rte + '" id="' + rte + '" style="width: ' + width + 'px; height: ' + height + 'px;" readonly>' + html + '</textarea>');
    }
}

function RTE_RaiseButton(e) {
    if (RTE_isIE) {
        var el = window.event.srcElement;
    } else {
        var el= e.target;
    }
    
    var className = el.className;
    if (className == 'rteImage' || className == 'rteImageLowered') {
        el.className = 'rteImageRaised';
    }
}

function RTE_NormalButton(e) {
    if (RTE_isIE) {
        var el = window.event.srcElement;
    } else {
        var el= e.target;
    }
    
    var className = el.className;
    if (className == 'rteImageRaised' || className == 'rteImageLowered') {
        el.className = 'rteImage';
    }
}

function RTE_LowerButton(e) {
    if (RTE_isIE) {
        var el = window.event.srcElement;
    } else {
        var el= e.target;
    }
    
    var className = el.className;
    if (className == 'rteImage' || className == 'rteImageRaised') {
        el.className = 'rteImageLowered';
    }
}

setHtml = function(iframeId) {
  var iframe = document.getElementById(iframeId);
  iframe.contentWindow.document.body.innerHTML = "hello world";
  if (!iframe.contentWindow.document.body.innerHTML) setTimeout("setHtml()", 100);
}

function RTE_WriteRTE(rte, html, width, height, buttons, readOnly) {
    if (readOnly) buttons = false;
    /*
    //adjust minimum table widths
    if (RTE_isIE) {
        if (buttons && (width < 630)) width = 630;
        var tablewidth = width;
    } else {
        if (buttons && (width < 530)) width = 530;
        var tablewidth = width + 4;
    }
    */
    document.writeln('<div class="html_editor">');
    if (buttons == true) {
        document.writeln('<div class="html_editor_controls" id="Buttons1_' + rte + '" style="width: ' + width + 'px">');
        document.writeln('  <select id="formatblock_' + rte + '" onchange="RTE_Select(\'' + rte + '\', this.id);">');
        document.writeln('     <option value="">[Estilo]</option>');
        document.writeln('     <option value="<p>">Normal</option>');
        document.writeln('     <option value="<h1>">Titular 1</option>');
        document.writeln('     <option value="<h2>">Titular 2</option>');
        document.writeln('     <option value="<h3>">Titular 3</option>');
        document.writeln('   </select>');
        document.writeln('   <span class="icon_group">');
        document.writeln('<img src="' + RTE_imagesPath + 'bold.gif" alt="Negrita" title="Negrita" onClick="RTE_FormatText(\'' + rte + '\', \'bold\', \'\')"/>');
        document.writeln('<img src="' + RTE_imagesPath + 'italic.gif" alt="Itálica" title="Itálica" onClick="RTE_FormatText(\'' + rte + '\', \'italic\', \'\')"/>');
        document.writeln('</span');
        
        document.writeln('   <span class="icon_group">');
        document.writeln('<img src="' + RTE_imagesPath + 'align_left.gif" alt="Alinear a la izquierda" title="Alinear a la izquierda" onClick="RTE_FormatText(\'' + rte + '\', \'justifyleft\', \'\')"/>');
        document.writeln('<img src="' + RTE_imagesPath + 'align_center.gif" alt="Centrar" title="Centrar" onClick="RTE_FormatText(\'' + rte + '\', \'justifycenter\', \'\')"/>');
        document.writeln('<img src="' + RTE_imagesPath + 'align_right.gif" alt="Alinear a la derecha" title="Alinear a la derecha" onClick="RTE_FormatText(\'' + rte + '\', \'justifyright\', \'\')"/>');
        document.writeln('</span');
        
        document.writeln('   <span class="icon_group">');
        document.writeln('<img src="' + RTE_imagesPath + 'ol.gif" alt="Lista numerada" title="Lista numerada" onClick="RTE_FormatText(\'' + rte + '\', \'insertorderedlist\', \'\')"/>');
        document.writeln('<img src="' + RTE_imagesPath + 'ul.gif" alt="Lista sin numerar" title="Lista sin numerar" onClick="RTE_FormatText(\'' + rte + '\', \'insertunorderedlist\', \'\')"/>');
        document.writeln('</span');
        document.writeln('   <span class="icon_group">');
        document.writeln('<img src="' + RTE_imagesPath + 'outdent.gif" alt="Reducir sangría" title="Reducir sangría" onClick="RTE_FormatText(\'' + rte + '\', \'outdent\', \'\')"/>');
        document.writeln('<img src="' + RTE_imagesPath + 'indent.gif" alt="Aumentar sangría" title="Aumentar sangría" onClick="RTE_FormatText(\'' + rte + '\', \'indent\', \'\')"/>');
        document.writeln('   <span class="icon_group">');
        document.writeln('<img src="' + RTE_imagesPath + 'href.gif" alt="Insertar link" title="Insertar link" onClick="RTE_FormatText(\'' + rte + '\', \'createlink\')"/>');
        document.writeln('</span');
        document.writeln('</div>');
    }
    document.writeln('<iframe id="' + rte + '" name="' + rte + '" style="width: ' + (width + 8) + 'px; height: ' + height + 'px;"></iframe>');
    if (!readOnly) document.writeln('<br /><input type="checkbox" id="chkSrc' + rte + '" onclick="RTE_ToggleHTMLSrc(\'' + rte + '\');" />&nbsp;Ver código');
    //document.writeln('<iframe width="154" height="104" id="cp' + rte + '" src="' + RTE_includesPath + 'palette.htm" marginwidth="0" marginheight="0" scrolling="no" style="visibility:hidden; display: none; position: absolute;"></iframe>');
    document.writeln('<input type="hidden" id="hdn' + rte + '" name="' + rte + '" value="">');
    document.writeln('</div>');
    //document.getElementById('hdn' + rte).value = html;
    //RTE_listOfRTEs[RTE_listOfRTEs.length] = {'name': rte, 'html': html, 'readOnly': readOnly};
    RTE_EnableDesignMode(rte, html, readOnly);
    /*if (RTE_isGecko) {
        //setTimeout("RTE_EnableDesignMode('" + rte + "', '" + html + "', " + readOnly + ");", 10000);
        //DOM_AddEventListener(document, 'load', RTE_CorrectNonWorkingRTEs);
    }*/
}

function RTE_EnableDesignMode(rte, html, readOnly) {
    
    var frameHtml = "<html id=\"" + rte + "\">\n";
    frameHtml += "<head>\n";
    //to reference your stylesheet, set href property below to your stylesheet path and uncomment
    if (RTE_cssFile.length > 0) {
        /*
        frameHtml += "<script type='text/javascript'>\n";
        frameHtml += "function hi() {\n";
        frameHtml += "    var head = document.getElementsByTagName('head')[0];\n";
        frameHtml += "    var css = document.createElement('link');\n";
        frameHtml += "    css.setAttribute('type', 'text/css');\n";
        frameHtml += "    css.setAttribute('href', '" + RTE_cssFile + "');\n";
        frameHtml += "    css.setAttribute('rel', 'stylesheet');\n";
        frameHtml += "    head.appendChild(css);\n";
        frameHtml += "    var body = document.getElementsByTagName('body')[0];\n";
        frameHtml += "} \n";
        frameHtml += "</script>\n";*/
        frameHtml += "<link media=\"all\" type=\"text/css\" href=\"" + RTE_cssFile + "\" rel=\"stylesheet\">\n";
    } else {
        frameHtml += "<style>\n";
        frameHtml += "body {\n";
        frameHtml += "    background-color: white;\n";
        frameHtml += "    margin: 0px;\n";
        frameHtml += "    padding: 0px;\n";
        frameHtml += "}\n";
        frameHtml += "</style>\n";
    }
    frameHtml += "</head>\n";
    frameHtml += "<body onload='hi();' designMode=on>\n";
    frameHtml += html + "\n";
    frameHtml += "</div></body>\n";
    frameHtml += "</html>";
    
    if (document.all) {
        var oRTE = frames[rte].document;
        oRTE.open();
        oRTE.write(frameHtml);
        oRTE.close();
        //if (!readOnly) oRTE.designMode = "On";
    } else {
        var oRTE = document.getElementById(rte).contentWindow.document;
        oRTE.open();
        oRTE.write(frameHtml);
        oRTE.close();
        //attach a keyboard handler for gecko browsers to make keyboard shortcuts work
        //gecko may take some time to enable design mode.
        //Keep looping until able to set.
        
        //alert(frames[rte]);
        frames[rte].onload = function() {
            alert('he');
            var doc = this.document;
            try {
                doc.designMode = "on";
            } catch (e) {
                alert(e);
            };
        };
        
        /*
        if (RTE_isGecko && !readOnly) {
            setTimeout("RTE_ContinueEnablingDesignMode('" + rte + "', " + readOnly + ", 1);", 10);
        }*/
    }
}

function RTE_ContinueEnablingDesignMode(rte, readOnly, attempt) {
    if (attempt < 10) {
        if (!readOnly) document.getElementById(rte).contentDocument.designMode = "on";
        var oRTE = frames[rte].document, e;
        try {
            oRTE.addEventListener("keypress", RTE_Kb_handler, true);
            oRTE.execCommand('useCSS', false, true);
        } catch (e) {
            setTimeout("RTE_ContinueEnablingDesignMode('" + rte + "', " + readOnly + ", " + (attempt + 1) + ");", 10 * attempt);
        }
    } else {
        RTE_nonWorkingRTEs[RTE_nonWorkingRTEs.length] = rte;
    }
}

function RTE_CorrectNonWorkingRTEs() {
    var i, list;
    list = RTE_nonWorkingRTEs;
    RTE_nonWorkingRTEs = [];
    for (i = 0; i < list.length; i++) {
        alert('correcting ' + list[i]);
        RTE_ContinueEnablingDesignMode(list[i], false, 0);
    }
}

function RTE_UpdateRTEs() {
    var vRTEs = RTE_allRTEs.split(";");
    for (var i = 0; i < vRTEs.length; i++) {
        RTE_UpdateRTE(vRTEs[i]);
    }
}

function RTE_UpdateRTE(rte) {
    if (!RTE_isRichText) return;
    
    //set message value
    var oHdnMessage = document.getElementById('hdn' + rte);
    var oRTE = document.getElementById(rte);
    var readOnly = false;
    
    //check for readOnly mode
    if (document.all) {
        if (frames[rte].document.designMode != "On") readOnly = true;
    } else {
        if (document.getElementById(rte).contentDocument.designMode != "on") readOnly = true;
    }
    
    if (RTE_isRichText && !readOnly) {
        //if viewing source, switch back to design view
        if (document.getElementById("chkSrc" + rte).checked) {
            document.getElementById("chkSrc" + rte).checked = false;
            RTE_ToggleHTMLSrc(rte);
        }
        
        if (oHdnMessage.value == null) oHdnMessage.value = "";
        if (document.all) {
            oHdnMessage.value = frames[rte].document.body.innerHTML;
        } else {
            oHdnMessage.value = oRTE.contentWindow.document.body.innerHTML;
        }
        
        //if there is no content (other than formatting) set value to nothing
        if (RTE_StripHTML(oHdnMessage.value.replace("&nbsp;", " ")) == "" 
            && oHdnMessage.value.toLowerCase().search("<hr") == -1
            && oHdnMessage.value.toLowerCase().search("<img") == -1) oHdnMessage.value = "";
        //fix for gecko
        if (escape(oHdnMessage.value) == "%3Cbr%3E%0D%0A%0D%0A%0D%0A") oHdnMessage.value = "";
    }
}

function RTE_ToggleHTMLSrc(rte) {
    //contributed by Bob Hutzel (thanks Bob!)
    var oRTE;
    if (document.all) {
        oRTE = frames[rte].document;
    } else {
        oRTE = document.getElementById(rte).contentWindow.document;
    }
    
    if (document.getElementById("chkSrc" + rte).checked) {
        document.getElementById("Buttons1_" + rte).style.visibility = "hidden";
        //document.getElementById("Buttons2_" + rte).style.visibility = "hidden";
        if (document.all) {
            oRTE.body.innerText = oRTE.body.innerHTML;
        } else {
            var htmlSrc = oRTE.createTextNode(oRTE.body.innerHTML);
            oRTE.body.innerHTML = "";
            oRTE.body.appendChild(htmlSrc);
        }
    } else {
        document.getElementById("Buttons1_" + rte).style.visibility = "visible";
        //document.getElementById("Buttons2_" + rte).style.visibility = "visible";
        if (document.all) {
            //fix for IE
            var output = escape(oRTE.body.innerText);
            output = output.replace("%3CP%3E%0D%0A%3CHR%3E", "%3CHR%3E");
            output = output.replace("%3CHR%3E%0D%0A%3C/P%3E", "%3CHR%3E");
            
            oRTE.body.innerHTML = unescape(output);
        } else {
            var htmlSrc = oRTE.body.ownerDocument.createRange();
            htmlSrc.selectNodeContents(oRTE.body);
            oRTE.body.innerHTML = htmlSrc.toString();
        }
    }
}

//Function to format text in the text box
function RTE_FormatText(rte, command, option) {
    var oRTE;
    if (document.all) {
        oRTE = frames[rte];
        
        //get current selected range
        var selection = oRTE.document.selection; 
        if (selection != null) {
            RTE_rng = selection.createRange();
        }
    } else {
        oRTE = document.getElementById(rte).contentWindow;
        
        //get currently selected range
        var selection = oRTE.getSelection();
        RTE_rng = selection.getRangeAt(selection.rangeCount - 1).cloneRange();
    }
    
    try {
        if ((command == "forecolor") || (command == "hilitecolor")) {
            //save current values
            parent.command = command;
            RTE_currentRTE = rte;
            
            //position and show color palette
            buttonElement = document.getElementById(command + '_' + rte);
            // Ernst de Moor: Fix the amount of digging parents up, in case the RTE editor itself is displayed in a div.
            document.getElementById('cp' + rte).style.left = RTE_GetOffsetLeft(buttonElement, 4) + "px";
            document.getElementById('cp' + rte).style.top = (RTE_GetOffsetTop(buttonElement, 4) + buttonElement.offsetHeight + 4) + "px";
            if (document.getElementById('cp' + rte).style.visibility == "hidden") {
                document.getElementById('cp' + rte).style.visibility = "visible";
                document.getElementById('cp' + rte).style.display = "inline";
            } else {
                document.getElementById('cp' + rte).style.visibility = "hidden";
                document.getElementById('cp' + rte).style.display = "none";
            }
        } else if (command == "createlink") {
            var szURL = prompt("Enter a URL:", "");
            try {
                //ignore error for blank urls
                oRTE.document.execCommand("Unlink", false, null);
                oRTE.document.execCommand("CreateLink", false, szURL);
            } catch (e) {
                //do nothing
            }
        } else {
            oRTE.focus();
            oRTE.document.execCommand(command, false, option);
            oRTE.focus();
        }
    } catch (e) {
        alert(oRTE.document.queryCommandEnabled(command, false, option));
        alert(e);
    }
}

//Function to set color
function RTE_SetColor(color) {
    var rte = RTE_currentRTE;
    var oRTE;
    if (document.all) {
        oRTE = frames[rte];
    } else {
        oRTE = document.getElementById(rte).contentWindow;
    }
    
    var parentCommand = parent.command;
    if (document.all) {
        //retrieve selected range
        var sel = oRTE.document.selection; 
        if (parentCommand == "hilitecolor") parentCommand = "backcolor";
        if (sel != null) {
            var newRng = sel.createRange();
            newRng = RTE_rng;
            newRng.select();
        }
    }
    oRTE.focus();
    oRTE.document.execCommand(parentCommand, false, color);
    oRTE.focus();
    document.getElementById('cp' + rte).style.visibility = "hidden";
    document.getElementById('cp' + rte).style.display = "none";
}

//Function to add image
function RTE_AddImage(rte) {
    var oRTE;
    if (document.all) {
        oRTE = frames[rte];
        
        //get current selected range
        var selection = oRTE.document.selection; 
        if (selection != null) {
            RTE_rng = selection.createRange();
        }
    } else {
        oRTE = document.getElementById(rte).contentWindow;
        
        //get currently selected range
        var selection = oRTE.getSelection();
        RTE_rng = selection.getRangeAt(selection.rangeCount - 1).cloneRange();
    }
    
    imagePath = prompt('Enter Image URL:', 'http://');                
    if ((imagePath != null) && (imagePath != "")) {
        oRTE.focus();
        oRTE.document.execCommand('InsertImage', false, imagePath);
        oRTE.focus();
    }
}

//function to perform spell check
function RTE_Checkspell() {
    try {
        var tmpis = new ActiveXObject("ieSpell.ieSpellExtension");
        tmpis.CheckAllLinkedDocuments(document);
    }
    catch(exception) {
        if(exception.number==-2146827859) {
            if (confirm("ieSpell not detected.  Click Ok to go to download page."))
                window.open("http://www.iespell.com/download.php","DownLoad");
        } else {
            alert("Error Loading ieSpell: Exception " + exception.number);
        }
    }
}

// Ernst de Moor: Fix the amount of digging parents up, in case the RTE editor itself is displayed in a div.
function RTE_GetOffsetTop(elm, parents_up) {
    var mOffsetTop = elm.offsetTop;
    var mOffsetParent = elm.offsetParent;
    
    if(!parents_up) {
        parents_up = 10000; // arbitrary big number
    }
    while(parents_up>0 && mOffsetParent) {
        mOffsetTop += mOffsetParent.offsetTop;
        mOffsetParent = mOffsetParent.offsetParent;
        parents_up--;
    }
    
    return mOffsetTop;
}

// Ernst de Moor: Fix the amount of digging parents up, in case the RTE editor itself is displayed in a div.
function RTE_GetOffsetLeft(elm, parents_up) {
    var mOffsetLeft = elm.offsetLeft;
    var mOffsetParent = elm.offsetParent;
    
    if(!parents_up) {
        parents_up = 10000; // arbitrary big number
    }
    while(parents_up>0 && mOffsetParent) {
        mOffsetLeft += mOffsetParent.offsetLeft;
        mOffsetParent = mOffsetParent.offsetParent;
        parents_up--;
    }
    
    return mOffsetLeft;
}

function RTE_Select(rte, selectname) {
    var oRTE;
    if (document.all) {
        oRTE = frames[rte];
        
        //get current selected range
        var selection = oRTE.document.selection; 
        if (selection != null) {
            RTE_rng = selection.createRange();
        }
    } else {
        oRTE = document.getElementById(rte).contentWindow;
        
        //get currently selected range
        var selection = oRTE.getSelection();
        RTE_rng = selection.getRangeAt(selection.rangeCount - 1).cloneRange();
    }
    
    var idx = document.getElementById(selectname).selectedIndex;
    // First one is always a label
    if (idx != 0) {
        var selected = document.getElementById(selectname).options[idx].value;
        var cmd = selectname.replace('_' + rte, '');
        oRTE.focus();
        oRTE.document.execCommand(cmd, false, selected);
        oRTE.focus();
        document.getElementById(selectname).selectedIndex = 0;
    }
}

function RTE_Kb_handler(evt) {
    var rte = evt.target.id;
    
    //contributed by Anti Veeranna (thanks Anti!)
    if (evt.ctrlKey) {
        var key = String.fromCharCode(evt.charCode).toLowerCase();
        var cmd = '';
        switch (key) {
            case 'b': cmd = "bold"; break;
            case 'i': cmd = "italic"; break;
            case 'u': cmd = "underline"; break;
        };

        if (cmd) {
            RTE_FormatText(rte, cmd, true);
            //evt.target.ownerDocument.execCommand(cmd, false, true);
            // stop the event bubble
            evt.preventDefault();
            evt.stopPropagation();
        }
     }
}

function RTE_DocChanged(evt) {
    alert('changed');
}

function RTE_StripHTML(oldString) {
    var newString = oldString.replace(/(<([^>]+)>)/ig,"");
    
    //replace carriage returns and line feeds
   newString = newString.replace(/\r\n/g," ");
   newString = newString.replace(/\n/g," ");
   newString = newString.replace(/\r/g," ");
    
    //RTE_Trim string
    newString = RTE_Trim(newString);
    
    return newString;
}

function RTE_Trim(inputString) {
    // Removes leading and trailing spaces from the passed string. Also removes
    // consecutive spaces and replaces it with one space. If something besides
    // a string is passed in (null, custom object, etc.) then return the input.
    if (typeof inputString != "string") return inputString;
    var retValue = inputString;
    var ch = retValue.substring(0, 1);
    
    while (ch == " ") { // Check for spaces at the beginning of the string
      retValue = retValue.substring(1, retValue.length);
      ch = retValue.substring(0, 1);
    }
    ch = retValue.substring(retValue.length-1, retValue.length);
    
    while (ch == " ") { // Check for spaces at the end of the string
      retValue = retValue.substring(0, retValue.length-1);
      ch = retValue.substring(retValue.length-1, retValue.length);
    }
    
    // Note that there are two spaces in the string - look for multiple spaces within the string
    while (retValue.indexOf("  ") != -1) {
        // Again, there are two spaces in each of the strings
      retValue = retValue.substring(0, retValue.indexOf("  ")) + retValue.substring(retValue.indexOf("  ")+1, retValue.length);
    }
    
    return retValue; // Return the trimmed string back to the user
}
