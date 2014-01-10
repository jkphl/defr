defr
====

is an — at present: proof-of-concept — simple usage pattern and lightweight JavaScript library for **deferred loading and localStorage caching of external CSS and JavaScript** resources.

There are two variants of the library, both of them having no dependencies: The "simple" version weighs no more than 1.3 kB (minified) and features everything that's necessary for **deferred loading**. The "localstorage" version adds support for **localStorage caching** (if supported by the browser) and weighs ~2.8 kB.

Please be aware that I hacked all this together in about one day, so don't expect it to be rocket science at the moment. It should, however, illustrate my thoughts. I'm happily awaiting your feedback and your suggestions!


Basics
------

When delivering content to your visitors, it is advisable to concentrate on the "above the fold" part in the first place and avoid "blocking content" by all means (i.e. external resources that need to get downloaded before the document can be rendered). External CSS and JavaScript files are always considered blocking, and simply moving them to the bottom of your HTML documents won't change this. Also, adding the `async` or `defer` attributes won't help in all cases — despite the fact that they exist for `<script>` elements only. To truly defer the loading of stylesheets and scripts you'll have to employ JavaScript and dynamically add these resources to the DOM. This is where *defr* jumps in, providing you with a very simple usage pattern for this very purpose.


Example
-------

Have a look at the following example:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>defr usage pattern example</title>
        
        <!-- defr asset bundle -->
        <noscript class="defr" itemtype="http://defr.jkphl.is/assets" itemscope="itemscope">
            <link rel="stylesheet" type="text/css" href="/path/to/stylesheet.css"/>
            <link itemprop="script" type="text/javascript" href="/path/to/script.js"/>
        </noscript>
        
    </head>
    <body>
        <p>Lorem ipsum dolor sit amet, ...</p>
        <script src="/path/to/defr.simple.min.js"></script>
    </body>
</html>
```

As you see, there's a special `<noscript>` section in the head of the document (in fact, it could be everywhere, and there could also be more than one, distributed all over the document) and there's the *defr* library itself included at the end (in practice, I'd recommend inlining the library, but I'll keep it external in this example for clarity's sake).

The `<noscript>` section contains two `<link>` elements, with the first one being just a **regular reference to an external CSS resource** — nothing special about it, except that it's a part of the `<noscript>` content. As deferred loading always involves JavaScript, this is a perfect fallback: If no JavaScript is available, the `<noscript>` element will be parsed and the stylesheet gets loaded just normally (non-deferred). Otherwise, the content of the `<noscript>` element is seen as text and won't be processed in any way by default.

The second `<link>` element — **referencing a JavaScript resource** — is missing a `rel` attribute, which is perfectly ok according to the [HTML5 vocabulary](http://www.w3.org/TR/html5/document-metadata.html#attr-link-rel). It will, however, result in the browser ignoring the element altogether when being in `noscript` mode, as it doesn't know how to deal with it — which again is perfectly ok as we don't have JavaScript support in that situation  anyway.

The *defr* library, included at the end of the document, will take care of that `<noscript>` section, extract the stylesheet and script resources and load them by dynamically injecting them into the DOM. Pretty easy, right?


What about that `itemtype` and `itemprop` stuff?
------------------------------------------------

According to the [HTML5 vocabulary](http://www.w3.org/TR/2011/WD-html5-author-20110809/the-noscript-element.html), a `<noscript>` element may only contain `<meta>`, `<link>` and `<style>` elements — but no `<script>` elements, unfortunately. To comply with the HTML5 validation rules, we have to "misuse" the `<link>` element for referencing external JavaScript resources. For my taste, that's absolutely ok, as it's nothing more than the reference established by e.g. `<link rel="stylesheet"/>` for a CSS resource. There is, however, no appropriate `rel` value we could use for JavaScript, so we have to omit it altogether (Well, we could employ e.g. `rel="prefetch"`, but that would definitely be a case of misuse ...). 

The [W3C HTML5 validator](http://validator.w3.org) requires each `<link>` element to either have a `rel` or an `itemprop` attribute (with the latter being part of the [Microdata](http://html5doctor.com/microdata) specification). Furthermore, an element having an `itemprop` attribute must also be a descendant of an element having the `itemscope` attribute (see the `<noscript>` in the example). As I'm a huge fan of [micro information](https://github.com/jkphl/micrometa) anyway, I finally added the `itemtype="http://defr.jkphl.is/asset"` attribute to clearly indicate that it's a *defr* `<noscript>` element. At the same time, **this usage pattern is valid HTML5** out of the box.


Employing defr
--------------

In general, I recommend inlining the *defr* library, as it is really small and — more importantly — referencing it externally would introduce the library itself as a "blocking content" — which is exactly what you'll want to avoid. In any case, you should include the library **after the last asset bundle** (i.e. *defr* `<noscript>` element) in your document, e.g. just before the closing `</body>` element.

```html
	...
	<script>
		!function(a,b,c,d){ ... }(!1,'noscript[itemtype="http://defr.jkphl.is/assets"],noscript.defr',window,document);
	</script>
