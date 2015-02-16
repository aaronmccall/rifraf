var test = require('tape');
var rifraf = require('../index');

function get5() {
    var i = 0;
    var l = 5;
    var set = [];
    for (; i < l; i++) {
        set.push({index: i});
    }
    return set;
}

function now() { return new Date().getTime(); }

if (rifraf.isNative) {
    test('request defers approximately 16ms by default', function (t) {
        t.plan(7);
        rifraf.request(function (start) {
            var set = get5();
            var i = 0;

            function tick(dt) {
                var item = set[i++];
                item.time = dt;
                t.ok((dt - start) >= 0, 'time has passed: ' + (dt - start));

                if (set[i]) {
                    rifraf.request(tick);
                } else {
                    t.ok((item.time - start) > 5 * 16, 'should take at least 5 (80ms) frames of clock time; actual: ' + (item.time - start));
                    t.ok(set.every(function (item, index) {
                        var next = set[index + 1];
                        if (next) {
                            return item.time < next.time;
                        }
                        return true;
                    }), 'callbacks executed in order');
                    t.end();
                }
            }
            rifraf.request(tick);
        });
    });
} else {

    test('request defers approximately 8ms by default', function (t) {
        t.plan(2);
        var set = get5();
        var i = 0;
        var start = now();

        function tick() {
            var item = set[i++];
            item.time = now();

            if (item.index === 4) {
                t.ok((item.time - start) > 5 * 8, 'total time > 5 * 8ms; actual(' + (item.time - start) + ')');
                t.ok(set.every(function (item, index) {
                    var next = set[index + 1];
                    if (next) {
                        return item.time < next.time;
                    }
                    return true;
                }), 'callbacks executed in order');
                t.end();
            }

            if (set[i]) rifraf.request(tick);
        }
        rifraf.request(tick);
    });

    test('request defers approximately 16ms when sync60Hz is called', function (t) {
        rifraf.sync60Hz();
        t.plan(2);
        var set = get5();
        var i = 0;
        var start = now();

        function tick() {
            var item = set[i++];
            item.time = now();
            if (item.index === 4) {
                t.ok((item.time - start) > 5 * 16, 'total time > 5 * 16ms; actual(' + (item.time - start) + ')');
                t.ok(set.every(function (item, index) {
                    var next = set[index + 1];
                    if (next) {
                        return item.time < next.time;
                    }
                    return true;
                }), 'callbacks executed in order');
                t.end();
            }

            if (set[i]) rifraf.request(tick);
        }
        rifraf.request(tick);
    });

    test('request defers approximately 33ms when sync30Hz is called', function (t) {
        rifraf.sync30Hz();
        t.plan(2);
        var set = get5();
        var i = 0;
        var start = now();

        function tick() {
            var item = set[i++];
            item.time = now();
            if (item.index === 4) {
                t.ok((item.time - start) > 5 * 33, 'total time > 5 * 33ms; actual(' + (item.time - start) + ')');
                t.ok(set.every(function (item, index) {
                    var next = set[index + 1];
                    if (next) {
                        return item.time < next.time;
                    }
                    return true;
                }), 'callbacks executed in order');
                t.end();
            }

            if (set[i]) rifraf.request(tick);
        }
        rifraf.request(tick);
    });
}

test('callbacks can be cancelled', function (t) {

    function one() { one.called = true; }
    function two() { two.called = true; }
    function three() { three.called = true; }

    one.handle = rifraf.request(one);
    two.handle = rifraf.request(two);
    three.handle = rifraf.request(three);

    t.ok([one, two, three].every(function (fn) {
        return fn.handle;
    }), 'rifraf.request returns a handle');

    rifraf.cancel(two.handle);

    rifraf.request(function () {
        t.ok(one.called, 'callback one was called');
        t.notOk(two.called, 'callback two was not called');
        t.ok(three.called, 'callback three was called');
        t.end();
    });
});