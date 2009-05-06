if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Layout = function(t) {
    t.is("foo", "foo", "foo is equal to foo");
    //badger();
    t.is(1, 1, "1 is equal to 1");
    //t.is("foo", "bar", "foo is not equal to bar");
};
