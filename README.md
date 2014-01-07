defr
====

is an — at present: proof-of-concept — simple usage pattern and lightweight JavaScript library for **deferred loading of external CSS and JavaScript** resources.

The simple version of *defr* weighs no more than 1.3 kB (minified) and has no external dependencies. The advanced version additionally supports **localStorage caching** (if supported by the browser) and weighs ~2.8 kB.

I hacked this all together in about one day, so please don't expect it to be rocket science at the moment. It should, however, illustrate my thoughts. I'm happily awaiting your feedback!


Basics
------

Being fast in rendering the essential information to the screen might be a benefit for your visitors. Blocking content (like external CSS and JavaScript resources) should be avoided at first in case they are not necessarily needed for showing the "above the fold" content. But just moving those non-relevant stylesheets and scripts to the end of your document will not make them non-blocking. You will need to truly defer their loading using JavaScript. This is where *defr* jumps in, providing you with a very simple usage pattern.


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

As you see, there's a special `<noscript>` section in the head of the document (in fact, it could be everywhere, and there could also be more than one, distributed all over the document) and there's the *defr* library itself included at the end of the document (in practice, I'd recommend inlining it, but I'll keep it external in this example for clarity's sake).

The `<noscript>` section contains two `<link>` elements, with the first one being just a **regular link to an external CSS resource** — nothing special about it, except that it's a part of the `<noscript>` content. As deferred loading always involves JavaScript, this is a perfect fallback solution: If no JavaScript is available, the `<noscript>` element will be parsed and the stylesheet gets loaded just normally (non-deferred). Otherwise, the content of the `<noscript>` element is seen as text and won't be processed in any way by default.

The second `<link>` element — **referencing a JavaScript resource** — is missing a `rel` attribute, which is legal according to the [HTML5 vocabulary](http://www.w3.org/TR/html5/document-metadata.html#attr-link-rel). In `noscript` mode however, the browser will not know what to do with this resource, so it will be ignored — which is perfectly ok in that situation as we don't have JavaScript support anyway.

The *defr* library, included at the end of the document, will take care of the whole `<noscript>` section, extract the stylesheet and script resources and load them deferredly. Pretty easy, right?


What about that `itemtype` and `itemprop` stuff?
------------------------------------------------

For some reason, the [W3C HTML5 validator](http://validator.w3.org) requires a `<link>` element to either have a `rel` or an `itemprop` attribute (with the latter being part of the [Microdata](http://html5doctor.com/microdata) specification). Furthermore, an element having an `itemprop` attribute must be a descendant of an element having the `itemscope` attribute (see the `<noscript>` element). Finally, I also added the `itemtype` attribute to clearly indicate that it's a *defr* `<noscript>` element. In fact, the *defr* library is processing only `<noscript>` elements having the class name `defr` or the `itemtype="http://defr.jkphl.is/asset"`. Finally, the example above is valid HTML5.


Support for `localStorage` caching
----------------------------------

In addition to the deferred loading of CSS and JavaScript resources, *defr* can also use the `localStorage` of your HTML5 browser to cache the external resources once they got fetched. This avoids redundant requests* and may be a performance benefit — especially on mobile devices. I will document the caching behaviour soon.

In the meantime you can try out the example pages [with](http://defr.jkphl.is/index-localstorage.html) and [without](http://defr.jkphl.is/index-simple.html) `localStorage` support.


* Known problems
----------------

At the moment, Internet Explorer (tested  with v11) will redundantly request the external resources although they have already been cached in `localStorage`. I believe this to happen due to what IE calls "speculative downloads". I'll investigate this later (and probably will have to change the way I'm parsing the `<noscript>` content right now).


Resources
---------

* [Extending HTML5 — Microdata](http://html5doctor.com/microdata/)
* [Events on script and link elements](http://pieisgood.org/test/script-link-events/)


Legal
-----
Copyright © 2014 Joschi Kuphal <joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl)

*defr* is licensed under the terms of the [MIT license](LICENSE.txt).