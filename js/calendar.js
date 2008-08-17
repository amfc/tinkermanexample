var CAL_MonthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var CAL_ShortMonthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

function CAL_Calendar(id, name, required, properties, data, images_path)
{
    this.date = new Date();
    this.week_day = false;
    this.selected_element = false;
    this.hidden_elements = []; // Para ocultar los elementos del formulario que pudieran interferir con el div en el internet explorer
    this.dont_hide = true; // Hace que en la próxima pasada se ignoren los clics fuera del calendario, está para que el mismo click que lo abre no lo cierren (probablemente se podría hacer que el evento use capture en vez de bubble, pero en el ie no se puede)
    this.changing_date = 0;
    this.data = data;
    this.images_path = images_path;
    this.id = id;
    this.create();
    this.build();
    this.init(id, name, required, properties);
}

CAL_Calendar.prototype = new REC_Field;

CAL_Calendar.prototype.get = function()
{
    return this.hidden_element.value;
}

CAL_Calendar.prototype.set = function(data)
{
    this.hidden_element.value = data;
    this.build();
}

CAL_Calendar.prototype.hasData = function()
{
    var value = this.get();
    return value && value != '0000-00-00';
}

CAL_Calendar.prototype.prevMonth = function()
{
    this.date.setMonth(this.date.getMonth()-1);
    this.build();
}

CAL_Calendar.prototype.nextMonth = function()
{
    this.date.setMonth(this.date.getMonth()+1);
    this.build();
}

CAL_Calendar.prototype.changeDateByText = function()
{
    if (this.changing_date) {
        return;
    } else {
        this.changing_date = 1;
    }
    
    var hidden = this.hidden_element;
    var text = this.element;
    var re = /^\s*$/;
    if (re.test(text)) {
        hidden.value = '0000-00-00';
        this.changing_date = 0;
        return;
    }
    var re = /^\s*(\d{1,2})[\/-](.{1,})[\/-](\d{2}|\d{4})\s*$/i;
    var result = re.exec(text.value);
    var ok = true;
    if (result == null) {
        ok = false;
    } else {
        var day = Number(result[1]);
        var month = result[2];
        var year = Number(result[3]);
        if (day < 1 || day > 31) {
            ok = false;
        }
        var month_number = Number(month);
        if (isNaN(month_number)) {
            var i = 0;
            month_name = month.toUpperCase();
            for (i = 0; i < CAL_ShortMonthNames.length; i++) {
                if (month_name == CAL_ShortMonthNames[i].toUpperCase()) {
                    month_number = i + 1;
                    break;
                }
            }
            if (isNaN(month_number)) {
                for (i = 0; i < CAL_MonthNames.length; i++) {
                    if (month_name == CAL_MonthNames[i].toUpperCase()) {
                        month_number = i + 1;
                        break;
                    }
                }
            }
            if (isNaN(month_number)) {
                ok = false;
            }
        } else {
            if (month_number < 1 || month_number > 12) {
                ok = false;
            }
        }
        if (year < 100) {
            if (year < 70) {
                year = year + 2000;
            } else {
                year = year + 1900;
            }
        }
    }
    
    if (!ok) {
        hidden.value = '0000-00-00';
    } else {
        month_name = CAL_ShortMonthNames[month_number - 1];
        month_name = month_name.substr(0,1).toUpperCase() + month_name.substr(1);
        day = day.toString();
        if (day.length < 2) {
            day = '0' + day;
        }
        month = month_number.toString();
        if (month.length < 2) {
            month = '0' + month;
        }
        
        year = year.toString();
        
        text.value = day + '/' + month_name + '/' + year;
        hidden.value = year + '-' + month + '-' + day;
        this.runOnChange();
        this.date.setDate(day);
        this.date.setMonth(month_number - 1);
        this.date.setYear(year);
        this.build();
    }
    this.changing_date = 0;
}

CAL_Calendar.prototype.mouseOverDay = function(element)
{
    if (!VAR_HasWord(element.className, 'selected')) {
        element.className = VAR_AddWord(element.className, 'over');
    }
}

CAL_Calendar.prototype.mouseOutDay = function(element)
{
    element.className = VAR_RemoveWord(element.className, 'over');
}

CAL_Calendar.prototype.hide = function()
{
    if (document.all) {
        for (i = 0; i < this.hidden_elements.length; i++) {
            this.hidden_elements[i].style.visibility = 'visible';
        }
    }
    document.getElementById(this.id + '-table').style.display = 'none';
}

