'use strict';

var stream = require('stream');
var util = require('util');

var Transform = stream.Transform;

function FixedChunkStream(options) {
    // Allows use without new
    if (!(this instanceof FixedChunkStream)) {
        return new FixedChunkStream(options);
    }

    // The chunk/internal buffer size must be between 4K and 128M
    if(options && options.chunk_size && (options.chunk_size instanceof Number) && options.chunk_size>=4096 && options.chunk_size <= 134217728)
        this.chunk_size = options.chunk_size;
    else
        this.chunk_size = 1048576; // 1M
    this._reinitBuffer();
    Transform.call(this, options);
}
util.inherits(FixedChunkStream, Transform);

FixedChunkStream.prototype._transform = function (chunk, enc, cb) {
    var chunk_cursor = 0;
    while((chunk.length-chunk_cursor)>0){
        var bytes = Math.min(this.chunk_size - this.buflen, chunk.length - chunk_cursor);
        if(bytes) {
            chunk.copy(this.buf, this.buflen, chunk_cursor, chunk_cursor + bytes);
            this.buflen += bytes;
            chunk_cursor += bytes;

            if(this.buflen === this.chunk_size){
                this.push(this.buf);
                this._reinitBuffer();
            }
        }
    }
    cb();
};

FixedChunkStream.prototype._flush = function (cb) {
    var flush_buffer = new Buffer(this.buflen);
    this.buf.copy(flush_buffer, 0, 0, this.buflen);
    this.push(flush_buffer);
    this._reinitBuffer();
};

/**
 * It reinitializes the internal buffer, allocating fresh new memory.
 * All the calls inside this function are synchronous so no callback is required.
 * @private
 */
FixedChunkStream.prototype._reinitBuffer = function(){
    this.buf = new Buffer(this.chunk_size);
    this.buflen = 0;
    return;
};

module.exports = FixedChunkStream;