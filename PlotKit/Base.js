/*

    PlotKit Project
    ---------------
   
    PlotKit Project is a collection of Javascript classes that allows
    you to quickly visualise data using different types of charts.
    
    Features:
    - Plots bar charts, line charts and pie charts.
    - Clean interface between layout and rendering engine.
    - Includes HTML Canvas, Inline SVG and Canvas on IE support.

    Browser Support:
    - Safari 2.0 (Canvas HTML) 
    - Firefox 1.5 (SVG and Canvas)
    - Opera 9.0 (SVG and Canvas)
    - IE 6.0 (Emulated Canvas via VML)

    More Info:
    - <http://www.liquidx.net/plotkit/>
    - <http://www.liquidx.net/plotkit/docs/>

    Requirements
    ------------
    * MochiKit 1.1+ (Base, Async, Color, DOM, Logging)
      <http://www.MochiKit.com>    

    Copyright
    ---------
    Copyright 2005,2006 (c) Alastair Tse <alastair^tse.id.au>
    For use under the BSD license. See end of file.
    
    Changes (Ascending Order)
    -------------------------
    
    * When known as CanvasGraph..
    
    [11 Dec 2005] 0.5   * Initial Public Release 
    [12 Dec 2005] 0.5.1 * Minor bugfix 
    
      - drawGrid's color usage. Thanks to  Philippe Marschall.
      
    [27 Dec 2005] 0.6   * Major Bugfix Release
    
      - Added Unit Tests
      - Fix alignment error with bar charts
      - Fix origin at 0 value for line charts
      - Fix bugs with plotting single values in dataset
      
    [12 Jan 2005] 0.7   * Major Reorganisation
      - Put everything into its own namespace, GraphKit.
        (a la. MochiKit).
      - Export CanvasGraph globally for backwards compat.

    * Now known as PlotKit..

    [04 Mar 2006] 0.8   * Major Rewrite
      - Break backwards compatibility. Users must port their code to the
        new PlotKit.API
      - Split rendering engine to Canvas.js, and Base.js.
      - Add optional Canvas on IE support. (webfx)
      - Add Inline SVG support.

*/

// --------------------------------------------------------------------
// Check required components
// --------------------------------------------------------------------

try {    
    if (typeof(MochiKit.Base) == 'undefined'   ||
        typeof(MochiKit.DOM) == 'undefined'    ||
        typeof(MochiKit.Color) == 'undefined'  ||
        typeof(MochiKit.Format) == 'undefined')
    {
        throw "";    
    }
} 
catch (e) {    
    throw "canvasGraph depends on MochiKit.{Base,Color,DOM,Format}"
}

// -------------------------------------------------------------------
// Inject Common Shortcuts we use into MochiKit.Color.Color
// -------------------------------------------------------------------

MochiKit.Base.update(MochiKit.Color.Color.prototype, {
    asFillColor: function() {
        return this.lighterColorWithLevel(0.3);
    },
        
    asStrokeColor: function() {
        return this.darkerColorWithLevel(0.1);
    },

    asPointColor: function() {
        return this.lighterColorWithLevel(0.1);
    }
});


// -------------------------------------------------------------------
// Define our own PlotKit namespace
// -------------------------------------------------------------------

if (typeof(PlotKit) == 'undefined') {
    PlotKit = {};
}

