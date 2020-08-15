(function () {
    function Buffer(data) {
        this.data = data;
        this.toString = function () {
            return window.crypto.hexFromBytes(this.data);
        };
    }
    window.Buffer = {
        from: data => new Buffer(data),
        isBuffer: buffer => buffer instanceof Buffer,
    }
})();