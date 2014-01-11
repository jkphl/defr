(function(auto, defaultSelector, win, doc){
    'use strict';
    var comma					= ',',
	data						= 'data-',
	createElement				= 'createElement',
	appendChild					= 'appendChild',
	getAttribute				= 'getAttribute',
	setAttribute				= 'setAttribute',
	removeAttribute				= 'removeAttribute',
	indexOf						= 'indexOf',
    headElementName				= 'head',
	linkElementName				= 'link',
	scriptElementName			= 'script',
	styleElementName			= 'style',
	stylesheetRel				= styleElementName + 'sheet',
	javascriptMime				= 'text/java' + scriptElementName,
	onloadName					= 'onload',
	readyStateName				= 'readyState',
	onReadyStateChangeName		= 'onreadystatechange',
	lengthName					= 'length',
	nameName					= 'name',
	localNameName				= 'localName',
	itemprop					= 'itemprop',
	querySelectorAll			= 'querySelectorAll',
	globalAttributes			= ',accesskey,class,contenteditable,dir,draggable,dropzone,hidden,id,lang,spellcheck,style,tabindex,title,translate,',
	scriptAttributes			= globalAttributes + data + 'crossorigin,' + data + 'charset,onerror,' + onloadName + comma,
	defrLoaded					= '__d',
	emptyFunction				= function(){},
	head						= doc.head || doc.getElementsByTagName(headElementName)[0];

    
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
    	if (script[onloadName]) {
            script[onloadName]					=
            script[onReadyStateChangeName]		= wrapOnloadCallback((typeof script[onloadName] == 'function') ? script[onloadName] : new Function('', script[onloadName]));
        }
        return script;
    }
    
    /**
     * Defer the loading of a JavaScript
     * 
     * @return {void}
     */
    function defrScript(link, tmp) {
        for (var attribute = 0, attributes = link.attributes, attributeName, attributeType, script = doc[createElement](scriptElementName); attribute < attributes[lengthName]; ++ attribute) {
            attributeName		= attributes[attribute][nameName].toLowerCase();
            if (attributeType = (scriptAttributes[indexOf](comma + attributeName + comma) >= 0) + (attributeName[indexOf](data) === 0)) {
                script[setAttribute](attributeName.substr([0, 5][attributeType - 1]), link[getAttribute](attributeName)); 
            }
        }
        script.type				= javascriptMime;
        script.defer			= true;
        load(expandScriptOnload(script), tmp, true);
    };
    
	/**
     * Load the resource by simply appending it to the <head> of the document
     * 
     * @param {Element} element				Element
     * @param {String} tmp					Temporary resource attribute name
     * @return {void}
     */
	function load(element, tmp) {
		(element[onloadName] || emptyFunction).call(head[appendChild](revertSubstitute(element, tmp)));
	}

	/**
     * Revert the temporary href attribute
     * 
     * @param {Element} element				Element
     * @param {String} tmp					Temporary resource attribute name
     * @return {Element}					Reverted element
     */
    function revertSubstitute(element, tmp) {
    	if (element.hasAttribute(tmp)) {
	    	element[(element[localNameName] == linkElementName) ? 'href' : 'src'] = element[getAttribute](tmp);
	    	element[removeAttribute](tmp);
    	}
    	return element;
    }

	/**
     * Trigger deferred loading of external CSS and JavaScript resources
     * 
     * @param {String} selector			Selector expression for querySelectorAll
     * @return {void}
     */
    win.defr = function(selector) {
    	
    	/**
    	 * Due to Internet Explorer's "speculative downloads" the href attribute
    	 * of the <link> elements need to be masked / substituted prior to parsing,
    	 * as IE would immediately start downloading the resources (even if they
    	 * are not part of the DOM yet). The same would apply to <script> elements
    	 * with a src attribute (at least in older IE versions), but at this stage
    	 * there are only <link> elements. 
    	 */
        for (var defr = 0, defrs = doc[querySelectorAll](selector || defaultSelector), tmp = data + (+new Date()), parser = doc[createElement](headElementName); defr < defrs[lengthName]; parser.innerHTML += (defrs[defr].textContent || defrs[defr].innerText).replace(/\s+href\=/g, ' ' + tmp + '='), ++defr) {}
        
        // As opposed to stylesheets, scripts need to be rewritten / traversed 
        for (var asset = 0, assets = parser[querySelectorAll](linkElementName + '[rel=' + stylesheetRel + '], ' + linkElementName + '[type="' + javascriptMime + '"]'), assetElement; asset < assets[lengthName]; ++asset) {
        	[defrScript, load][1 * (assets[asset].rel == stylesheetRel)](assets[asset], tmp);
        }
    }
    
    // Automatically trigger deferred loading now! 
    if (auto) {
    	win.defr();
    }
    
})(false, 'noscript[itemtype="http://defr.jkphl.is/assets"],noscript.defr', window, document);