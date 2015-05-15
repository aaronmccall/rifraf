
var request, cancel, root;
var syncDelay = 8;
var isNative = true;

function ctxDelayWrapper(func) {
    return function (fn, _ctx, _delay) {
        if (typeof _ctx === 'number' && typeof _delay === 'undefined') {
            var delay = _ctx;
            var ctx = void 0;
        }
        return func(fn, ctx, delay);
    }
}

function fakeRAF (fn, _delay) {
    _delay = _delay !== void 0 ? _delay : syncDelay;
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

var delay = ctxDelayWrapper(function _delay(fn, ctx, _delay) {
    if (typeof ctx === 'object') fn = fn.bind(ctx);
    return fakeRAF(fn, _delay);
});

var iterateeFake = ctxDelayWrapper(function _iterateeFake(fn, ctx, _delay) {
    return function _iterateeFake() {
        fakeRAF(fn.apply.bind(fn, ctx || this, arguments), _delay);
    }
});

function sync(_delay) { 
    return typeof _delay === 'number' && (syncDelay = _delay);
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