// MTH: Mathematical functions
// -----------------------------------------------
// Version 2
//
// Requires VAR variable functions

// PUBLIC: string MTH_Format
// Formats a number
function MTH_Format(number, decimals, decimal_separator, thousands_separator, show_trailing_zeros)
{
    if (VAR_IsUndefined(decimals)) {
        decimals = 0;
    }
    if (VAR_IsUndefined(decimal_separator)) {
        decimal_separator = '.';
    }
    if (VAR_IsUndefined(thousands_separator)) {
        thousands_separator = '';
    }
    if (VAR_IsUndefined(show_trailing_zeros)) {
        show_trailing_zeros = false;
    }
    // Here we round the number, taking the decimals in account
    var power = Math.pow(10, decimals);
    var temp_number = Math.round(number * power).toString();
    var fraction_part = (temp_number % power).toString();
    // Must we fill the fraction part of the number with zeros?
    if (show_trailing_zeros) {
        while (fraction_part.length < decimals) {
            fraction_part = fraction_part + '0';
        }
    }
    var integer_part = (Math.floor(temp_number / power)).toString();
    // If there is a thousands separator (as, for example, ',', we add it in its places)
    if (thousands_separator) {
        var digits = integer_part.length;
        var thousands = Math.floor((digits - 1) / 3);
        if (thousands > 0) {
            var temp = '';
            var part = '';
            for (var i = 1; i <= thousands; i++) {
                part = integer_part.substr(digits - i * 3, 3);
                if (i > 1) {
                    temp = part + thousands_separator + temp;
                } else {
                    temp = part;
                }
            }
            var leading_digits = digits % 3;
            if (leading_digits == 0) {
                leading_digits = 3;
            }
            integer_part = integer_part.substr(0, leading_digits) + thousands_separator + temp;
        }
    }
    if (fraction_part != '0') {
        return integer_part + decimal_separator + fraction_part;
    } else {
        return integer_part;
    }
}