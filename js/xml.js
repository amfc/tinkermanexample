// XML: XML functions
// Version 2

function XML_Handler(document_element)
{
    
    this.serializeToString = function()
    {
        if (this.is_not_standard) {
            return this.document.xml;
        } else {
            return new XMLSerializer().serializeToString(this.document);
        }
    }
    
    this.is_not_standard = false;
    
    try { // for standards compliant user agents, such as Mozilla or Netscape 6+
        this.document = document.implementation.createDocument("", document_element, null);
    } catch (e) {
        try { // for IE5
            this.document = new ActiveXObject("Msxml2.DOMDocument");
            this.document.documentElement = this.document.createElement(document_element);
            this.is_not_standard = true;
        } catch (ee) {
            throw "Can't create XML document";
        }
    }
    
    this.documentElement = this.document.documentElement;
    
}