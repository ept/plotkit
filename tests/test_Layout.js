// TODO: test...
// - bar chart with non-numeric x values
// - line chart (all variations)
// - pie chart (all variations)
// - axis scaling and axis tick placement in general

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
 * which appear in 'expected' are compared, allowing the actually returned objects to be
 * extended with additional fields in future versions.
 */
function compare_array_of_objects(t, was, expected, title, name) {
    for (var i=0; i < expected.length; i++) {
        for (var field in expected[i]) if (expected[i].hasOwnProperty(field)) {
            approximately_equal(t, was[i][field], expected[i][field], 
                title + ", property " + name + "[" + i + "]." + field);
        }
    }
}

/**
 * Unit tests for the Layout module.
 */
tests.test_Layout = function(t) {
    var layout;
    
    /*
     * VERTICAL BAR CHART
     */
    
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
    compare_array_of_objects(t, layout.bars, [
        {x: 0.0625, y: 1, h: 0, w: 0.375},
        {x: 0.5625, y: 0, h: 1, w: 0.375}
    ], "bar chart with two bars", "layout.bars");
    
    // Bar chart with two series
    layout = new PlotKit.Layout('bar', {});
    layout.addDataset('data1', [[0, 1], [1, 2], [2, 3]]);
    layout.addDataset('data2', [[1, 4], [2, 3], [3, 2], [4, 1]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {x: 0.025, y: 0.75, h: 0.25, w: 0.075}, // data1, [0, 1]
        {x: 0.225, y: 0.50, h: 0.50, w: 0.075}, // data1, [1, 2]
        {x: 0.425, y: 0.25, h: 0.75, w: 0.075}, // data1, [2, 3]
        {x: 0.300, y: 0.00, h: 1.00, w: 0.075}, // data2, [1, 4]
        {x: 0.500, y: 0.25, h: 0.75, w: 0.075}, // data2, [2, 3]
        {x: 0.700, y: 0.50, h: 0.50, w: 0.075}, // data2, [3, 2]
        {x: 0.900, y: 0.75, h: 0.25, w: 0.075}  // data2, [4, 1]
    ], "bar chart with two series", "layout.bars");
    
    // Bar chart with positive and negative values
    layout = new PlotKit.Layout('bar', {yOriginIsZero: false});
    layout.addDataset('data1', [[0, 1], [1, -1], [2, 3], [3, -2]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {x: 0.03125, y: 0.40, h: 0.20, w: 0.1875}, // [0,  1]
        {x: 0.28125, y: 0.60, h: 0.20, w: 0.1875}, // [1, -1]
        {x: 0.53125, y: 0.00, h: 0.60, w: 0.1875}, // [2,  3]
        {x: 0.78125, y: 0.60, h: 0.40, w: 0.1875}  // [3, -2]
    ], "bar chart with positive and negative values", "layout.bars");
    
    // Bar chart with a positive-y baseline
    layout = new PlotKit.Layout('bar', {xOriginIsZero: false, yOriginIsZero: false});
    layout.addDataset('data1', [[-8, 20.5], [-6, 22], [-4, 25], [-2, 29]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {x: 0.03125, y: 0.95, h: 0.05, w: 0.1875}, // [-8, 20.5]
        {x: 0.28125, y: 0.80, h: 0.20, w: 0.1875}, // [-6, 22]
        {x: 0.53125, y: 0.50, h: 0.50, w: 0.1875}, // [-4, 25]
        {x: 0.78125, y: 0.10, h: 0.90, w: 0.1875}  // [-2, 29]
    ], "bar chart with a positive-y baseline", "layout.bars");
    
    // Bar chart with over-constrained y axis range
    layout = new PlotKit.Layout('bar', {yAxis: [2.0, 7.0]});
    layout.addDataset('data1', [[0, 0], [1, 2], [2, 4], [3, 7], [4, 9]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {x: 0.025, w: 0.150, y: 1.00, h: 0.00}, // [0, 0]
        {x: 0.225, w: 0.150, y: 1.00, h: 0.00}, // [1, 2]
        {x: 0.425, w: 0.150, y: 0.60, h: 0.40}, // [2, 4]
        {x: 0.625, w: 0.150, y: 0.00, h: 1.00}, // [3, 7]
        {x: 0.825, w: 0.150, y: 0.00, h: 1.00}  // [4, 9]
    ], "bar chart with over-constrained y axis range", "layout.bars");

    
    /*
     * HORIZONTAL BAR CHART
     */
    
    // Horizontal bar chart with one bar
    layout = new PlotKit.Layout('bar', {xOriginIsZero: false, barOrientation: 'horizontal'});
    layout.addDataset('data1', [[1, 1]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {y: 0.125, x: 0, h: 0.75, w: 1}
    ], "horizontal bar chart with one bar", "layout.bars");
    
    // Horizontal bar chart with two bars
    layout = new PlotKit.Layout('bar', {barOrientation: 'horizontal'});
    layout.addDataset('data1', [[0, 0], [5, 5]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {y: 0.0625, x: 0, w: 0, h: 0.375},
        {y: 0.5625, x: 0, w: 1, h: 0.375}
    ], "horizontal bar chart with two bars", "layout.bars");
    
    // Horizontal bar chart with two series
    layout = new PlotKit.Layout('bar', {barOrientation: 'horizontal'});
    layout.addDataset('data1', [[0, 1], [1, 2], [2, 3]]);
    layout.addDataset('data2', [[1, 4], [2, 3], [3, 2], [4, 1]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {y: 0.025, x: 0.0, w: 0.25, h: 0.075}, // data1, [0, 1]
        {y: 0.225, x: 0.0, w: 0.50, h: 0.075}, // data1, [1, 2]
        {y: 0.425, x: 0.0, w: 0.75, h: 0.075}, // data1, [2, 3]
        {y: 0.300, x: 0.0, w: 1.00, h: 0.075}, // data2, [1, 4]
        {y: 0.500, x: 0.0, w: 0.75, h: 0.075}, // data2, [2, 3]
        {y: 0.700, x: 0.0, w: 0.50, h: 0.075}, // data2, [3, 2]
        {y: 0.900, x: 0.0, w: 0.25, h: 0.075}  // data2, [4, 1]
    ], "horizontal bar chart with two series", "layout.bars");
    
    // Horizontal bar chart with positive and negative values
    layout = new PlotKit.Layout('bar', {yOriginIsZero: false, barOrientation: 'horizontal'});
    layout.addDataset('data1', [[0, 1], [1, -1], [2, 3], [3, -2]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {y: 0.03125, x: 0.40, w: 0.20, h: 0.1875}, // [0,  1]
        {y: 0.28125, x: 0.20, w: 0.20, h: 0.1875}, // [1, -1]
        {y: 0.53125, x: 0.40, w: 0.60, h: 0.1875}, // [2,  3]
        {y: 0.78125, x: 0.00, w: 0.40, h: 0.1875}  // [3, -2]
    ], "horizontal bar chart with positive and negative values", "layout.bars");
    
    // Horizontal bar chart with a positive-y baseline
    layout = new PlotKit.Layout('bar', {xOriginIsZero: false, yOriginIsZero: false, barOrientation: 'horizontal'});
    layout.addDataset('data1', [[-8, 20.5], [-6, 22], [-4, 25], [-2, 29]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {y: 0.03125, x: 0.0, w: 0.05, h: 0.1875}, // [-8, 20.5]
        {y: 0.28125, x: 0.0, w: 0.20, h: 0.1875}, // [-6, 22]
        {y: 0.53125, x: 0.0, w: 0.50, h: 0.1875}, // [-4, 25]
        {y: 0.78125, x: 0.0, w: 0.90, h: 0.1875}  // [-2, 29]
    ], "horizontal bar chart with a positive-y baseline", "layout.bars");
    
    // Horizontal bar chart with over-constrained y axis range
    layout = new PlotKit.Layout('bar', {yAxis: [2.0, 7.0], barOrientation: 'horizontal'});
    layout.addDataset('data1', [[0, 0], [1, 2], [2, 4], [3, 7], [4, 9]]);
    layout.evaluate();
    compare_array_of_objects(t, layout.bars, [
        {y: 0.025, h: 0.150, x: 0.00, w: 0.00}, // [0, 0]
        {y: 0.225, h: 0.150, x: 0.00, w: 0.00}, // [1, 2]
        {y: 0.425, h: 0.150, x: 0.00, w: 0.40}, // [2, 4]
        {y: 0.625, h: 0.150, x: 0.00, w: 1.00}, // [3, 7]
        {y: 0.825, h: 0.150, x: 0.00, w: 1.00}  // [4, 9]
    ], "horizontal bar chart with over-constrained y axis range", "layout.bars");
};
