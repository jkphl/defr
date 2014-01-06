(function(win, doc){
    'use strict';
    var head = doc.head || doc.getElementsByTagName('head')[0];
    
    function dataAttributes(element) {
        for (var attribute = 0, attributes = element.attributes, dataAttributes = {}; attribute < element.attributes.length; ++ attribute) {
            var attributeName       = attributes[attribute].localName;
            if (attributeName.indexOf('data-') === 0) {
                dataAttributes[attributeName.substr(5)] = element.getAttribute(attributeName); 
            }
        }
        return dataAttributes;
    };
    
    function load(element) {
        head.appendChild(element);
    };
    
    function onloadDeferred(callback) {
        var loaded          = false,
        readyState;
        return function() {
            readyState      = this.readyState;
            if (loaded || (readyState && readyState != "complete" && readyState != "loaded")) {
                return;
            }
            loaded      = true;
            callback();
        }
    }
    
    function defrStylesheet(stylesheet) {
        stylesheet.removeAttribute('itemprop');
        load(stylesheet);
    };
    
    function defrScript(link) {
        var script              = doc.createElement('script'),
        attributes              = dataAttributes(link);
        for (var attribute in attributes) {
            script.setAttribute(attribute, attributes[attribute]);
        }
        script.type             = 'text/javascript';
        script.defer            = true;
        script.src              = link.href;
        if (typeof script.onload == 'function') {
            script.onload                 =
            script.onReadyStateChange     = onloadDeferred(script.onload);
        }
        load(script);
    };
    
    win.defr = function(selector) {
        for (var defr = 0, defrs = doc.querySelectorAll(selector || 'noscript[itemtype="http://jkphl.is/deferred/asset"], noscript.defr'), parser, assets = []; defr < defrs.length; ++defr) {
            parser              = doc.createElement('div');
            parser.innerHTML    = defrs[defr].textContent || defrs[defr].innerText;
            for (var asset = 0, assets = parser.querySelectorAll('link[rel=stylesheet], link[type="text/javascript"]'); asset < assets.length; ++asset) {
                ((assets[asset].rel == 'stylesheet') ? defrStylesheet : defrScript)(assets[asset]);
            }
        }
    }
})(window, document);