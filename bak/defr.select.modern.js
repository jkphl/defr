	/**
     * Load the resource by simply appending it to the <head> of the document
     * 
     * @param {Element} element				Element
     * @param {String} tmp					Temporary resource attribute name
     * @return {void}
     */
	function @@append(element, tmp) {
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