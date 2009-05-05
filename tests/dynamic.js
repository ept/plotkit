var dataTable = null;
var layout = null;
var renderer = null;
var options = null;

function initDynamicTable() {
   dataTable = $('datatable');
   options = PlotKit.Base.officeBlue();
   layout = new Layout("line", options);
   renderer = new SweetCanvasRenderer($('canvasTest'), layout, options);
}

function newRow() {
   var tbody = dataTable.tBodies[0];
   var blankRow = TR({}, [
            TD({}, INPUT({"class":"xvalue", "size":"6", "type":"text", "value":"0"})),
            TD({}, INPUT({"class":"yvalue", "size":"6", "type":"text", "value":"0"}))]);
    tbody.appendChild(blankRow);
}

function chartReload() {
    var chartStyleSelected = document.forms["options"].chartStyle.selectedIndex;
    var chartStyle = document.forms["options"].chartStyle[chartStyleSelected].value;

    var colorSchemeSelected = document.forms["options"].colorScheme.selectedIndex;
    var colorScheme = document.forms["options"].colorScheme[colorSchemeSelected].value;
    // grab values
    var getValue = function(row) {
       var xElem = MochiKit.DOM.getElementsByTagAndClassName("input", "xvalue", row)[0];
       var yElem = MochiKit.DOM.getElementsByTagAndClassName("input", "yvalue", row)[0];
       var xVal = xElem.value;
       var yVal = yElem.value;

       if (xVal.length > 0) {
           xVal = parseFloat(xVal);
       }
       else {
           xVal = 0;
       }

       if (yVal.length > 0) {
           yVal = parseFloat(yVal);
       }
       else {
           yVal = 0;
       }
       return [xVal, yVal];
    }
   
    var values = MochiKit.Base.map(getValue, dataTable.tBodies[0].rows);

    // setup layout options
    var themeName = "office" + colorScheme;
    var theme = PlotKit.Base[themeName]();
    MochiKit.Base.update(options, theme);
            
    layout.style = chartStyle;
    MochiKit.Base.update(layout.options, options);
    MochiKit.Base.update(renderer.options, options);
            
    layout.addDataset("data", values);        

    // update
    layout.evaluate();
    renderer.clear();
    renderer.render();
   
}

addLoadEvent(initDynamicTable);
