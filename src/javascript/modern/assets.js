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