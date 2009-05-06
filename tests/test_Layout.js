if (typeof(tests) == 'undefined') { tests = {}; }

/**
 * Compares two number to a precision of about 10 significant digits. Avoids tests failing because of
 * floating-point inaccuracy.
 */
function approximately_equal(t, val1, val2, name) {
    var repr = MochiKit.Base.repr;
    if ((typeof(val1) == 'number') && (typeof(val2) == 'number')) {
        if (Math.abs(val1) < 1e-10 && Math.abs(val2) < 1e-10) {
            t.ok(true, name);
        } else {
            t.ok(Math.abs((val1 - val2) / val1) < 1e-10, name, "got " + repr(val1) + ", expected " + repr(val2));
        }
    } else {
        t.is(val1, val2, name);
    }
}

/**
 * Compares two arrays of JavaScript objects. Only those array items and object field names
 * which appear in 'expected' are compared.
 */
function compare_array_of_objects(t, was, expected, title, name) {
    for (var i=0; i < expected.length; i++) {
        for (var field in expected[i]) if (expected[i].hasOwnProperty(field)) {
            approximately_equal(t, was[i][field], expected[i][field], 
                title + ", property " + name + "[" + i + "]." + field);
        }
    }
}

tests.test_Layout = function(t) {
    var layout;
    
    // Empty bar chart
    layout = new PlotKit.Layout('bar', {});
    layout.addDataset('data1', []);
    layout.evaluate();
    t.is(layout.bars.length, 0);
    
    // Bar chart with one bar
    layout = new PlotKit.Layout('bar', {xOriginIsZero: false});
    layout.addDataset('data1', [[1, 1]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {x: 0.125, y: 0, w: 0.75, h: 1}
    ], "bar chart with one bar", "layout.bars");
    
    // Bar chart with two bars
    layout = new PlotKit.Layout('bar', {});
    layout.addDataset('data1', [[0, 0], [5, 5]]);
    layout.evaluate();
    t.is(layout.minxval, 0, "x axis begins at lowest x value");
    t.is(layout.maxxval, 5, "x axis ends at highest x value");
    compare_array_of_objects(t, layout.bars, [
        {x: 0.0625, y: 1, h: 0, w: 0.375},
        {x: 0.5625, y: 0, h: 1, w: 0.375}
    ], "bar chart with two bars", "layout.bars");
    
    // Bar chart with two series
    layout = new PlotKit.Layout('bar', {});
    layout.addDataset('data1', [[0, 1], [1, 2], [2, 3]]);
    layout.addDataset('data2', [[1, 4], [2, 3], [3, 2], [4, 1]]);
    layout.evaluate();
    t.is(layout.minxval, 0, "x axis begins at lowest x value");
    t.is(layout.maxxval, 4, "x axis ends at highest x value");
    compare_array_of_objects(t, layout.bars, [
        {x: 0.025, y: 0.75, h: 0.25, w: 0.075}, // data1, [0, 1]
        {x: 0.225, y: 0.50, h: 0.50, w: 0.075}, // data1, [1, 2]
        {x: 0.425, y: 0.25, h: 0.75, w: 0.075}, // data1, [2, 3]
        {x: 0.300, y: 0.00, h: 1.00, w: 0.075}, // data2, [1, 4]
        {x: 0.500, y: 0.25, h: 0.75, w: 0.075}, // data2, [2, 3]
        {x: 0.700, y: 0.50, h: 0.50, w: 0.075}, // data2, [3, 2]
        {x: 0.900, y: 0.75, h: 0.25, w: 0.075}  // data2, [4, 1]
    ], "bar chart with two series", "layout.bars");
};
