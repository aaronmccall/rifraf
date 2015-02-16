
var request, cancel, root, delay;
var isNative = true;

function fakeRAF (fn) {
    return root.setTimeout(fn, delay);
}

if (!(request && cancel)) {
    root = (function () { return this; })();

    request = (root.requestAnimationFrame || root.mozRequestAnimationFrame || root.webkitRequestAnimationFrame || fakeRAF);
    cancel = root.cancelAnimationFrame || root.mozCancelAnimationFrame || root.webkitCancelAnimationFrame || root.webkitCancelRequestAnimationFrame || root.clearTimeout;

    
    if (cancel === root.clearTimeout || request === fakeRAF) {
        isNative = false;
        delay = 8;
        request = fakeRAF;
    }

}

function iteratee(fn, ctx) {
    return function _iteratee() {
        request(fn.apply.bind(fn, ctx || this, arguments));
    };
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
    cancel: cancel.bind(root),
    sync60Hz: sync.bind(root, 16),
    sync30Hz: sync.bind(root, 33),
    sync: sync
};