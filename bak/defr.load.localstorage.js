	var localStorageSupport		= false,
	localStoragePrefix			= 'defr-',
	localStorageDefaultExpire	= 18000000,
	revisionName				= 'revision',
	expireName					= 'expire',
	elementName					= 'element',
	cachedName					= 'cached',
	attributesName				= 'attributes',
	styleAttributes				= globalAttributes + 'media,type,scoped,onerror,' + onloadName + comma;
	try {
		var localStorageAlias	= localStorage;
		localStorageAlias.setItem(localStoragePrefix, localStoragePrefix);
		localStorageAlias.removeItem(localStoragePrefix);
		localStorageSupport		= true;
	} catch(e) {}
	
	/**
	 * Check if a cached element is (still) valid 
	 *
	 * @param {Object} cached			Cached object
	 * @param {Object} obj				Object properties to be cached / restored
	 * @return {Boolean}				Cached object is valid
	 */
	function isValidCacheElement(cached, obj) {
		return cached && (cached[expireName] - +new Date() > 0) && (cached[revisionName] === obj[revisionName]);
	}
	
	/**
	 * Fetch a resource via XHR
	 * 
	 * @param {String} url				URL
	 * @param {Function} success		Success handler
	 * @param {Function} error			Error handler
	 */
	function fetch(url, success, error) {
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
	
	/**
	 * Construct the appropriate HTML element from a cache item
	 * 
	 * @param {Object} obj				Cache item
	 * @return {Element}				<script> or <style> element
	 */
	function build(obj) {
		var element						= doc[createElement](obj[elementName]);
		element[onloadName]				= emptyFunction;
		for (var attribute in obj[attributesName]) {
			if (attribute[indexOf]('on') === 0) {
				var callback			= new Function('', obj[attributesName][attribute]);
				element[attribute]		= (attribute == onloadName) ? wrapOnloadCallback(callback) : callback;
			} else {
				element[setAttribute](attribute, obj[attributesName][attribute]);
			}
		}
		
		try {
			element[appendChild](doc.createTextNode(obj.content));
			
		// IE 8
		} catch(e) {
			element.text			= obj.content;
		}
		return element;
	}
	
	/**
	 * Add an object to the local storage
	 * 
	 * @param {Object} obj				Object
	 * @return {Boolean}				Object was successfully added to the local storage 
	 */
	function addToLocalStorage(obj) {
		try {
			localStorageAlias.setItem(localStoragePrefix + obj.key, JSON.stringify(obj));
			return true;
		} catch(e) {
			return false;
		}
	}
	
	/**
	 * Cache a retrieved resource and return an appropriate Element
	 * 
	 * @param {Element} element			Element representing an external resource
	 * @param {Object} obj				Cache element properties
	 * @return {Element}				Cache element
	 */
	function cache(element, obj) {
		for (var cached = false, attributeIndex = 0, attributes = element[attributesName], attribute, allowedAttributes = (obj[elementName] == styleElementName) ? styleAttributes : scriptAttributes, attributeName; attributeIndex < attributes[lengthName]; ++attributeIndex) {
			attribute			= attributes[attributeIndex];
			attributeName		= attribute[nameName];
			if (allowedAttributes[indexOf](comma + attributeName + comma) >= 0) {
				obj[attributesName][attributeName] = attribute.value;
			}
		}
		obj[cachedName]			= +new Date();
		obj[expireName]			= obj[cachedName] + (obj[expireName] || localStorageDefaultExpire) * 1000;
		
		try {
	        cached				= addToLocalStorage(obj);
	        
	    } catch(e) {
	    	
	    	// If it's a quota problem
	        if (e[nameName].toLowerCase()[indexOf]('quota') >= 0) {
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
						localStorageAlias.removeItem(localStoragePrefix + defrResourcesInLocalStorage.shift().key);
						cached	= addToLocalStorage(obj);
					} while(defrResourcesInLocalStorage[lengthName] && !cached);
	            }
	        }
	    }
		
		return cached ? build(obj) : element;
	}
	
	/**
	 * Find a cached element in the localStorage (or fetch it from it's remote server) and append to the <head> of the document 
	 * 
	 * @param {Element} element			Element representing an external resource
	 * @param {String} tmp				Temporary resource attribute name
	 * @param {Boolean} script			Whether it's a <script> element
	 * @return {void}
	 */
	function load(element, tmp, script) {
		
		// If the local storage is supported
		if (localStorageSupport) {
			try {
				var url			= element[getAttribute](tmp),
				obj				= {
					element		: script ? scriptElementName : styleElementName,
					attributes	: {},
					url			: url,
					key			: element.id || url,
					expire		: parseInt(element[getAttribute](data + expireName) || 0, 10),
					revision	: element[getAttribute](data + revisionName)
				},
				cached			= JSON.parse(localStorageAlias.getItem(localStoragePrefix + obj.key) || 'false');
				element[removeAttribute](tmp);
				
				// If the element hasn't been cached before or is expired: Retrieve it via XHR
				if (!isValidCacheElement(cached, obj)) {
					if (obj[revisionName]) {
						url		+= ((url[indexOf]('?') >= 0) ? '&' : '?') + localStoragePrefix + revisionName + '=' + obj[revisionName];
					}
					fetch(url, function(responseText, responseType) {
						obj.content		= responseText;
						obj.type		= responseType;
						append(cache(element, obj), tmp);
					}, function(error) {
						(element.onerror || emptyFunction).call(head[appendChild](element));
					});
					
					return;
					
				// Else: Create element from cache
				} else {
					element		= build(cached);
				}
			} catch(e) {}
		}

		// Fallback: Simply append the given element (no caching in localStorage) and call the onload handler (if available)
		append(element, tmp);
	};