CAL_Calendar.prototype.documentClick = function(event)
{
    if (this.dont_hide) {
        this.dont_hide = false;
    } else {
        // Primero hay que ver si el click fue dentro del calendario o no
        var table = document.getElementById(this.id + '-table');
        
        var x, y;
        if (event.pageX) { /* Standards... */
            x = event.pageX;
            y = event.pageY;
        } else { /* ie ... */
            x = event.x;
            y = event.y;
            x += document.body.scrollLeft;
            y += document.body.scrollTop;
        }
        
        var pos = REC_GetPosition(table);
        var min_x = pos.x;
        var max_x = pos.x + table.offsetWidth;
        var min_y = pos.y;
        var max_y = pos.y + table.offsetHeight;
        if (x < min_x || x > max_x || y < min_y || y > max_y) { // Está fuera de la table - debería ocultarla...
            DOM_RemoveObjEventListener(this, document, 'click', this.documentClick);
            this.hide();
        }
    }
}

CAL_Calendar.prototype.show = function()
{
    var table = document.getElementById(this.id + '-table');
    table.style.display = 'block';
    this.dont_hide = true;
    DOM_AddObjEventListener(this, document, 'click', this.documentClick);
    if (!document.all) {
        return;
    }
    var selects = document.getElementsByTagName('select');
    var i;
    var pos = REC_GetPosition(table);
    var min_x = pos.x;
    var max_x = pos.x + table.offsetWidth;
    var min_y = pos.y;
    var max_y = pos.y + table.offsetHeight;
    this.hidden_elements = [];
    var x0, x1, y0, y1;
    for (i = 0; i < selects.length; i++) {
        element = selects[i];
        if (element.style.visibility == 'hidden') {
            continue;
        }
        pos = REC_GetPosition(element);
        x0 = pos.x;
        x1 = pos.x + element.offsetWidth;
        y0 = pos.y;
        y1 = pos.y + element.offsetHeight;
        if (((x0 < min_x && x1 < min_x) || (x0 > max_x && x1 > max_x)) || ((y0 < min_y && y1 < min_y) || (y0 > max_y && y1 > max_y))) {
            continue; // Exceptuamos los elementos que no se toquen con éste
        }
        this.hidden_elements.push(element);
        element.style.visibility = 'hidden';
    }
}

CAL_Calendar.prototype.activate = function()
{
    if (document.getElementById(this.id + '-table').style.display=='block') { // ocultar
        this.hide();
    } else { // mostrar
        this.show();
    }
}

CAL_Calendar.prototype.updateDate = function()
{
    var text, day, month, year, date;
    
    date = this.hidden_element.value;
    
    if (date != '0000-00-00') {
        year = Number(date.substring(0, 4));
        month = Number(date.substring(5, 7)) - 1;
        month = CAL_ShortMonthNames[month];
        month = month.substr(0,1).toUpperCase() + month.substr(1);
        day=Number(date.substring(8, 10));
        if (day.toString().length == 1) {
            day = '0' + day;
        }
        text = day + '/' + month + '/' + year;
    } else {
        text = '';
    }
    
    this.element.value = text;
}

CAL_Calendar.prototype.selectDay = function(day, position)
{
    var month, year, date;
    if (position) {
        day = position - this.week_day;
    }
    
    date = this.getDateString(this.date.getFullYear(), this.date.getMonth() + 1, day);
    cell = document.getElementById(this.id + '_' + (day + this.week_day - 1));
    
    if (this.hidden_element.value == date) { // If it was already added we remove it
        this.untag(this.selected_element);
        this.hidden_element.value = '0000-00-00';
        this.selected_element = false;
    } else {
        if (this.selected_element != false) {
            this.untag(this.selected_element);
        }
        this.hidden_element.value = date;
        this.selected_element = cell;
        this.tag(cell);
    }
    this.updateDate();
    if (position) { // Cuando el usuario selecciona algo (a diferencia de cuando se selecciona solo) se selecciona por position por lo tanto hay que llamar a on_change
        this.hide();
        this.runOnChange();
    }
}

CAL_Calendar.prototype.tag = function(element)
{
    element.className = VAR_RemoveWord(element.className, 'over');
    element.className = VAR_AddWord(element.className, 'selected');
}

CAL_Calendar.prototype.untag = function(element)
{
    element.className = VAR_RemoveWord(element.className, 'selected');
}

