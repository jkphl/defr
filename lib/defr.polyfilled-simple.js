(function(win, doc, auto, defaultAssetsClassName){
    'use strict';
    var scriptElementName		= 'script',
    noscriptElementName			= 'no' + scriptElementName,
    headElementName				= 'head',
    linkElementName				= 'link',
    styleElementName			= 'style',
    onloadHandlerName			= 'onload',
    
    attributesListName			= 'attributes',
    lengthPropertyName			= 'length',
    namePropertyName			= 'name',
    prototypePropertyName		= 'prototype',
    readyStateName				= 'readyState',
	onReadyStateChangeName		= 'onreadystatechange',
    
    createElement				= 'createElement',
	appendChild					= 'appendChild',
	getAttribute				= 'getAttribute',
	setAttribute				= 'setAttribute',
	removeAttribute				= 'removeAttribute',
	hasAttribute				= 'hasAttribute',
	indexOf						= 'indexOf',
	
	comma						= ',',
	defrLoaded					= '__d',
	defaultAssetsClassName		= 'defr',
	data						= 'data-',
    stylesheetRelValue			= styleElementName + 'sheet',
    globalAttributes			= ',accesskey,class,contenteditable,dir,draggable,dropzone,hidden,id,lang,spellcheck,style,tabindex,title,translate,',
	scriptAttributes			= globalAttributes + data + 'crossorigin,' + data + 'charset,type,onerror,' + onloadHandlerName + comma,
	javascriptMime				= 'text/java' + scriptElementName,
    
    headElement					= doc[headElementName] || doc.getElementsByTagName(headElementName)[0],
    emptyFunction				= function(){},
    localStorageSupport			= false;
    
    /**
     * Asset class
     * 
     * @param {Element} element		Original DOM element
     * @param {String} substAtt		Substituted attribute name
     * @return {asset}				Self reference 
     */
    var asset					= function(element, substAtt) {
    	var me					= this;
    	me.s					= substAtt;
    	
    	// If it's a stylesheet element: No modification necessary
    	if (element[getAttribute]('rel') == stylesheetRelValue) {
    		me.e				= element;
    		me.r				= 'href'
    		me.j				= 0;
    		
    	// Else: Traverse to a script element
    	} else {
    		me.e				= doc[createElement](scriptElementName)
    		for (var attribute = 0, attributes = element[attributesListName], attributeName, attributeType; attribute < attributes[lengthPropertyName]; ++attribute) {
	            attributeName	= attributes[attribute][namePropertyName].toLowerCase();
	            if (attributeType = (scriptAttributes[indexOf](comma + attributeName + comma) >= 0) + (attributeName[indexOf](data) === 0)) {
	                me.e[setAttribute](attributeName.substr(5 * [attributeType - 1]), element[getAttribute](attributeName)); 
	            }
	        }
	        me.e.type			= javascriptMime;
	        me.e.defer			= true;
	        me.e.async			= false;
	        me.r				= 'src';
	        me.j				= 1;
    	}
    	
    	/**
		 * Construct a cross browser onload callback for stylesheets and scripts
		 * 
		 * @param {Function}					Original callback
		 * @param {Function}					Wrapped cross browser callback
		 */
    	me.olc					= function(callback) {
	        return function(evt) {
	        	if (!me[defrLoaded] && (!me[readyStateName] || (me[readyStateName] in {"complete": 1, "loaded": 1}))) {
	        		me[defrLoaded]					= true;
	        		callback(evt);
	        		me[onloadHandlerName]			=
	        		me[onReadyStateChangeName]		= null;
	        	}
	        }
	    }
	    
	    /**
	     * Arm a prepared asset object
	     * 
	     * Basically the subsituted resource attribute gets reverted here and
	     * the onload handler (if available) gets wrapped for cross browser compatibilty.
	     * 
	     * @param {dontSubstitute}		Don't try the attribute substitution
	     * @return {asset}				Self reference
	     */
	    me.arm = function(dontSubstitute) {
	    	var onload								= me.e[getAttribute](onloadHandlerName) || '';
	    	if (!dontSubstitute && me.s) {
	    		me.e[me.r] = me.e[getAttribute](me.s);
		    	me.e[removeAttribute](me.s);
	    	}
	    	me.e[onloadHandlerName]					= onload[lengthPropertyName] ? me.olc(new Function('', onload)) : emptyFunction;
	    	me.arm									= emptyFunction;
	    	return me;
	    }
    }
    
    /**
     * Load the asset by appending it to the document head
     * 
     * @return {void}
     */
    asset[prototypePropertyName].load = function() {
    	var me					= this;
    	
    	// If it's a stylesheet and we are in Internet Explorer
    	if (!me.arm(localStorageSupport).j && (createStyleSheet in doc)) {
    		if (localStorageSupport) {
    			var stylesheet		= doc[createStyleSheet]();
    			stylesheet.cssText	= me.e.innerText || me.e.text;
    		} else {
    			doc[createStyleSheet](me.e[getAttribute]('href') || me.e.href);
    		}
    		
    	// Else
    	} else {
    		headElement[appendChild](me.e);
    	}
    	
    	// Call the onload handler
    	me.e[onloadHandlerName]();
    }
    
	var querySelectorAll		= 'querySelectorAll',
	createStyleSheet			= 'createStyleSheet',
	appVersion					= navigator.appVersion,
	ieVersion					= (appVersion[indexOf]('MSIE') > -1) ? parseFloat(appVersion.split('MSIE')[1], 10) : 99,
	ieSuppressQuerySelectorAll	= (ieVersion == 8),
	ieCommentStyle				= (ieVersion == 7) || (ieVersion == 8);
	
	/**
	 * Find and extract the deferred assets in the document
	 * 
	 * This extraction method works with all modern browsers supporting the document.querySelectorAll()
	 * method. Am empty array will be returned to all browsers with no support. Internet Explorer 8 has
	 * only limited support for querySelectorAll(). Please use the polyfilled library if you intend to
	 * support IE8.
	 * 
	 * This method has successfully been tested with:
	 * 
	 * - Chrome 31
	 * - Firefox 25
	 * - Firefox 26
	 * - Opera 12.16
	 * - Internet Explorer 6
	 * - Internet Explorer 7
	 * - Internet Explorer 8
	 * - Internet Explorer 11
	 * - Safari 5.1.8
	 * - Safari 5.1.10
	 * 
	 * @param {String} assetsClassName		Assets container class name
	 * @return {Array}						Extracted assets
	 */
	function createAssets(assetsClassName) {
		
		// If it's an Internet Explorer <= 9
    	if (ieVersion <= 9) {
    		
    		/**
    		 * IE 7 and IE 8 don't make the contents of noscript elements accessible by Javascript,
    		 * but they do understand the proprietars <comment> attributes. With the help of
    		 * conditional comments, one can wrap the <noscript> elements with such an <comment>
    		 * element for only these browsers, so the content can be retrieved. 
    		 */
    		var assetsElementName	= ieCommentStyle ? 'comment' : noscriptElementName,
    		
    		/**
    		 * Several IE versions don't accept a <head> element for parsing the <noscript> content, 
    		 * so a <div> must be used instead. Also, directly parsing the <link> elements results in
    		 * a weird element nesting, so we replace the <link> with <hr> elements, which don't get
    		 * nested for some reasons. Finally, we have to use .innerHTML instead of .innerText to
    		 * get the <noscript> contents in IE < 9. 
			 */
    		parserElementName		= 'div',
    		assetElementName		= 'hr',
    		
    		/**
    		 * Extract the HTML source code out of the <noscript> respectively <comment> element in Internet Explorer
    		 * 
    		 * @param {Element}				DOM Element
    		 * @return {String}				HTML content
    		 */
    		parseFunction			= function(element) {
    			var defrHtml		= (element.innerText || element.innerHTML).replace(/\<link /g, '<hr '),
    			firstLink			= defrHtml[indexOf]('<hr ');
    			return (ieCommentStyle && (firstLink >= 0)) ? defrHtml.substring(firstLink, defrHtml.toLowerCase()[indexOf]('</noscript')) : defrHtml;
			},
			
			contentFunction			= ieSuppressQuerySelectorAll ? function(obj) { this.e.text = obj.v; } : null;
//			alert(selectElements(assetsElementName, {className: assetsClassName}, doc).length);
			
    	// Else: Standard browsers
    	} else {
    		var assetsElementName	= noscriptElementName,
    		parserElementName		= headElementName,
    		assetElementName		= linkElementName,
    		
    		/**
    		 * Extract the HTML source code out of the <noscript> element
    		 * 
    		 * @param {Element}				DOM Element
    		 * @return {String}				HTML content
    		 */
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
        for (var defr = 0, defrs = selectElements(assetsElementName, {className: assetsClassName}, doc), tmp = data + (+new Date()), parser = doc[createElement](parserElementName); defr < defrs[lengthPropertyName]; ++defr) {
        	parser.innerHTML		+= parseFunction(defrs[defr]).replace(/\s+href\=/gi, ' ' + tmp + '=');
        }
        
        // As opposed to stylesheets, scripts need to be rewritten / traversed 
        for (var assetIndex = 0, assets = selectElements(assetElementName, {rel: stylesheetRelValue, itemprop: scriptElementName}, parser), assetElement, assetObject, assetObjects = []; assetIndex < assets[lengthPropertyName]; ++assetIndex) {
        	assetObject				= new asset(assets[assetIndex], tmp);
        	assetObject.cnt			= contentFunction;
        	assetObjects.push(assetObject);
        }
        
        return assetObjects;
	}
	
	/**
     * Select descendant elements matching specific criteria (querySelectorAll polyfill)
     * 
     * @param {String} elementName					Tag name of elements to match
     * @param {Object} elementFilter				Attribute filters (will be "OR" concatenated)
     * @param {Element} baseElement					Base element for the selection
     * @return {Array}								Matched elements 
     */
    function selectElements(elementName, elementFilter, baseElement) {
    	var elements			= [],
    	filter;
    	
    	// If querySelectorAll() can be used ...
    	if (!ieSuppressQuerySelectorAll && (querySelectorAll in doc)) {
    		var selector		= [];
    		for (filter in elementFilter) {
    			selector.push(elementName + ((filter == 'className') ? ('.' + elementFilter[filter]) : ('[' + filter + '="' + elementFilter[filter] + '"]')));
    		}
    		elements 			= baseElement.querySelectorAll(selector.join(','));
    		
    	// Else: Polyfill using getElementsByTagName()
    	} else {
    		elementLoop: for (var elementIndex = 0, matches = baseElement.getElementsByTagName(elementName), element; elementIndex < matches[lengthPropertyName]; ++elementIndex) {
	    		element			= matches[elementIndex];
	    		for (filter in elementFilter) {
	    			if ((filter in element) && (element[filter] == elementFilter[filter])) {
//	    			if (element[getAttribute](filter) === elementFilter[filter]) {
	    				elements.push(element);
	    				continue elementLoop;
	    			}
	    		}
	    	}
    	}
    	return elements;
    }
    
	/**
	 * Main method for loading deferred assets
	 * 
	 * @return {void}
	 */
    win.defr			= function(assetClassName) {
    	for (var asset = 0, assets = createAssets(assetClassName || defaultAssetsClassName); asset < assets.length; ++asset) {
    		assets[asset].load();
    	}
    }
    
    // Automatically trigger deferred loading now! 
    if (auto) {
    	win.defr();
    }
    
})(window, document, false);