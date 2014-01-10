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
@@localstorage
    
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
    
@@select
    
    // Automatically trigger deferred loading now! 
    if (auto) {
    	win.defr();
    }
    
})(false, @@queryselector, window, document);