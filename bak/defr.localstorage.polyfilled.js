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
	function append(element, tmp) {
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