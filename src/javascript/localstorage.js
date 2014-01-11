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
@@apply
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