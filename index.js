
var request, cancel, root;
var delay = 8;
var isNative = true;

function fakeRAF (fn, _delay) {
    _delay = _delay !== void 0 ? _delay : delay;
    return root.setTimeout(fn, _delay);
}

if (!(request && cancel)) {
    root = (function () { return this; })();

    request = (root.requestAnimationFrame || root.mozRequestAnimationFrame || root.webkitRequestAnimationFrame || fakeRAF);
    cancel = root.cancelAnimationFrame || root.mozCancelAnimationFrame || root.webkitCancelAnimationFrame || root.webkitCancelRequestAnimationFrame || root.clearTimeout;

    
    if (cancel === root.clearTimeout || request === fakeRAF) {
        isNative = false;
        request = fakeRAF;
    }

}

function iteratee(fn, ctx) {
    return function _iteratee() {
        request(fn.apply.bind(fn, ctx || this, arguments));
    };
}

function delay(fn, ctx, _delay) {
    if (typeof ctx === 'number' && typeof _delay === 'undefined') {
        _delay = ctx;
        ctx = void 0;
    }
    if (typeof ctx === 'object') {
        fn = fn.bind(ctx);
    }
    return fakeRAF(fn, _delay);
}

function iterateeFake(fn, ctx, _delay) {
    if (typeof ctx === 'number' && typeof _delay === 'undefined') {
        _delay = ctx;
        ctx = void 0;
    }
    return function _iterateeFake() {
        fakeRAF(fn.apply.bind(fn, ctx || this, arguments), _delay);
    }
}

function sync(_delay) { 
    return typeof _delay === 'number' && (delay = _delay);
}

module.exports = {
    isNative: isNative,
    request: function (fn, ctx) {
        if (arguments.length > 1) fn = fn.bind(ctx);
        return request.call(root, fn);
    },
    iteratee: iteratee,
    deferred: iteratee,
    delay: delay,
    delayed: iterateeFake,
    cancel: cancel.bind(root),
    sync60Hz: sync.bind(root, 16),
    sync30Hz: sync.bind(root, 33),
    sync: sync
};