PlotKit.NAME = "PlotKit";
PlotKit.VERSION = "0.8";
PlotKit.__repr__ = function() {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

PlotKit.toString = function() {
    return this.__repr__();
}

// -------------------------------------------------------------------
//  Encapsulate all our utility function into it's own namespace.
// -------------------------------------------------------------------

if (typeof(PlotKit.Base) == 'undefined') {
    PlotKit.Base = {};
}

PlotKit.Base.NAME = 'PlotKit.Base';
PlotKit.Base.VERSION = PlotKit.VERSION;

PlotKit.Base.__repr__ = function() {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

PlotKit.Base.toString = function() {
    return this.__repr__();
}

MochiKit.Base.update(PlotKit.Base, {
    roundInterval: function(range, intervals, precision) {
        // We want to make the interval look regular,
        var trunc = MochiKit.Format.roundToFixed;
        var sep = range/intervals;
        return parseFloat(trunc(sep, precision));
    },

    collapse: function(lst) {
        var m = MochiKit.Base;
        var biggerList = new Array();
        for (var i = 0; i < lst.length; i++) {
            biggerList = m.concat(biggerList, lst[i]);
        }
        return biggerList;
    },
    
    uniq: function(sortedList) {
        // get unique elements in list, exactly the same as unix shell's uniq.
        var m = MochiKit.Base;
        
        if (!m.isArrayLike(sortedList) || (sortedList.length < 1))
            return new Array();

        var uniq = new Array();
        var lastElem = sortedList[0];    
        uniq.push(sortedList[0]);
        for (var i = 1; i < sortedList.length; i++) {
            if (m.compare(sortedList[i], lastElem) != 0) {
                lastElem = sortedList[i];
                uniq.push(sortedList[i]);            
            }
        }
        return uniq;
    },
    
    colorScheme: function() {
        var mb = MochiKit.Base;
        var mc = MochiKit.Color
        var scheme = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "magenta"];
        
        var makeColor = function(name) {
            return mc.Color[name + "Color"]()
        };
        
        return mb.map(makeColor, scheme);
    },

    baseColors: function () {
        var hexColor = MochiKit.Color.Color.fromHexString;
        return [hexColor("#123474"),
                hexColor("#476fb2"),
                hexColor("#be2c2b"),
                hexColor("#85b730"),
                hexColor("#734a99"),
                hexColor("#26a1c5"),
                hexColor("#fb8707"),
                hexColor("#000000"),
                hexColor("#ffffff")];
    },

    baseDarkPrimaryColors: function () {
        var hexColor = MochiKit.Color.Color.fromHexString;
        return [hexColor("#ad3f40"),
                hexColor("#ddac2c"),
                hexColor("#dfdd0c"),
                hexColor("#5276c4"),
                hexColor("#739c5a")];
    },

    basePrimaryColors: function () {
        var hexColor = MochiKit.Color.Color.fromHexString;
        return [hexColor("#d24c4d"),
                hexColor("#f2b32f"),
                hexColor("#ece90e"),
                hexColor("#5d83da"),
                hexColor("#78a15d")];
    },

    palette: function(baseColor) {
        var fractions = [0.0, 0.1, 0.2, 0.3, 0.4];
        var makeColor = function(color, fraction) {
            return color.lighterColorWithLevel(fraction);
        };
        return MochiKit.Base.map(partial(makeColor, baseColor), fractions);
    },
                       

    // The follow functions are from quirksmode.org
    // http://www.quirksmode.org/js/findpos.html

    findPosX: function(obj) {
        var curleft = 0;
        if (obj.offsetParent)
            {
                while (obj.offsetParent)
                    {
                        curleft += obj.offsetLeft
                            obj = obj.offsetParent;
                    }
            }
        else if (obj.x)
            curleft += obj.x;
        return curleft;
    },
                       
   findPosY: function(obj) {
       var curtop = 0;
       if (obj.offsetParent)
           {
               while (obj.offsetParent)
                   {
                       curtop += obj.offsetTop
                           obj = obj.offsetParent;
                   }
           }
       else if (obj.y)
           curtop += obj.y;
       return curtop;
   }
});    

PlotKit.Base.EXPORT = [
   "roundInterval",
   "collapse",
   "uniq",
   "colorScheme",
   "findPosX",
   "findPosY"
];

PlotKit.Base.EXPORT_OK = [];

PlotKit.Base.__new__ = function() {
    var m = MochiKit.Base;
    
    m.nameFunctions(this);
    
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };
};

PlotKit.Base.__new__();
MochiKit.Base._exportSymbols(this, PlotKit.Base);

/*

 Copyright (c) 2005, 2006 Alastair Tse <alastair@tse.id.au>

 All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer. 

* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.

* Neither the name of Alastair Tse nor the names of its contributors may
  be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
*/ 
