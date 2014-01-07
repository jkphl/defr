(function(auto, defaultSelector, win, doc){
    'use strict';
    var head = doc.head || doc.getElementsByTagName(headElementName)[0],
	comma					= ',',
	data					= 'data-',
	createElement			= 'createElement',
	indexOf					= 'indexOf',
    headElementName			= 'head',
	linkElementName			= 'link',
	scriptElementName		= 'script',
	styleElementName		= 'style',
	stylesheetRel			= styleElementName + 'sheet',
	javascriptMime			= 'text/java' + scriptElementName,
	onloadName				= 'onload',
	readyStateName			= 'readyState',
	onReadyStateChangeName	= 'onreadystatechange',
	lengthName				= 'length',
	nameName				= 'name',
	globalAttributes		= ',accesskey,class,contenteditable,dir,draggable,dropzone,hidden,id,lang,spellcheck,style,tabindex,title,translate,',
	scriptAttributes		= globalAttributes + data + 'crossorigin,' + data + 'charset,onerror,' + onloadName + comma,
	defrLoaded				= '__d';
    
	function load(element) {
	    head.appendChild(element);
	}
    
	/**
	 * Construct a cross browser onload callback for stylesheets and scripts
	 * 
	 * @param {Function}					Original callback
	 * @param {Function}					Wrapped cross browser callback
	 */
    function wrapOnloadCallback(callback) {
        return function() {
        	if (!this[defrLoaded] && (!this[readyStateName] || (this[readyStateName] in {"complete": 1, "loaded": 1}))) {
        		this[defrLoaded]					= true;
        		callback();
        		this[onloadName]					=
        		this[onReadyStateChangeName]		= null;
        	}
        }
    }
    
    /**
     * Expand the onload event of a JavaScript to also support IE
     * 
     * @param {Element}						<script> element
     * @return {Element}					<script> element (for chaining)
     */
    function expandScriptOnload(script) {
    	if (typeof script[onloadName] == 'function') {
            script[onloadName]					=
            script[onReadyStateChangeName]		= wrapOnloadCallback(script[onloadName]);
        }
        return script;
    }
    
    /**
     * Defer the loading of a JavaScript
     * 
     * @return {void}
     */
    function defrScript(link) {
        var script              = doc[createElement](scriptElementName);
        for (var attribute = 0, attributes = link.attributes, attributeName; attribute < attributes[lengthName]; ++ attribute) {
            var attributeName	= attributes[attribute][nameName].toLowerCase(),
            copyAttribute		= scriptAttributes[indexOf](comma + attributeName + comma) >= 0,
            eventAttribute		= attributeName[indexOf]('on') === 0,
            isDataAttribute		= attributeName[indexOf](data) === 0;
            if (copyAttribute || eventAttribute || isDataAttribute) {
                script.setAttribute(attributeName.substr((isDataAttribute && copyAttribute) * 5), link.getAttribute(attributeName)); 
            }
        }
        script.type							= javascriptMime;
        script.defer						= true;
        script.src							= link.href;
        load(expandScriptOnload(script), true);
    };
    
    /**
     * Trigger deferred loading of external CSS and JavaScript resources
     * 
     * @return {void}
     */
    win.defr = function(selector) {
        for (var defr = 0, defrs = doc.querySelectorAll(selector || defaultSelector), parser, assets = []; defr < defrs[lengthName]; ++defr) {
            parser              = doc[createElement](headElementName);
            parser.innerHTML    = defrs[defr].textContent || defrs[defr].innerText;
            for (var asset = 0, assets = parser.querySelectorAll(linkElementName + '[rel=' + stylesheetRel + '], ' + linkElementName + '[type="' + javascriptMime + '"]'), assetElement; asset < assets[lengthName]; ++asset) {
            	assetElement	= assets[asset];
            	if (assetElement.rel == stylesheetRel) {
            		assetElement.removeAttribute('itemprop');
       				load(assetElement);
            	} else {
            		defrScript(assetElement);
            	}
            }
        }
    }
    
    // Automatically trigger deferred loading now! 
    if (auto) {
    	win.defr();
    }
    
})(false, 'noscript[itemtype="http://defr.jkphl.is/assets"],noscript.defr', window, document);