// It receives a date object (or a year, a month and a day) and returns a 'YYYY-MM-DD' formatted string
CAL_Calendar.prototype.getDateString = function(date_or_year, month, day)
{
    if (typeof date_or_year == 'object') {
        month = date_or_year.getMonth() + 1;
        day = date_or_year.getDate();
        year = date_or_year.getFullYear();
    } else {
        year = date_or_year;
    }
    
    month = month.toString();
    
    if (month.length == 1) {
        month = '0' + month;
    }
    
    day = day.toString();
    if (day.length == 1) {
        day ='0' + day;
    }
    
    return year + '-' + month + '-' + day;
}

CAL_Calendar.prototype.build = function()
{
    var x, day, days_in_month;
    
    var today = this.getDateString(new Date());
    
    this.week_day = (new Date(this.date.getFullYear(), this.date.getMonth(), 1)).getDay();
    
    this.selected_element = false;
    
    days_in_month = (new Date(this.date.getYear(), this.date.getMonth() + 1, 0)).getDate();
    
    DOM_ReplaceText(document.getElementById(this.id + '_titulo'), CAL_MonthNames[this.date.getMonth()] + ' ' + this.date.getFullYear());
    
    for (x = 0; x < this.week_day; x++) {
        REC_Hide(document.getElementById(this.id + '_' + x));
    }
    for (x = this.week_day + days_in_month; x < 37; x++) {
        REC_Hide(document.getElementById(this.id + '_' + x));
    }
    day = 1;
    x = this.week_day;
    while (day <= days_in_month) {
        id = this.id + '_' + x;
        element = document.getElementById(id);
        REC_Show(element);
        DOM_ReplaceText(element, day);
        fecha = this.getDateString(this.date.getFullYear(), this.date.getMonth() + 1, day);
        if (fecha == today) {
            element.className = 'current_day';
        } else {
            element.className = '';
        }
        if (this.hidden_element.value == fecha) {
            this.tag(element);
            this.selected_element = element;
        } else {
            this.untag(element);
        }
        day++;
        x++;
    }
    this.updateDate();
}