</body
```

As you see, the *defr* library comes as an [IIFE](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression) that is called with four arguments:

1.	A Boolean indicating wheter the *defr* asset bundles in the document should be processed immediately and automatically. You might set this to `false` in case you want to start loading the external resources manually (like in the [two](http://defr.jkphl.is/index-localstorage.html) demo [pages](http://defr.jkphl.is/index-simple.html)).
2.	The selector to be used with `querySelectorAll()` for finding the asset bundles within the document. As a default, all `<noscript class="defr">` and `<noscript itemtype="http://defr.jkphl.is/assets">` elements are matched (see example). You shouldn't need to change this, but maybe you can save some bytes by stripping out what you don't need.
3.	A reference to the window object (don't change this).
4.	A reference to the document object (don't change this).

The library registers a global `defr()` function which you can call in order to start the resource loading manually, e.g.:

```HTML
...
<button type="button" onclick="window.defr()">Load CSS and scripts</button>
...
```

Processing steps and attribute traversal
----------------------------------------

These are the steps the *defr* library takes:

1.	At first, it matches all relevant asset bundles (i.e. `<noscript>` elements), parses their text content and processes the contained `<link>` elements one after another.
2.	CSS stylesheet references (i.e. `<link rel="stylesheet" href="..."/>` elements) will be appended to the `<head>` of your document without any significant change. All attributes (except `itemprop`) will be preserved.
3.	All JavaScript resources — matching `<link type="text/javascript" href="..."/>` — will be converted to and injected as `<script>` elements, following these attribute and property traversal rules:
	*	If present, the global attributes `accesskey`, `class`, `contenteditable`, `dir`, `draggable`, `dropzone`, `hidden`, `id`, `lang`, `spellcheck`, `style`, `tabindex`, `title` and `translate` are preserved and copied over from the original `<link>` element to the created `<script>` element.
	*	If present, the event handlers `onload` and `onerror` are preserved as well and copied over to the created `<script>` element. In addition, an `onload` handler will be expanded to an Internet Explorer < 9 compatible variant (as there is [no native support](http://pieisgood.org/test/script-link-events) for `onload` on `<script>` elements in IE < 9).
	*	If present, the attributes `data-crossorigin` and `data-charset` are preserved and copied over to the created `<script>` element, but renamed to `crossorigin` and `charset` respectively.
	*	All `data-*` attributes are preserved and copied over to the created `<script>` element, whereas all other remaining attributes are discarded.
	*	The `href` property of the `<script>` element is set to the `src` value of the  origininal `<link>` element.
	*	The `type` property of the `<script>` element is set to `"text/javascript"`.
	*	The `defer` property of the `<script>` element is set to `true`.


Support for `localStorage` caching
----------------------------------

In addition to the deferred loading of CSS and JavaScript resources, the "localstorage" variant of the *defr* library uses the `localStorage` of [your HTML5 browser](http://caniuse.com/#search=localstorage) to cache the external resources once they got fetched from their remote server. This avoids redundant requests* and may be a performance benefit — especially on mobile devices. You don't have to do anything special, the caching just happens automagically.

In "localstorage" mode, some of the asset `<link>`'s attributes gain a special meaning (obviously I have been inspired by [basket.js](http://addyosmani.github.io/basket.js) here):

*	By default, the `href` attribute of the `<link>` element is used as the unique key for storing an asset into the `localStorage`.
*	If the `<link>` element has an `id` attribute, however, it's value will be taken as unique key, thus becoming independent from the resource URL.
*	If the `<link>` element has a `data-expire` attribute, it's value will be taken as number of seconds that the asset should be cached. The default is 18000000 seconds (~7 months).
*	If the `<link>` element has a `data-revision` attribute, it's value will be saved to the `localStorage` along with the asset. If the same asset (as identified by the unique key, see above) is encountered with another `data-revision` value, the cached version will be refreshed respectively replaced by the new one. Effectively, you can use this for cache busting.

Please be aware that there's a browser dependent memory limit for `localStorage` (mostly 5 MB, but please check that for your specific browser / platform). If there's not enough free  space for storing an asset into the `localStorage`, *defr* will purge older assets it has stored before (starting with the oldest) until it can cache the new one.

To clear the `localStorage` for a certain (sub)domain, simply issue a `localStorage.clear()` call from JavaScript (e.g. using the console input of your developer tools).


* Known problems
----------------

Internet Explorer performs what is called "speculative downloads", i.e. it automatically prefetches e.g. CSS resources in the moment when you create a `<link>` element and give it a `href` attribute. It doesn't matter if the element is already part of the DOM — Internet Explorer will fetch it anyway, which kinda foils the localStorage approach. For this reason, it is necessary to trick IE by temporarily substituting the name of the `href` attribute against something different so that the speculative downloads aren't triggered. The current stage of *defr* does exactly this, so at least IE 11 behaves as expected now. I didn't test older IE versions yet though.


Live demo
---------

You can try out these two demo pages [with](http://defr.jkphl.is/index-localstorage.html) and [without](http://defr.jkphl.is/index-simple.html) `localStorage` support.


Supported / tested browsers
---------------------------

* Internet Explorer 6 (polyfilled library)
* Internet Explorer 7 (polyfilled library + special markup)
* Internet Explorer 8 (polyfilled library + special markup)
* Internet Explorer 9 (polyfilled library)
* Internet Explorer 11 (all versions)
* Chrome 31 (all versions)
* Firefox 26 (all versions)
* Opera 12.10 (all versions)
* Opera 12.16 (all versions)


Current problems / caveats
--------------------------
* onload handler of `<script>` elements doesn't get called in IE8 `localStorage` mode
* IE8 proprietary method of setting `<script>` element content in `def.load.localstorage.js` 
* IE9 is buggy


Resources
---------

* [Extending HTML5 — Microdata](http://html5doctor.com/microdata/)
* [Events on script and link elements](http://pieisgood.org/test/script-link-events/)


Legal
-----
Copyright © 2014 Joschi Kuphal <joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl)

*defr* is licensed under the terms of the [MIT license](LICENSE.txt).