	/**
     * Load the resource by simply appending it to the <head> of the document
     * 
     * @param {Element} element				Element
     * @param {String} tmp					Temporary resource attribute name
     * @return {void}
     */
	function load(element, tmp) {
		(element[onloadName] || emptyFunction).call(head[appendChild](revertSubstitute(element, tmp)));
	}