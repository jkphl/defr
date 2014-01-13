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
		headElement[appendChild](this.arm(localStorageSupport).e)[onloadHandlerName]();
    }
    
	var querySelectorAll		= 'querySelectorAll';
	
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
	 * - Internet Explorer 11
	 * - Safari 5.1.8
	 * - Safari 5.1.10
	 * 
	 * @param {String} assetsClassName		Assets container class name
	 * @return {Array}						Extracted assets
	 */
	function createAssets(assetsClassName) {
		
		/**
		 * It would be nice to use a <head> element for parsing the <noscript> content,
		 * but unfortunately IE < 10 doesn't allow setting the innerHTML property of
		 * this element, so we're using a <div> instead.
		 * 
    	 * Due to Internet Explorer's "speculative downloads" the href attribute
    	 * of the <link> elements need to be masked / substituted prior to parsing,
    	 * as IE would immediately start downloading the resources (even if they
    	 * are not part of the DOM yet). The same would occur to <script> elements
    	 * with a src attribute (at least in older IE versions). 
    	 */
        for (var defr = 0, defrs = doc[querySelectorAll](noscriptElementName + '[itemtype="http://defr.jkphl.is/assets"],' + noscriptElementName + '.' + assetsClassName), tmp = data + (+new Date()), parser = doc[createElement]('div'); defr < defrs[lengthPropertyName]; parser.innerHTML += (defrs[defr].textContent || defrs[defr].innerText).replace(/\s+href\=/g, ' ' + tmp + '='), ++defr) {}
        
        // As opposed to stylesheets, scripts need to be rewritten / traversed 
        for (var assetIndex = 0, assets = parser[querySelectorAll](linkElementName + '[rel=' + stylesheetRelValue + '],' + linkElementName + '[itemprop="' + scriptElementName + '"]'), assetObjects = [], assetElement; assetIndex < assets[lengthPropertyName]; ++assetIndex) {
        	assetObjects.push(new asset(assets[assetIndex], tmp));
        }
        
        return assetObjects;
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