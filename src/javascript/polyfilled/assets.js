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