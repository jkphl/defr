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
    
	var localStoragePrefix		= 'defr-',
	localStorageDefaultExpire	= 18000000,
	localNamePropertyName		= 'localName',
	styleAttributes				= globalAttributes + 'media,type,scoped,onerror,' + onloadHandlerName + comma,
	consoleSupport				= 'console';
	try {
		var localStorageAlias	= localStorage;
		localStorageAlias.setItem(localStoragePrefix, localStoragePrefix);
		localStorageAlias.removeItem(localStoragePrefix);
		localStorageSupport		= 'JSON' in win;
	} catch(e) {}

    /**
     * Load the asset by appending it to the document head
     * 
     * @return {void}
     */
    asset[prototypePropertyName].apply = function() {
		headElement[appendChild](this.arm().e)[onloadHandlerName]();
    }
	
	/**
	 * Cache a fetched asset
	 * 
	 * @param {Object} obj				Cache item properties
	 * @return {Object}					Extended cache item properties
	 */
	asset[prototypePropertyName].cache = function(obj) {
		for (var me = this, cached = false, attributeIndex = 0, attributes = me.e[attributesListName], attribute, allowedAttributes = (obj.e == styleElementName) ? styleAttributes : scriptAttributes, attributeName; attributeIndex < attributes[lengthPropertyName]; ++attributeIndex) {
			attribute					= attributes[attributeIndex];
			attributeName				= attribute[namePropertyName];
			if (allowedAttributes[indexOf](comma + attributeName + comma) >= 0) {
				obj.a[attributeName]	= attribute.value;
			}
		}
		obj.a.type						= obj.a.type || obj.t;
		obj.c							= +new Date();
		obj.x							= obj.c + (obj.x || localStorageDefaultExpire) * 1000;
		
		try {
	        cached						= addItemToLocalStorage(obj);
	        
	    } catch(e) {
	    	
	    	// If it's a quota problem
	        if (e[namePropertyName].toLowerCase()[indexOf]('quota') >= 0) {
	            var defrResourcesInLocalStorage = [];
	
	            for (var item in localStorageAlias) {
	                if (item[indexOf](localStoragePrefix) === 0 ) {
						defrResourcesInLocalStorage.push(JSON.parse(localStorageAlias[item]));
	                }
	            }
	
	            // If there are older resources that could be purged instead
	            if (defrResourcesInLocalStorage[lengthName]) {
					defrResourcesInLocalStorage.sort(function(a, b) {
						return a[cachedName] - b[cachedName];
					});
	
					do {
						localStorageAlias.removeItem(localStoragePrefix + defrResourcesInLocalStorage.shift().k);
						try {
							cached		= addItemToLocalStorage(obj);
						} catch(e) {}
					} while(defrResourcesInLocalStorage[lengthName] && !cached);
	            }
	        }
	    }
		
		return obj;
	}
	
	/**
	 * Construct the appropriate DOM element from a cache item and load it into this asset object
	 * 
	 * @param {Object} obj				Cache item
	 * @return {asset}					Self reference
	 */
	asset[prototypePropertyName].build = function(obj) {
		var me					= this;
		me.e					= doc[createElement](obj.e);
		for (var attribute in obj.a) {
			me.e[setAttribute](attribute, obj.a[attribute]);
		}
		(typeof (me.cnt) == 'function') ? me.cnt(obj) : me.e[appendChild](doc.createTextNode(obj.v));
		return me;
	}
	
	/**
     * Load the asset by appending it to the document head
     * 
     * @return {void}
     */
    asset[prototypePropertyName].load = function() {
    	var me					= this;
    	
    	// If the local storage is supported
		if (localStorageSupport) {
			try {
				var url			= me.e[getAttribute](me.s),
				obj				= {
					e			: (me.e[localNamePropertyName] == linkElementName) ? styleElementName : scriptElementName,
					s			: me.s,
					a			: {},
					u			: url,
					k			: me.e.id || url,
					x			: parseInt(me.e[getAttribute](data + 'expire') || 0, 10),
					r			: me.e[getAttribute](data + 'revision')
				},
				cached			= JSON.parse(localStorageAlias.getItem(localStoragePrefix + obj.k) || 'false');
				
				// If the element hasn't been cached before or has expired: Retrieve it via XHR
				if (!isValidCacheItem(cached, obj)) {
					
					// If available: Append the revision to the asset URL (cache busting)
					if (obj.r) {
						url		+= ((url[indexOf]('?') >= 0) ? '&' : '?') + localStoragePrefix + revisionName + '=' + obj.r;
					}
					
					// Fetch the asset via XHR
					fetchAsset(url, function(responseText, responseType) {
						obj.v	= responseText;
						obj.t	= responseType;
						me.build(me.cache(obj)).apply();
						
					// On errors: Call the error handler (if available) and load the original element (without caching)
					}, function(error) {
						(me.e.onerror || emptyFunction).call(headElement[appendChild](me.e));
					});
					
					return;
					
				// Else: Create element from cache
				} else {
					me.build(cached);
				}
			} catch(e) {
				if (win[consoleSupport] && win[consoleSupport].log) {
					win[consoleSupport].log(e);
				}
			}
		}

		// Fallback: Simply load the given element
		me.apply();
    }
    
    /**
	 * Check if a cached item is (still) valid 
	 *
	 * @param {Object} cached			Cached object
	 * @param {Object} obj				Object properties to be cached / restored
	 * @return {Boolean}				Cached object is valid
	 */
	function isValidCacheItem(cached, obj) {
		return cached && (cached.x - +new Date() > 0) && (cached.r === obj.r);
	}
	
	/**
	 * Add an item to the local storage
	 * 
	 * @param {Object} obj				Object
	 * @return {Boolean}				Object was successfully added to the local storage 
	 */
	function addItemToLocalStorage(obj) {
		try {
			localStorageAlias.setItem(localStoragePrefix + obj.k, JSON.stringify(obj));
			return true;
		} catch(e) {
			return false;
		}
	}
	
	/**
	 * Fetch a resource via XHR
	 * 
	 * @param {String} url				URL
	 * @param {Function} success		Success handler
	 * @param {Function} error			Error handler
	 */
	function fetchAsset(url, success, error) {
		var xhr = new XMLHttpRequest();
	    xhr.open('GET', url);
	    xhr[onReadyStateChangeName]		= function() {
	        if (xhr[readyStateName] == 4) {
		        if(xhr.status == 200) {
	                success(xhr.responseText, xhr.getResponseHeader('content-type'));
		        } else {
					error(new Error(xhr.statusText));
		        }
	        }
	    };
	    xhr.send();
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
	 * - Firefox 26
	 * - Opera 12.16
	 * - Internet Explorer 11
	 * 
	 * @param {String} assetsClassName		Assets container class name
	 * @return {Array}						Extracted assets
	 */
	function createAssets(assetsClassName) {
		
		/**
    	 * Due to Internet Explorer's "speculative downloads" the href attribute
    	 * of the <link> elements need to be masked / substituted prior to parsing,
    	 * as IE would immediately start downloading the resources (even if they
    	 * are not part of the DOM yet). The same would occur to <script> elements
    	 * with a src attribute (at least in older IE versions). 
    	 */
        for (var defr = 0, defrs = doc[querySelectorAll](noscriptElementName + '[itemtype="http://defr.jkphl.is/assets"],' + noscriptElementName + '.' + assetsClassName), tmp = data + (+new Date()), parser = doc[createElement](headElementName); defr < defrs[lengthPropertyName]; parser.innerHTML += (defrs[defr].textContent || defrs[defr].innerText).replace(/\s+href\=/g, ' ' + tmp + '='), ++defr) {}
        
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