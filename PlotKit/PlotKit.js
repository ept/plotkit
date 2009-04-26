/***

PlotKit Autoload Javascript Module.

This file was adapted from MochiKit.
See <http://mochikit.com/> for documentation, downloads, license, etc.
(c) 2005 Bob Ippolito.  All rights Reserved.

Modified by Alastair Tse, 2006, for PlotKit.

***/

if (typeof(PlotKit) == 'undefined') {
    PlotKit = {};
}

if (typeof(PlotKit.PlotKit) == 'undefined') {
    PlotKit.PlotKit = {};
}

PlotKit.PlotKit.NAME = "PlotKit.PlotKit";
PlotKit.PlotKit.VERSION = "0.9.2";
PlotKit.PlotKit.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

PlotKit.PlotKit.toString = function () {
    return this.__repr__();
};

PlotKit.PlotKit.SUBMODULES = [
    "Base",
    "Layout",
    "Canvas",
    "SVG",
    "SweetCanvas",
    "SweetSVG",
    "EasyPlot"
];

if (typeof(PlotKit.__compat__) == 'undefined') {
    PlotKit.__compat__ = true;
}
(function () {
    if (typeof(document) == "undefined") {
        return;
    }

    var scripts = document.getElementsByTagName("script");
    var kXULNSURI = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var base = null;
    var baseElem = null;
    var allScripts = {};
    var i;
    for (i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute("src");
        if (!src) {
            continue;
        }
        allScripts[src] = true;
        if (src.match(/PlotKit.js$/)) {
            base = src.substring(0, src.lastIndexOf('PlotKit.js'));
            baseElem = scripts[i];
        }
    }

    if (base === null) {
        return;
    }
    var modules = PlotKit.PlotKit.SUBMODULES;
    for (var i = 0; i < modules.length; i++) {
        if (PlotKit[modules[i]]) {
            continue;
        }
        var uri = base + modules[i] + '.js';
        if (uri in allScripts) {
            continue;
        }
        if (document.documentElement &&
            document.documentElement.namespaceURI == kXULNSURI) {
            // XUL
            var s = document.createElementNS(kXULNSURI, 'script');
            s.setAttribute("id", "PlotKit_" + base + modules[i]);
            s.setAttribute("src", uri);
            s.setAttribute("type", "application/x-javascript");
            baseElem.parentNode.appendChild(s);
        } else {
            // HTML
            /*
                DOM can not be used here because Safari does
                deferred loading of scripts unless they are
                in the document or inserted with document.write

                This is not XHTML compliant.  If you want XHTML
                compliance then you must use the packed version of PlotKit
                or include each script individually (basically unroll
                these document.write calls into your XHTML source)

            */
            document.write('<script src="' + uri +
                '" type="text/javascript"></script>');
        }
    };
})();
