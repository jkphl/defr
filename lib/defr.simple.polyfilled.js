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
    
    var hasAttribute			= 'hasAttribute',
    createStyleSheet			= 'createStyleSheet';
    
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
    	if (verifyAttribute(element, tmp)) {
	    	element[(element[localNameName] == linkElementName) ? 'href' : 'src'] = element[getAttribute](tmp);
	    	element[removeAttribute](tmp);
    	}
    	return element;
    }
    
    /**
     * hasAttribute() polyfill
     * 
     * @param {Element} element				Element
     * @param {String} attribute			Attribute name
     * @return {Boolean}					Attribute is present
     */
    function verifyAttribute(element, attribute) {
    	if (hasAttribute in element) {
    		return element[hasAttribute](attribute);
    	} else {
    		var attributeNode	= element.getAttributeNode(attribute);
    		return attributeNode && (attributeNode.specified || attributeNode.nodeValue);
    	}
    }
	
	/**
     * querySelectorAll polyfill
     * 
     * @param {String} elementName					Tag name of elements to match
     * @param {Object} elementFilter				Attribute filters ("OR" evaluation)
     * @param {Element} baseElement					Optional: base element for 
     * @param {Boolean} suppressQuerySelectorAll	Suppress querySelectorAll() in any case
     * @return {Array}								Matched elements 
     */
    function selectElements(elementName, elementFilter, baseElement, suppressQuerySelectorAll) {
    	var elements			= [],
    	filter;
    	if (!suppressQuerySelectorAll && (querySelectorAll in doc)) {
    		var selector		= [];
    		for (filter in elementFilter) {
    			selector.push(elementName + ((filter == 'className') ? ('.' + elementFilter[filter]) : ('[' + filter + '="' + elementFilter[filter] + '"]')));
    		}
    		elements 			= baseElement.querySelectorAll(selector.join(','));
    	} else {
    		elementLoop: for (var elementIndex = 0, matches = baseElement.getElementsByTagName(elementName), element; elementIndex < matches.length; ++elementIndex) {
	    		element = matches[elementIndex];
	    		for (filter in elementFilter) {
	    			if ((filter in element) && (element[filter] == elementFilter[filter])) {
	    				elements.push(element);
	    				continue elementLoop;
	    			}
	    		}
	    	}
    	}
    	return elements;
    }
    
	/**
     * Trigger deferred loading of external CSS and JavaScript resources
     * 
     * @param {Object} selector				Element filters
     * @return {void}
     */
    win.defr = function(selector) {
    	var appVersion				= navigator.appVersion,
    	ieVersion					= (appVersion[indexOf]('MSIE') > -1) ? parseFloat(appVersion.split('MSIE')[1], 10) : 99,
    	suppressQuerySelectorAll	= ieVersion == 8;
    	
    	/**
    	 * IE6 doesn't accept using a <head> element for parsing the <noscript>
    	 * contents (so a <div> must be used) and we have to get the <noscript>
    	 * contents via .innerHTML instead of .innerText. 
    	 */
    	if (ieVersion <= 9) {
    		var commentStyle		= (ieVersion == 7) || (ieVersion == 8),
    		assetsElementName		= commentStyle ? 'comment' : 'noscript',
    		parserElementName		= 'div',
    		assetElementName		= 'hr',
    		loadFunction			= (createStyleSheet in doc) ? function(element, tmp) { doc[createStyleSheet](element[getAttribute](tmp)); } : load,
    		parseFunction			= function(element) {
    			var defrHtml		= (element.innerText || element.innerHTML).replace(/\<link /g, '<hr '),
    			firstLink			= defrHtml[indexOf]('<hr ');
    			return (commentStyle && (firstLink >= 0)) ? defrHtml.substring(firstLink, defrHtml.toLowerCase()[indexOf]('</noscript')) : defrHtml;
			};
//			alert(selectElements(assetsElementName, selector || defaultSelector).length);
			
    	// Else: Standard browsers
    	} else {
    		var assetsElementName	= 'noscript',
    		parserElementName		= headElementName,
    		assetElementName		= linkElementName,
    		loadFunction			= load,
    		parseFunction			= function(element) { return element.textContent || element.innerText };
    	}
    	
    	/**
    	 * Due to Internet Explorer's "speculative downloads" the href attribute
    	 * of the <link> elements need to be masked / substituted prior to parsing,
    	 * as IE would immediately start downloading the resources (even if they
    	 * are not part of the DOM yet). The same would apply to <script> elements
    	 * with a src attribute (at least in older IE versions), but at this stage
    	 * there are only <link> elements. 
    	 */
        for (var defr = 0, defrs = selectElements(assetsElementName, selector || defaultSelector, doc, suppressQuerySelectorAll), tmp = data + (+new Date()), parser = doc[createElement](parserElementName); defr < defrs[lengthName]; ++defr) {
        	parser.innerHTML		+= parseFunction(defrs[defr]).replace(/\s+href\=/gi, ' ' + tmp + '=');
        }
        
        // As opposed to stylesheets, scripts need to be rewritten / traversed 
        for (var asset = 0, assets = selectElements(assetElementName, {rel: stylesheetRel, type: javascriptMime}, parser, suppressQuerySelectorAll), assetElement; asset < assets[lengthName]; ++asset) {
        	[defrScript, loadFunction][1 * (assets[asset][getAttribute]('rel') == stylesheetRel)](assets[asset], tmp);
        }
    }
    
    // Automatically trigger deferred loading now! 
    if (auto) {
    	win.defr();
    }
    
})(false, {itemtype: 'http://defr.jkphl.is/assets', className: 'defr'}, window, document);