(function(auto, defaultSelector, win, doc){
    'use strict';
    var head = doc.head || doc.getElementsByTagName(headElementName)[0],
	comma					= ',',
	data					= 'data-',
	createElement			= 'createElement',
	appendChild				= 'appendChild',
	getAttribute			= 'getAttribute',
	setAttribute			= 'setAttribute',
	removeAttribute			= 'removeAttribute',
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
	localNameName			= 'localName',
	itemprop				= 'itemprop',
	querySelectorAll		= 'querySelectorAll',
	globalAttributes		= ',accesskey,class,contenteditable,dir,draggable,dropzone,hidden,id,lang,spellcheck,style,tabindex,title,translate,',
	scriptAttributes		= globalAttributes + data + 'crossorigin,' + data + 'charset,onerror,' + onloadName + comma,
	defrLoaded				= '__d';
    
	var localStorageSupport		= false,
	localStoragePrefix			= 'defr-',
	localStorageDefaultExpire	= 18000000,
	revisionName				= 'revision',
	expireName					= 'expire',
	elementName					= 'element',
	cachedName					= 'cached',
	attributesName				= 'attributes',
	styleAttributes				= globalAttributes + 'media,type,scoped,onerror,' + onloadName + comma,
	emptyFunction				= function(){};
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
		element[appendChild](doc.createTextNode(obj.content));
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
						head[appendChild](cache(element, obj))[onloadName]();
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
		
		// Fallback: Simply append the given element (no caching in localStorage)
		(element[onloadName] || emptyFunction).call(head[appendChild](element));
	};
    
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
     * Revert the temporary href attribute
     * 
     * @param {Element} element				Element
     * @param {String} tmp					Temporary resource attribute name
     * @return {Element}					Reverted element
     */
    function revertHref(element, tmp) {
    	element[(element[localNameName] == linkElementName) ? 'href' : 'src'] = element[getAttribute](tmp);
    	element[removeAttribute](tmp);
    	return element;
    }
    
    /**
     * Trigger deferred loading of external CSS and JavaScript resources
     * 
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
        for (var defr = 0, defrs = doc[querySelectorAll](selector || defaultSelector), parser = doc[createElement](headElementName), tmp = data + (+new Date()); defr < defrs[lengthName]; parser.innerHTML += (defrs[defr].textContent || defrs[defr].innerText).replace(/\s+href\=/g, ' ' + tmp + '='), ++defr) {}
        
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