CAL_Calendar.prototype.create = function()
{
    document.write("<span class=\"calendar\">");
    document.write("    <input type=\"text\" class=\"form_general\" id=\"" + this.id + "\" size=\"11\"/>");
    document.write("    <img src=\"" + this.images_path + "/button/calendar.gif\" id=\"" + this.id + "-activate\" alt=\"Calendario\"/>");
    document.write("    <input type=\"hidden\" name=\"" + this.id + "\" id=\"" + this.id + "-hidden\" value=\"" + VAR_HtmlSpecialChars(this.data) +  "\"/>");
    document.write("</span>");
    document.write("<div id=\"" + this.id + "-table\" class=\"calendar_window\" style=\"display: none;\">");
    document.write("  <div class=\"month\">");
    document.write("    <a href=\"javascript:void(null)\" id=\"" + this.id + "_anterior\" style=\"float: left; visibility: visible;\"><img src=\"" + this.images_path + "/button/previous_small.gif\" alt=\"&lt;\" title=\"Mes anterior\"></a>");
    document.write("    <a href=\"javascript:void(null)\" id=\"" + this.id + "_siguiente\"style=\"float: right\"><img src=\"" + this.images_path + "/button/next_small.gif\" alt=\"&gt;\" title=\"Próximo mes\"></a>");
    document.write("    <span id=\"" + this.id + "_titulo\" style=\"text-transform: uppercase\"></span>");
    document.write("  </div>");
    document.write("  <table class=\"week\">");
    document.write("    <thead>");
    document.write("      <tr>");
    document.write("        <th><abbr title=\"domingo\">dom</abbr></th>");
    document.write("        <th><abbr title=\"lunes\">lun</abbr></th>");
    document.write("        <th><abbr title=\"martes\">mar</abbr></th>");
    document.write("        <th><abbr title=\"miércoles\">mié</abbr></th>");
    document.write("        <th><abbr title=\"jueves\">jue</abbr></th>");
    document.write("        <th><abbr title=\"viernes\">vie</abbr></th>");
    document.write("        <th><abbr title=\"sábado\">sáb</abbr></th>");
    document.write("      </tr>");
    document.write("    </thead>");
    document.write("    <tbody>");
    document.write("      <tr>");
    document.write("        <td id=\"" + this.id + "_0\">1</td>");
    document.write("        <td id=\"" + this.id + "_1\">2</td>");
    document.write("        <td id=\"" + this.id + "_2\">3</td>");
    document.write("        <td id=\"" + this.id + "_3\">4</td>");
    document.write("        <td id=\"" + this.id + "_4\">5</td>");
    document.write("        <td id=\"" + this.id + "_5\">6</td>");
    document.write("        <td id=\"" + this.id + "_6\">7</td>");
    document.write("      </tr>");
    document.write("      <tr>");
    document.write("        <td id=\"" + this.id + "_7\">8</td>");
    document.write("        <td id=\"" + this.id + "_8\">9</td>");
    document.write("        <td id=\"" + this.id + "_9\">10</td>");
    document.write("        <td id=\"" + this.id + "_10\">11</td>");
    document.write("        <td id=\"" + this.id + "_11\">12</td>");
    document.write("        <td id=\"" + this.id + "_12\">13</td>");
    document.write("        <td id=\"" + this.id + "_13\">14</td>");
    document.write("      </tr>");
    document.write("      <tr>");
    document.write("        <td id=\"" + this.id + "_14\">15</td>");
    document.write("        <td id=\"" + this.id + "_15\">16</td>");
    document.write("        <td id=\"" + this.id + "_16\">17</td>");
    document.write("        <td id=\"" + this.id + "_17\">18</td>");
    document.write("        <td id=\"" + this.id + "_18\">19</td>");
    document.write("        <td id=\"" + this.id + "_19\">20</td>");
    document.write("        <td id=\"" + this.id + "_20\">21</td>");
    document.write("      </tr>");
    document.write("      <tr>");
    document.write("        <td id=\"" + this.id + "_21\">22</td>");
    document.write("        <td id=\"" + this.id + "_22\">23</td>");
    document.write("        <td id=\"" + this.id + "_23\">24</td>");
    document.write("        <td id=\"" + this.id + "_24\">25</td>");
    document.write("        <td id=\"" + this.id + "_25\">26</td>");
    document.write("        <td id=\"" + this.id + "_26\">27</td>");
    document.write("        <td id=\"" + this.id + "_27\">28</td>");
    document.write("      </tr>");
    document.write("      <tr>");
    document.write("        <td id=\"" + this.id + "_28\">29</td>");
    document.write("        <td id=\"" + this.id + "_29\">26</td>");
    document.write("        <td id=\"" + this.id + "_30\">27</td>");
    document.write("        <td id=\"" + this.id + "_31\">28</td>");
    document.write("        <td id=\"" + this.id + "_32\">29</td>");
    document.write("        <td id=\"" + this.id + "_33\">30</td>");
    document.write("        <td id=\"" + this.id + "_34\">31</td>");
    document.write("      </tr>");
    document.write("      <tr>");
    document.write("        <td id=\"" + this.id + "_35\">30</td>");
    document.write("        <td id=\"" + this.id + "_36\">31</td>");
    document.write("      </tr>");
    document.write("    </tbody>");
    document.write("  </table>");
    document.write("</div>");
    
    var i, ee;
    for (i = 0; i <= 36; i++) {
        ee = document.getElementById(this.id + '_' + i);
        ee.onclick = function(obj, i) { return function() { obj.selectDay(false, i + 1) } }(this, i);
        ee.onmouseover = function(obj, element) { return function() { obj.mouseOverDay(element) } }(this, ee);
        ee.onmouseout = function(obj, element) { return function() { obj.mouseOutDay(element) } }(this, ee);
        ee.style.visibility = 'hidden';
    }
    this.element = document.getElementById(this.id);
    
    this.hidden_element = document.getElementById(this.id + '-hidden');
    ee = this.element;
    ee.onchange = function(obj) { return function() { obj.changeDateByText() } }(this);
    ee.onkeypress = function(obj) { return function(e) { if (!e) { e = window.event } if (e.keyCode == 13) { obj.changeDateByText(); return false} } }(this);
    ee = document.getElementById(this.id + "-activate");
    ee.onclick = function(obj) { return function() { obj.activate() } }(this);
    ee = document.getElementById(this.id + '_anterior');
    ee.onclick = function(obj) { return function() { obj.prevMonth() } }(this);
    ee = document.getElementById(this.id + '_siguiente');
    ee.onclick = function(obj) { return function() { obj.nextMonth() } }(this);
}
