(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hydralfo = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)

},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
(function (Buffer){
/*!
**  Pure-UUID -- Pure JavaScript Based Universally Unique Identifier (UUID)
**  Copyright (c) 2004-2019 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  Universal Module Definition (UMD)  */
(function (root, name, factory) {
    /* global define: false */
    /* global module: false */
    if (typeof define === "function" && typeof define.amd !== "undefined")
        /*  AMD environment  */
        define(function () { return factory(root); });
    else if (typeof module === "object" && typeof module.exports === "object") {
        /*  CommonJS environment  */
        module.exports = factory(root);
        module.exports["default"] = module.exports;
    }
    else
        /*  Browser environment  */
        root[name] = factory(root);
}(this, "UUID", function (/* root */) {

    /*  array to hex-string conversion  */
    var a2hs = function (bytes, begin, end, uppercase, str, pos) {
        var mkNum = function (num, uppercase) {
            var base16 = num.toString(16);
            if (base16.length < 2)
                base16 = "0" + base16;
            if (uppercase)
                base16 = base16.toUpperCase();
            return base16;
        };
        for (var i = begin; i <= end; i++)
            str[pos++] = mkNum(bytes[i], uppercase);
        return str;
    };

    /*  hex-string to array conversion  */
    var hs2a = function (str, begin, end, bytes, pos) {
        for (var i = begin; i <= end; i += 2)
            bytes[pos++] = parseInt(str.substr(i, 2), 16);
    };

    /*  This library provides Z85: ZeroMQ's Base-85 encoding/decoding
        (see http://rfc.zeromq.org/spec:32 for details)  */

    var z85_encoder = (
        "0123456789" +
         "abcdefghijklmnopqrstuvwxyz" +
         "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
         ".-:+=^!/*?&<>()[]{}@%$#"
    ).split("");
    var z85_decoder = [
        0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00,
        0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45,
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47,
        0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A,
        0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
        0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A,
        0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00,
        0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
        0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
        0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
    ];
    var z85_encode = function (data, size) {
        if ((size % 4) !== 0)
            throw new Error("z85_encode: invalid input length (multiple of 4 expected)");
        var str = "", i = 0, value = 0;
        while (i < size) {
            value = (value * 256) + data[i++];
            if ((i % 4) === 0) {
                var divisor = 85 * 85 * 85 * 85;
                while (divisor >= 1) {
                    var idx = Math.floor(value / divisor) % 85;
                    str += z85_encoder[idx];
                    divisor /= 85;
                }
                value = 0;
             }
        }
        return str;
    };
    var z85_decode = function (str, dest) {
        var l = str.length;
        if ((l % 5) !== 0)
            throw new Error("z85_decode: invalid input length (multiple of 5 expected)");
        if (typeof dest === "undefined")
            dest = new Array(l * 4 / 5);
        var i = 0, j = 0, value = 0;
        while (i < l) {
            var idx = str.charCodeAt(i++) - 32;
            if (idx < 0 || idx >= z85_decoder.length)
                break;
            value = (value * 85) + z85_decoder[idx];
            if ((i % 5) === 0) {
                var divisor = 256 * 256 * 256;
                while (divisor >= 1) {
                    dest[j++] = Math.trunc((value / divisor) % 256);
                    divisor /= 256;
                }
                value = 0;
            }
        }
        return dest;
    };

    /*  This library provides conversions between 8/16/32-bit character
        strings and 8/16/32-bit big/little-endian word arrays.  */

    /*  string to array conversion  */
    var s2a = function (s, _options) {
        /*  determine options  */
        var options = { ibits: 8, obits: 8, obigendian: true };
        for (var opt in _options)
            if (typeof options[opt] !== "undefined")
                options[opt] = _options[opt];

        /*  convert string to array  */
        var a = [];
        var i = 0;
        var c, C;
        var ck = 0;
        var w;
        var wk = 0;
        var sl = s.length;
        for (;;) {
            /*  fetch next octet from string  */
            if (ck === 0)
                C = s.charCodeAt(i++);
            c = (C >> (options.ibits - (ck + 8))) & 0xFF;
            ck = (ck + 8) % options.ibits;

            /*  place next word into array  */
            if (options.obigendian) {
                if (wk === 0) w  = (c <<  (options.obits - 8));
                else          w |= (c << ((options.obits - 8) - wk));
            }
            else {
                if (wk === 0) w  = c;
                else          w |= (c << wk);
            }
            wk = (wk + 8) % options.obits;
            if (wk === 0) {
                a.push(w);
                if (i >= sl)
                    break;
            }
        }
        return a;
    };

    /*  array to string conversion  */
    var a2s = function (a, _options) {
        /*  determine options  */
        var options = { ibits: 32, ibigendian: true };
        for (var opt in _options)
            if (typeof options[opt] !== "undefined")
                options[opt] = _options[opt];

        /* convert array to string */
        var s = "";
        var imask = 0xFFFFFFFF;
        if (options.ibits < 32)
            imask = (1 << options.ibits) - 1;
        var al = a.length;
        for (var i = 0; i < al; i++) {
            /* fetch next word from array */
            var w = a[i] & imask;

            /* place next octet into string */
            for (var j = 0; j < options.ibits; j += 8) {
                if (options.ibigendian)
                    s += String.fromCharCode((w >> ((options.ibits - 8) - j)) & 0xFF);
                else
                    s += String.fromCharCode((w >> j) & 0xFF);
            }
        }
        return s;
    };

    /*  this is just a really minimal UI64 functionality,
        just sufficient enough for the UUID v1 generator and PCG PRNG!  */

    /*  UI64 constants  */
    var UI64_DIGITS     = 8;    /* number of digits */
    var UI64_DIGIT_BITS = 8;    /* number of bits in a digit */
    var UI64_DIGIT_BASE = 256;  /* the numerical base of a digit */

    /*  convert between individual digits and the UI64 representation  */
    var ui64_d2i = function (d7, d6, d5, d4, d3, d2, d1, d0) {
        return [ d0, d1, d2, d3, d4, d5, d6, d7 ];
    };

    /*  the zero represented as an UI64  */
    var ui64_zero = function () {
        return ui64_d2i(0, 0, 0, 0, 0, 0, 0, 0);
    };

    /*  clone the UI64  */
    var ui64_clone = function (x) {
        return x.slice(0);
    };

    /*  convert between number and UI64 representation  */
    var ui64_n2i = function (n) {
        var ui64 = ui64_zero();
        for (var i = 0; i < UI64_DIGITS; i++) {
            ui64[i] = Math.floor(n % UI64_DIGIT_BASE);
            n /= UI64_DIGIT_BASE;
        }
        return ui64;
    };

    /*  convert between UI64 representation and number  */
    var ui64_i2n = function (x) {
        var n = 0;
        for (var i = UI64_DIGITS - 1; i >= 0; i--) {
            n *= UI64_DIGIT_BASE;
            n += x[i];
        }
        return Math.floor(n);
    };

    /*  add UI64 (y) to UI64 (x) and return overflow/carry as number  */
    var ui64_add = function (x, y) {
        var carry = 0;
        for (var i = 0; i < UI64_DIGITS; i++) {
            carry += x[i] + y[i];
            x[i]   = Math.floor(carry % UI64_DIGIT_BASE);
            carry  = Math.floor(carry / UI64_DIGIT_BASE);
        }
        return carry;
    };

    /*  multiply number (n) to UI64 (x) and return overflow/carry as number  */
    var ui64_muln = function (x, n) {
        var carry = 0;
        for (var i = 0; i < UI64_DIGITS; i++) {
            carry += x[i] * n;
            x[i]   = Math.floor(carry % UI64_DIGIT_BASE);
            carry  = Math.floor(carry / UI64_DIGIT_BASE);
        }
        return carry;
    };

    /*  multiply UI64 (y) to UI64 (x) and return overflow/carry as UI64  */
    var ui64_mul = function (x, y) {
        var i, j;

        /*  clear temporary result buffer zx  */
        var zx = new Array(UI64_DIGITS + UI64_DIGITS);
        for (i = 0; i < (UI64_DIGITS + UI64_DIGITS); i++)
            zx[i] = 0;

        /*  perform multiplication operation  */
        var carry;
        for (i = 0; i < UI64_DIGITS; i++) {
            /*  calculate partial product and immediately add to zx  */
            carry = 0;
            for (j = 0; j < UI64_DIGITS; j++) {
                carry += (x[i] * y[j]) + zx[i + j];
                zx[i + j] = (carry % UI64_DIGIT_BASE);
                carry /= UI64_DIGIT_BASE;
            }

            /*  add carry to remaining digits in zx  */
            for ( ; j < UI64_DIGITS + UI64_DIGITS - i; j++) {
                carry += zx[i + j];
                zx[i + j] = (carry % UI64_DIGIT_BASE);
                carry /= UI64_DIGIT_BASE;
            }
        }

        /*  provide result by splitting zx into x and ov  */
        for (i = 0; i < UI64_DIGITS; i++)
            x[i] = zx[i];
        return zx.slice(UI64_DIGITS, UI64_DIGITS);
    };

    /*  AND operation: UI64 (x) &= UI64 (y)  */
    var ui64_and = function (x, y) {
        for (var i = 0; i < UI64_DIGITS; i++)
            x[i] &= y[i];
        return x;
    };

    /*  OR operation: UI64 (x) |= UI64 (y)  */
    var ui64_or = function (x, y) {
        for (var i = 0; i < UI64_DIGITS; i++)
            x[i] |= y[i];
        return x;
    };

    /*  rotate right UI64 (x) by a "s" bits and return overflow/carry as number  */
    var ui64_rorn = function (x, s) {
        var ov = ui64_zero();
        if ((s % UI64_DIGIT_BITS) !== 0)
            throw new Error("ui64_rorn: only bit rotations supported with a multiple of digit bits");
        var k = Math.floor(s / UI64_DIGIT_BITS);
        for (var i = 0; i < k; i++) {
            for (var j = UI64_DIGITS - 1 - 1; j >= 0; j--)
                ov[j + 1] = ov[j];
            ov[0] = x[0];
            for (j = 0; j < UI64_DIGITS - 1; j++)
                x[j] = x[j + 1];
            x[j] = 0;
        }
        return ui64_i2n(ov);
    };

    /*  rotate right UI64 (x) by a "s" bits and return overflow/carry as number  */
    var ui64_ror = function (x, s) {
        /*  sanity check shifting  */
        if (s > (UI64_DIGITS * UI64_DIGIT_BITS))
            throw new Error("ui64_ror: invalid number of bits to shift");

        /*  prepare temporary buffer zx  */
        var zx = new Array(UI64_DIGITS + UI64_DIGITS);
        var i;
        for (i = 0; i < UI64_DIGITS; i++) {
            zx[i + UI64_DIGITS] = x[i];
            zx[i] = 0;
        }

        /*  shift bits inside zx  */
        var k1 = Math.floor(s / UI64_DIGIT_BITS);
        var k2 = s % UI64_DIGIT_BITS;
        for (i = k1; i < UI64_DIGITS + UI64_DIGITS - 1; i++) {
            zx[i - k1] =
                ((zx[i] >>> k2) |
                 (zx[i + 1] << (UI64_DIGIT_BITS - k2))) &
                ((1 << UI64_DIGIT_BITS) - 1);
        }
        zx[UI64_DIGITS + UI64_DIGITS - 1 - k1] =
            (zx[UI64_DIGITS + UI64_DIGITS - 1] >>> k2) &
            ((1 << UI64_DIGIT_BITS) - 1);
        for (i = UI64_DIGITS + UI64_DIGITS - 1 - k1 + 1; i < UI64_DIGITS + UI64_DIGITS; i++)
            zx[i] = 0;

        /*  provide result by splitting zx into x and ov  */
        for (i = 0; i < UI64_DIGITS; i++)
            x[i] = zx[i + UI64_DIGITS];
        return zx.slice(0, UI64_DIGITS);
    };

    /*  rotate left UI64 (x) by a "s" bits and return overflow/carry as UI64  */
    var ui64_rol = function (x, s) {
        /*  sanity check shifting  */
        if (s > (UI64_DIGITS * UI64_DIGIT_BITS))
            throw new Error("ui64_rol: invalid number of bits to shift");

        /*  prepare temporary buffer zx  */
        var zx = new Array(UI64_DIGITS + UI64_DIGITS);
        var i;
        for (i = 0; i < UI64_DIGITS; i++) {
            zx[i + UI64_DIGITS] = 0;
            zx[i] = x[i];
        }

        /*  shift bits inside zx  */
        var k1 = Math.floor(s / UI64_DIGIT_BITS);
        var k2 = s % UI64_DIGIT_BITS;
        for (i = UI64_DIGITS - 1 - k1; i > 0; i--) {
            zx[i + k1] =
                ((zx[i] << k2) |
                 (zx[i - 1] >>> (UI64_DIGIT_BITS - k2))) &
                ((1 << UI64_DIGIT_BITS) - 1);
        }
        zx[0 + k1] = (zx[0] << k2) & ((1 << UI64_DIGIT_BITS) - 1);
        for (i = 0 + k1 - 1; i >= 0; i--)
            zx[i] = 0;

        /*  provide result by splitting zx into x and ov  */
        for (i = 0; i < UI64_DIGITS; i++)
            x[i] = zx[i];
        return zx.slice(UI64_DIGITS, UI64_DIGITS);
    };

    /*  XOR UI64 (y) onto UI64 (x) and return x  */
    var ui64_xor = function (x, y) {
        for (var i = 0; i < UI64_DIGITS; i++)
            x[i] ^= y[i];
        return;
    };

    /*  this is just a really minimal UI32 functionality,
        just sufficient enough for the MD5 and SHA1 digests!  */

    /*  safely add two integers (with wrapping at 2^32)  */
    var ui32_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };

    /*  bitwise rotate 32-bit number to the left  */
    var ui32_rol = function (num, cnt) {
        return (
              ((num <<        cnt ) & 0xFFFFFFFF)
            | ((num >>> (32 - cnt)) & 0xFFFFFFFF)
        );
    };

    /*  calculate the SHA-1 of an array of big-endian words, and a bit length  */
    var sha1_core = function (x, len) {
        /*  perform the appropriate triplet combination function for the current iteration  */
        function sha1_ft (t, b, c, d) {
            if (t < 20) return (b & c) | ((~b) & d);
            if (t < 40) return b ^ c ^ d;
            if (t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        }

        /*  determine the appropriate additive constant for the current iteration  */
        function sha1_kt (t) {
            return (t < 20) ?  1518500249 :
                   (t < 40) ?  1859775393 :
                   (t < 60) ? -1894007588 :
                               -899497514;
        }

        /*  append padding  */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = Array(80);
        var a =  1732584193;
        var b =  -271733879;
        var c = -1732584194;
        var d =   271733878;
        var e = -1009589776;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; j < 80; j++) {
                if (j < 16)
                    w[j] = x[i + j];
                else
                    w[j] = ui32_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                var t = ui32_add(
                    ui32_add(ui32_rol(a, 5), sha1_ft(j, b, c, d)),
                    ui32_add(ui32_add(e, w[j]), sha1_kt(j))
                );
                e = d;
                d = c;
                c = ui32_rol(b, 30);
                b = a;
                a = t;
            }
            a = ui32_add(a, olda);
            b = ui32_add(b, oldb);
            c = ui32_add(c, oldc);
            d = ui32_add(d, oldd);
            e = ui32_add(e, olde);
        }
        return [ a, b, c, d, e ];
    };

    /*  calculate the SHA-1 of an octet string  */
    var sha1 = function (s) {
        return a2s(
            sha1_core(
                s2a(s, { ibits: 8, obits: 32, obigendian: true }),
                s.length * 8),
            { ibits: 32, ibigendian: true });
    };

    /*  calculate the MD5 of an array of little-endian words, and a bit length  */
    var md5_core = function (x, len) {
        /*  basic operations the algorithm uses  */
        function md5_cmn (q, a, b, x, s, t) {
            return ui32_add(ui32_rol(ui32_add(ui32_add(a, q), ui32_add(x, t)), s), b);
        }
        function md5_ff (a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        function md5_gg (a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        function md5_hh (a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }
        function md5_ii (a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        /*  append padding  */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a =  1732584193;
        var b =  -271733879;
        var c = -1732584194;
        var d =   271733878;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i+ 0],  7,  -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12,  -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,   606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4],  7,  -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22,   -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17,      -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12,   -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i+ 1],  5,  -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,   643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20,  -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5],  5,  -701558691);
            d = md5_gg(d, a, b, c, x[i+10],  9,    38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14,  -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20,  -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9],  5,   568446438);
            d = md5_gg(d, a, b, c, x[i+14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14,  -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2],  9,   -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i+ 5],  4,     -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23,   -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16,  -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13],  4,   681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11,  -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16,  -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,    76029189);
            a = md5_hh(a, b, c, d, x[i+ 9],  4,  -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11,  -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,   530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23,  -995338651);

            a = md5_ii(a, b, c, d, x[i+ 0],  6,  -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21,   -57434055);
            a = md5_ii(a, b, c, d, x[i+12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15,    -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10,   -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4],  6,  -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,   718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21,  -343485551);

            a = ui32_add(a, olda);
            b = ui32_add(b, oldb);
            c = ui32_add(c, oldc);
            d = ui32_add(d, oldd);
        }
        return [ a, b, c, d ];
    };

    /*  calculate the MD5 of an octet string  */
    var md5 = function (s) {
        return a2s(
            md5_core(
                s2a(s, { ibits: 8, obits: 32, obigendian: false }),
                s.length * 8),
            { ibits: 32, ibigendian: false });
    };

    /*  PCG Pseudo-Random-Number-Generator (PRNG)
        http://www.pcg-random.org/pdf/hmc-cs-2014-0905.pdf
        This is the PCG-XSH-RR variant ("xorshift high (bits), random rotation"),
        based on 32-bit output, 64-bit internal state and the formulas:
        state = state * MUL + INC
        output = rotate32((state ^ (state >> 18)) >> 27, state >> 59)  */

    var PCG = function (seed) {
        /*  pre-load some "magic" constants  */
        this.mul   = ui64_d2i(0x58, 0x51, 0xf4, 0x2d, 0x4c, 0x95, 0x7f, 0x2d);
        this.inc   = ui64_d2i(0x14, 0x05, 0x7b, 0x7e, 0xf7, 0x67, 0x81, 0x4f);
        this.mask  = ui64_d2i(0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff);

        /*  generate an initial internal state  */
        this.state = ui64_clone(this.inc);
        this.next();
        ui64_and(this.state, this.mask);
        seed = ui64_n2i(seed !== undefined ?
            (seed >>> 0) : ((Math.random() * 0xffffffff) >>> 0));
        ui64_or(this.state, seed);
        this.next();
    };
    PCG.prototype.next = function () {
        /*  save current state  */
        var state = ui64_clone(this.state);

        /*  advance internal state  */
        ui64_mul(this.state, this.mul);
        ui64_add(this.state, this.inc);

        /*  calculate: (state ^ (state >> 18)) >> 27  */
        var output = ui64_clone(state);
        ui64_ror(output, 18);
        ui64_xor(output, state);
        ui64_ror(output, 27);

        /*  calculate: state >> 59  */
        var rot = ui64_clone(state);
        ui64_ror(rot, 59);

		/*  calculate: rotate32(xorshifted, rot)  */
        ui64_and(output, this.mask);
        var k = ui64_i2n(rot);
        var output2 = ui64_clone(output);
        ui64_rol(output2, 32 - k);
        ui64_ror(output, k);
        ui64_xor(output, output2);

        /*  return pseudo-random number  */
        return ui64_i2n(output);
    };
    var pcg = new PCG();

    /*  utility function: simple Pseudo Random Number Generator (PRNG)  */
    var prng = function (len, radix) {
        var bytes = [];
        for (var i = 0; i < len; i++)
            bytes[i] = (pcg.next() % radix);
        return bytes;
    };

    /*  internal state  */
    var time_last = 0;
    var time_seq  = 0;

    /*  the API constructor  */
    var UUID = function () {
        if (arguments.length === 1 && typeof arguments[0] === "string")
            this.parse.apply(this, arguments);
        else if (arguments.length >= 1 && typeof arguments[0] === "number")
            this.make.apply(this, arguments);
        else if (arguments.length >= 1)
            throw new Error("UUID: constructor: invalid arguments");
        else
            for (var i = 0; i < 16; i++)
                this[i] = 0x00;
    };

    /*  inherit from a standard class which provides the
        best UUID representation in the particular environment  */
    /* global Uint8Array: false */
    /* global Buffer: false */
    if (typeof Uint8Array !== "undefined")
        /*  HTML5 TypedArray (browser environments: IE10, FF, CH, SF, OP)
            (http://caniuse.com/#feat=typedarrays)  */
        UUID.prototype = new Uint8Array(16);
    else if (Buffer)
        /*  Node Buffer (server environments: Node.js, IO.js)  */
        UUID.prototype = new Buffer(16);
    else
        /*  JavaScript (any environment)  */
        UUID.prototype = new Array(16);
    UUID.prototype.constructor = UUID;

    /*  API method: generate a particular UUID  */
    UUID.prototype.make = function (version) {
        var i;
        var uuid = this;
        if (version === 1) {
            /*  generate UUID version 1 (time and node based)  */

            /*  determine current time and time sequence counter  */
            var date = new Date();
            var time_now = date.getTime();
            if (time_now !== time_last)
                time_seq = 0;
            else
                time_seq++;
            time_last = time_now;

            /*  convert time to 100*nsec  */
            var t = ui64_n2i(time_now);
            ui64_muln(t, 1000 * 10);

            /*  adjust for offset between UUID and Unix Epoch time  */
            ui64_add(t, ui64_d2i(0x01, 0xB2, 0x1D, 0xD2, 0x13, 0x81, 0x40, 0x00));

            /*  compensate for low resolution system clock by adding
                the time/tick sequence counter  */
            if (time_seq > 0)
                ui64_add(t, ui64_n2i(time_seq));

            /*  store the 60 LSB of the time in the UUID  */
            var ov;
            ov = ui64_rorn(t, 8); uuid[3] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[2] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[1] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[0] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[5] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[4] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[7] = (ov & 0xFF);
            ov = ui64_rorn(t, 8); uuid[6] = (ov & 0x0F);

            /*  generate a random clock sequence  */
            var clock = prng(2, 255);
            uuid[8] = clock[0];
            uuid[9] = clock[1];

            /*  generate a random local multicast node address  */
            var node = prng(6, 255);
            node[0] |= 0x01;
            node[0] |= 0x02;
            for (i = 0; i < 6; i++)
                uuid[10 + i] = node[i];
        }
        else if (version === 4) {
            /*  generate UUID version 4 (random data based)  */
            var data = prng(16, 255);
            for (i = 0; i < 16; i++)
                 this[i] = data[i];
        }
        else if (version === 3 || version === 5) {
            /*  generate UUID version 3/5 (MD5/SHA-1 based)  */
            var input = "";
            var nsUUID = (
                typeof arguments[1] === "object" && arguments[1] instanceof UUID ?
                arguments[1] : new UUID().parse(arguments[1])
            );
            for (i = 0; i < 16; i++)
                 input += String.fromCharCode(nsUUID[i]);
            input += arguments[2];
            var s = version === 3 ? md5(input) : sha1(input);
            for (i = 0; i < 16; i++)
                 uuid[i] = s.charCodeAt(i);
        }
        else
            throw new Error("UUID: make: invalid version");

        /*  brand with particular UUID version  */
        uuid[6] &= 0x0F;
        uuid[6] |= (version << 4);

        /*  brand as UUID variant 2 (DCE 1.1)  */
        uuid[8] &= 0x3F;
        uuid[8] |= (0x02 << 6);

        return uuid;
    };

    /*  API method: format UUID into usual textual representation  */
    UUID.prototype.format = function (type) {
        var str, arr;
        if (type === "z85")
            str = z85_encode(this, 16);
        else if (type === "b16") {
            arr = Array(32);
            a2hs(this, 0, 15, true, arr, 0);
            str = arr.join("");
        }
        else if (type === undefined || type === "std") {
            arr = new Array(36);
            a2hs(this,  0,  3, false, arr,  0); arr[ 8] = "-";
            a2hs(this,  4,  5, false, arr,  9); arr[13] = "-";
            a2hs(this,  6,  7, false, arr, 14); arr[18] = "-";
            a2hs(this,  8,  9, false, arr, 19); arr[23] = "-";
            a2hs(this, 10, 15, false, arr, 24);
            str = arr.join("");
        }
        return str;
    };

    /*  API method: format UUID into usual textual representation  */
    UUID.prototype.toString = function (type) {
        return this.format(type);
    };

    /*  API method: parse UUID from usual textual representation  */
    UUID.prototype.parse = function (str, type) {
        if (typeof str !== "string")
            throw new Error("UUID: parse: invalid argument (type string expected)");
        if (type === "z85")
            z85_decode(str, this);
        else if (type === "b16")
            hs2a(str, 0, 35, this, 0);
        else if (type === undefined || type === "std") {
            var map = {
                "nil":     "00000000-0000-0000-0000-000000000000",
                "ns:DNS":  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "ns:URL":  "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                "ns:OID":  "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
                "ns:X500": "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
            };
            if (map[str] !== undefined)
                str = map[str];
            else if (!str.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/))
                throw new Error("UUID: parse: invalid string representation " +
                    "(expected \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\")");
            hs2a(str,  0,  7, this,  0);
            hs2a(str,  9, 12, this,  4);
            hs2a(str, 14, 17, this,  6);
            hs2a(str, 19, 22, this,  8);
            hs2a(str, 24, 35, this, 10);
        }
        return this;
    };

    /*  API method: export UUID into standard array of numbers  */
    UUID.prototype.export = function () {
        var arr = Array(16);
        for (var i = 0; i < 16; i++)
            arr[i] = this[i];
        return arr;
    };

    /*  API method: import UUID from standard array of numbers  */
    UUID.prototype.import = function (arr) {
        if (!(typeof arr === "object" && arr instanceof Array))
            throw new Error("UUID: import: invalid argument (type Array expected)");
        if (arr.length !== 16)
            throw new Error("UUID: import: invalid argument (Array of length 16 expected)");
        for (var i = 0; i < 16; i++) {
            if (typeof arr[i] !== "number")
                throw new Error("UUID: import: invalid array element #" + i +
                    " (type Number expected)");
            if (!(isFinite(arr[i]) && Math.floor(arr[i]) === arr[i]))
                throw new Error("UUID: import: invalid array element #" + i +
                    " (Number with integer value expected)");
            if (!(arr[i] >= 0 && arr[i] <= 255))
                throw new Error("UUID: import: invalid array element #" + i +
                    " (Number with integer value in range 0...255 expected)");
            this[i] = arr[i];
        }
        return this;
    };

    /*  API method: compare UUID against another one  */
    UUID.prototype.compare = function (other) {
        if (typeof other !== "object")
            throw new Error("UUID: compare: invalid argument (type UUID expected)");
        if (!(other instanceof UUID))
            throw new Error("UUID: compare: invalid argument (type UUID expected)");
        for (var i = 0; i < 16; i++) {
            if (this[i] < other[i])
                return -1;
            else if (this[i] > other[i])
                return +1;
        }
        return 0;
    };

    /*  API method: hash UUID by XOR-folding it k times  */
    UUID.prototype.fold = function (k) {
        if (typeof k === "undefined")
            throw new Error("UUID: fold: invalid argument (number of fold operations expected)");
        if (k < 1 || k > 4)
            throw new Error("UUID: fold: invalid argument (1-4 fold operations expected)");
        var n = 16 / Math.pow(2, k);
        var hash = new Array(n);
        for (var i = 0; i < n; i++) {
            var h = 0;
            for (var j = 0; i + j < 16; j += n)
                h ^= this[i + j];
            hash[i] = h;
        }
        return hash;
    };

    UUID.PCG = PCG;

    /*  export API  */
    return UUID;
}));


}).call(this,require("buffer").Buffer)

},{"buffer":2}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const _functions = {};
_functions.async = {
  doc: {
    title: "Asynchronously execute a function",
    command: ['async(f, r, d)', 'async({f, r, d})'],
    params: {
      f: "Function to execute. Default is `() => {}`",
      r: `Run frequency of the function. A value of \`0\` or less will
result in the function being called only once. Default is \`1\``,
      d: "Delay before first run. Default is `0`"
    },
    return: "The unaltered input value.",
    description: `The provided function is run with a frequency of \`r\`
per time unit. All parameters are based on the current \`time\` and \`bpm\`,
assuming \`time\` is in beats. Timing is not guaranteed, so \`f\` might drift
over time.

Internally async is implemented using setTimeout with all implications regarding
execution context.`,
    examples: [`const x = {v: 3};
shape(
    L.async(() => x.v = ((x.v + 1 ) % 5) + 3)
        .set(() => x.v)
).out(o0);`]
  },
  fun: args => {
    const {
      f: fn,
      r: run_freq,
      d: delay
    } = (0, _util.expand_args)({
      f: _util.ud,
      r: 1,
      d: 0
    }, args);
    const thread_state = {
      id: (0, _util.uuid)(),
      do_stop: false,
      running: false,
      last_args: [_util.ud, _util.ud, _util.ud]
    };
    return (input, gen_args, run_args) => {
      thread_state.last_args = [input, gen_args, run_args];

      if (typeof fn === 'undefined') {
        return input;
      } // luckyily javascript is single threaded...


      let asyncs = gen_args.global_state.async;

      if (typeof asyncs !== 'undefined') {
        return input;
      }

      gen_args.global_state.async = {};
      asyncs = gen_args.global_state.async;

      if (typeof asyncs[thread_state.id] !== 'undefined') {
        return input;
      }

      gen_args.global_state.cleanup.push(() => {
        thread_state.do_stop = true;
        thread_state.last_args = [_util.ud, _util.ud, _util.ud];
      });
      asyncs[thread_state.id] = {
        init: gen_args.values.time,
        state: thread_state
      };
      const bpm = (0, _util.get_bpm)(gen_args, run_args, false);

      const beats_to_millis = n => Math.max(60 / bpm / n * 1000, 100);

      const timeout = run_freq <= 0 ? -1 : beats_to_millis(run_freq);
      const delayt = beats_to_millis(delay);
      const env = (0, _util.get_global_env)();

      const tfunc = () => {
        if (thread_state.do_stop) {
          return;
        }

        const ret = fn(...thread_state.last_args);

        if (!ret) {
          return;
        }

        if (timeout > 0) {
          env.setTimeout(tfunc, timeout);
        }
      };

      console.log(`startring thread ${thread_state.id}, delayt=${delayt} timeout=${timeout}`);

      if (typeof env !== 'undefined') {
        if (delay <= 0) {
          thread_state.running = true;
          tfunc();
        } else {
          env.setTimeout(() => {
            thread_state.running = true;
            tfunc();
          }, delayt);
        }
      }

      return input;
    };
  }
};
const functions = {
  __category: "async",
  __doc: {
    title: "Asynchronous functions",
    description: `Functions allowing you to perform actions asynchronously
to the main processing done in Hydra.`
  },
  ..._functions
};
exports.functions = functions;

},{"./util":11}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const _functions = {};
_functions.set = {
  doc: {
    title: "Set a value",
    command: ['set(v, t)', 'set({v, t})'],
    params: {
      v: `The value to set. This can either be a scalar value or a
function that returns a scalar value.`
    },
    return: "The set value",
    description: `Set the `,
    see_also: ['use', 'time'],
    examples: ['Shape(L.set(5))', 'Shape(L.set(({time}) => time % 5))', 'Shape(L.set(({time}) => time + 5).)']
  },
  fun: args => {
    let avalue = 0;
    let tgt_value = _util.ud;

    if (typeof args !== 'undefined') {
      if (Array.isArray(args)) {
        if (args.length > 0) {
          const [first_arg, second_arg] = args;

          if (typeof first_arg === 'object') {
            if (Array.isArray(first_arg)) {
              avalue = 0;
            } else if ('v' in first_arg) {
              avalue = first_arg.v;
            } else {
              avalue = 0;
            }
          } else {
            avalue = first_arg;
          }

          if (typeof second_arg === 'string') {
            tgt_value = second_arg;
          }
        }
      } else if (typeof args !== 'object') {
        avalue = args;
      }
    }

    if (typeof args !== 'undefined' && args.length > 0 && (typeof args[0] !== 'object' || Array.isArray(args[0]) || 'v' in Object.keys(args[0]))) {
      const {
        v
      } = (0, _util.expand_args)({
        v: _util.ud
      }, args);
      avalue = v;
    }

    const value = avalue;
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);

      if (typeof tgt_value !== 'undefined') {
        gen_args.values[tgt_value] = vv;

        if (tgt_value !== gen_args.current_value) {
          return input;
        }
      }

      return vv;
    };
  }
};
_functions.use = {
  doc: {
    title: "Set the currently modified value.",
    command: ["use(n, c)", "use({n, c})"],
    params: {
      n: `The name of the value. The default value is \`val\`. You can
manipulate \`time\` or \`bpm\` or any other string value as well.`,
      c: `Should the currently in use value be copied over to the new on
one. Either \`true\` to copy or \`false\` to keep the value untouched. Defaul
is \`false\``
    },
    return: "The currently in use value.",
    description: `You can manipulate a custom list of values which
you can refer to by name. The \`val\` value is the default used initially.
The last value that's in \`use\` will be what the LFO function finally returns.

Though \`fast\` and
the likes are the preferred way to manipulate time you can also use
\`use('time')\` to manipulate time directly or return its value from the LFO 
function.`,
    examples: ["shape(L.set(10).use('time').mul(2).use('val')).out(o0)", "shape(10, L.use('time').add(1).use('val').sin().add(1)).out(o0)"]
  },
  fun: args => {
    const {
      n: name,
      c: copy
    } = (0, _util.expand_args)({
      n: "val",
      c: false
    }, args);
    return (input, gen_args, run_args) => {
      const [nv, cv] = (0, _util.freeze_values)([name, copy], run_args, gen_args);
      let ret = gen_args.values[nv];

      if (cv) {
        ret = input;
      }

      gen_args.current_value = nv;
      return ret;
    };
  }
};
_functions.get = {
  doc: {
    title: "Set the current value to a named one.",
    command: ["get(n)", "get({n})"],
    params: {
      n: "The name of the value to get, e.g. `time` to get the current time. Default value is `val`"
    },
    return: "The value saved unter the name specified by `n`. Can be undefined.",
    description: ``,
    examples: ["shape(3, L.get('time').mul(2).use('time', true).sin(1, 0.5, 0.5)).out(o0)"]
  },
  un: args => {
    const {
      n: name
    } = (0, _util.expand_args)({
      n: "val"
    }, args);
    return (input, gen_args, run_args) => {
      const [nv] = (0, _util.freeze_values)([name], run_args, gen_args);
      const ret = gen_args.values[nv];
      gen_args.current_value = ret;
      return ret;
    };
  }
};
_functions.used = {
  doc: {
    title: "Return the name of the currently in `use` value",
    command: ["used()"],
    params: {},
    return: "The name set by the last `use` command or `val` if not set at all.",
    description: `This function allows you to retrieve the name of the
current default parameter that is modufied by functions like \`mul\` or \`set\`.

This is usually most helpful for debugging purposes, though you could use it in
\`map\` too.`,
    examples: ["console.log(L.used()) // == 'val'", "console.log(L.use('time').used()) == 'time'", `
shape(3)
    .rotate(
        L.use(() => time % 2 < 1 ? "cos" : "sin"))
            .used()
            .map((x, {time}) => eval(\`Math.$\{x}(time)\`))
            .mul(2)
    ).out(o0)
`]
  },
  fun: () => (_, gen_args) => gen_args.current_value
};
_functions.noop = {
  doc: {
    title: "Do nothing",
    command: ["noop()"],
    params: {},
    return: "The unmodified input value.",
    description: `This function performs no operation. It's mostly used
for debugging and testing purposes`,
    examples: ["L.noop().gen()({val: 2}) // == 2", "L.time().noop().run({time: 2}) // == 2"]
  },
  fun: () => input => input
};
const functions = {
  __category: "general",
  __doc: {
    title: "General Hydra LFO utility functions",
    description: `Functions that perform various tasks on Hydra LFO
values or its processing chain.`
  },
  ..._functions
};
exports.functions = functions;

},{"./util":11}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const _functions = {};
const TAU = 2 * Math.PI; // TODO: use LUTs

_functions.sin = {
  fun: args => {
    const {
      f: frequency,
      s: scale,
      o: offset
    } = (0, _util.expand_args)({
      f: 1,
      s: 1,
      o: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [fv, sv, ov] = (0, _util.freeze_values)([frequency, scale, offset], run_args, gen_args);
      let time = 0;
      time = (0, _util.undefault)(input, (0, _util.get_time)(gen_args, run_args, true));
      time = (0, _util.undefault)(time, 0.25);
      return (Math.sin(time * TAU * fv) / 2 + 0.5) * sv + ov;
    };
  }
};
_functions.rnd = {
  fun: args => {
    const {
      s: scale,
      o: offset,
      m: mix
    } = (0, _util.expand_args)({
      s: _util.ud,
      o: 0,
      m: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov, mv] = (0, _util.freeze_values)([scale, offset, mix], run_args, gen_args);
      let svx = 1;

      if (typeof input === 'undefined') {
        if (typeof sv === 'undefined') {
          svx = 1;
        } else {
          svx = sv;
        }
      } else if (typeof sv === 'undefined') {
        svx = input;
      } else {
        svx = (0, _util.mix_values)(sv, input, mv);
      }

      return Math.random() * svx + ov;
    };
  }
};
_functions.rand = _functions.rnd;
_functions.range = {
  fun: args => {
    const {
      u: upper,
      l: lower,
      s: step
    } = (0, _util.expand_args)({
      u: 1,
      l: 0,
      s: 0.1
    }, args);
    return (input, gen_args, run_args) => {
      const [uv, lv, sv] = (0, _util.freeze_values)([upper, lower, step], run_args, gen_args);
      let idx = (0, _util.undefault)(input, (0, _util.get_time)(gen_args, run_args, true));
      idx = (0, _util.undefault)(idx, 0);
      let ub = uv;
      let lb = lv; // console.log({t: run_args[0].time, input, idx, ub, lb, sv});

      if (ub < lb) {
        const tmp = lb;
        lb = ub;
        ub = tmp;
      } else if (ub === lb) {
        return ub;
      } else if (sv === 0 || idx === 0) {
        return lb;
      }

      const range = ub - lb;
      let v = sv * idx + lb; // console.log({v, sv, idx, lb, range});
      // TODO: test if this can be replaced by "mod" (likely can)

      while (v < lb) {
        v = v + range;
      }

      while (v >= ub) {
        v = v - range;
      } // console.log({v});


      return v;
    };
  }
};
_functions.choose = {
  fun: args => {
    const {
      v: values,
      s: scale
    } = (0, _util.expand_args)({
      v: [0, 1],
      s: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [vv, sv] = (0, _util.freeze_values)([values, scale], run_args, gen_args);

      if (vv.length === 0) {
        return 0;
      }

      let idx = (0, _util.undefault)(input, (0, _util.get_time)(gen_args, run_args, true));
      idx = (0, _util.undefault)(idx, 0) * sv;
      idx = Math.floor(Math.abs(idx));
      idx = idx % vv.length;
      let val = vv[idx];
      const fmark = `choose_mark_${new Date().getTime()}`;
      let maxcnt = 10;

      while (typeof val === 'function') {
        const fn = val;
        fn.__choose_mark = fmark;
        val = fn(...run_args, gen_args);

        if (maxcnt-- <= 0 || typeof val === 'function' && val.__choose_mark === fmark) {
          // loop detected
          val = 0;
          break;
        }

        delete fn.__choose_mark;
      }

      return val;
    };
  }
};
const functions = {
  __category: "generator",
  __doc: {
    title: "Generator functions",
    description: `Functions that generate values and can be used as the
the source for other functions and parameters.`
  },
  ..._functions
};
exports.functions = functions;

},{"./util":11}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = exports.TAU = void 0;

var _util = require("./util");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const TAU = 2 * Math.PI;
exports.TAU = TAU;
const _functions = {};
_functions.add = {
  doc: ({
    doc_link
  }) => ({
    title: "Add a value",
    command: ["add(v)", "add({v})"],
    params: {
      v: "The value to add. Default is 0"
    },
    return: "The previous value plus the added value `v`.",
    description: `Add a value to the current value, depending on ${doc_link('use', "`use`")}`,
    examples: ["shape(L.time().mod(3).add(2).floor()).out(o0)", "shape(3,L.time().mod(3).div(6).add(L.sin({f:1/2,s:0.2,o:0.1}))).out(o0)"]
  }),
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return (0, _util.undefault)(input, 0) + vv;
    };
  }
};
_functions.sub = {
  doc: ({
    doc_link
  }) => ({
    title: "Subtract a value",
    command: ["sub(v)", "sub({v})"],
    params: {
      v: "The value to subtract. Default is 0"
    },
    return: "The previous value minus the subtracted value `v`.",
    description: `Subtract a value from the current value, depending on ${doc_link('use', "`use`")}`,
    examples: ["shape(3).scrollY(-0.2).rotate(L.time().mod(10).sub(5).floor().rad(1/10)).out(o0)"]
  }),
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return (0, _util.undefault)(input, 0) - vv;
    };
  }
};
_functions.floor = {
  doc: ({
    doc_link
  }) => ({
    title: "Roud down to the nearest number of digits",
    command: ["floor(d)", "floor({d})"],
    params: {
      d: `The number of digits after the decimal point to round down to.
Default is 0 which is effectively the nearest lower integer.`
    },
    return: "Rounded value",
    description: `Rounds the current value down to the specified number of decimal places. This can
be used to discretize continous valued functions.`,
    examples: ["shape(3).scrollY(L.range({u:10,s:0.5}).floor(1)).out(o0)"]
  }),
  fun: args => {
    const {
      d: digits
    } = (0, _util.expand_args)({
      d: 0
    }, args);
    return (input, gen_args, run_args) => {
      const dv = (0, _util.freeze_values)(digits, run_args, gen_args);
      const fact = Math.pow(10, dv);
      return Math.floor((0, _util.undefault)(input, 0) * fact) / fact;
    };
  }
};
_functions.mul = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return input * vv;
    };
  }
};
_functions.div = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 1
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      const definput = (0, _util.undefault)(input, 0);

      if (vv === 0) {
        return definput / 0.0000000000001;
      }

      return definput / vv;
    };
  }
};
_functions.mod = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 1
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);

      if (vv === 0) {
        return 0;
      }

      return (0, _util.undefault)(input, 0) % vv;
    };
  }
};
_functions.rad = {
  fun: args => {
    const {
      s: scale,
      o: offset
    } = (0, _util.expand_args)({
      s: 1,
      o: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov] = (0, _util.freeze_values)([scale, offset], run_args, gen_args);
      const rv = (0, _util.undefault)(input, 0);
      return (rv + ov) * sv * TAU;
    };
  }
};
const functions = {
  __category: "maths",
  __doc: {
    title: "Math related functions",
    description: `Various generally maths related functions that act on
Hydra LFO values.`
  },
  ..._functions
};
exports.functions = functions;

},{"./util":11}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const _functions = {}; // TODO: this should be locked to time/BPM boundaries

_functions.sah = {
  fun: args => {
    const {
      h: hold_time
    } = (0, _util.expand_args)({
      h: 1
    }, args);
    return (input, gen_args, run_args) => {
      const hv = (0, _util.freeze_values)(hold_time, run_args, gen_args);
      let prev_time = Number.MIN_SAFE_INTEGER;

      if (typeof gen_args.private_state.time !== 'undefined') {
        prev_time = gen_args.private_state.time;
      }

      if (typeof gen_args.private_state.value === 'undefined') {
        gen_args.private_state.value = input;
      }

      if (gen_args.values.time - prev_time >= Math.abs(hv)) {
        gen_args.private_state.value = input;
        gen_args.private_state.time = gen_args.values.time;
      }

      return gen_args.private_state.value;
    };
  }
};
const DEFAULT_SLEW_TYPE = 'h';
const SLEW_TYPES = {
  h: (x, over) => x - over
};
_functions.slew = {
  fun: args => {
    const {
      r: rate,
      t: type,
      i: ival
    } = (0, _util.expand_args)({
      r: 0.5,
      t: DEFAULT_SLEW_TYPE,
      i: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [rv, iv] = (0, _util.freeze_values)([rate, ival], run_args, gen_args);

      if (typeof gen_args.private_state.time === 'undefined') {
        gen_args.private_state.time = (0, _util.get_time)(gen_args, run_args);
        gen_args.private_state.prev = input;
        gen_args.private_state.tgt = input;
        return input;
      }

      const tgt = (0, _util.undefault)(input, gen_args.private_state.tgt);

      if (typeof tgt === 'undefined') {
        return _util.ud;
      }

      if (typeof gen_args.private_state.prev === 'undefined') {
        gen_args.private_state.prev = tgt;
      }

      const time = (0, _util.get_time)(gen_args, run_args);
      const tdiff = time - gen_args.private_state.time;
      const vdiff = tgt - gen_args.private_state.prev;
      gen_args.private_state.time = time;
      gen_args.private_state.tgt = tgt;
      const over = vdiff - tdiff / iv * rv;
      let nv = tgt;

      if (over > 0) {
        let tv = (0, _util.freeze_values)(type, run_args, gen_args);

        if (typeof tv !== 'string') {
          tv = DEFAULT_SLEW_TYPE;
        }

        tv = SLEW_TYPES[tv];

        if (typeof tv === 'undefined') {
          tv = SLEW_TYPES[DEFAULT_SLEW_TYPE];
        }

        nv = tv(nv, over);
      }

      gen_args.private_state.prev = nv;
      return nv;
    };
  }
};
_functions.map = {
  fun: args => {
    const {
      f: func
    } = (0, _util.expand_args)({
      f: x => x
    }, args);
    return (value, gen_args, run_args) => func(value, gen_args, ...run_args);
  }
};
_functions.clip = {
  doc: {
    title: "Clip a value between two thresholds",
    command: ["clip(u, l, s)", "clip({u, l, s})"],
    params: {
      u: "Upper bound. Default is 1",
      l: "Lower bound. Default is 0",
      s: "Scale to apply to inpcoming value *before* clipping. Default is 1",
      o: "Offset to add *after* clipping. Default is 0"
    },
    return: "A value in the range of `[l, u] + o`.",
    description: `Allows you to ensure the values are within an aceptable
range for the following operations.`,
    examples: [`shape(3).rotate(
    L.set(L.time(), 'init')
        .use('init')
        .map((x, {time}) => time - x)
        .clip(10)
        .map((x) => (10 - x)/10)
        .rad()
).out(o0);`]
  },
  fun: args => {
    const {
      u: upper,
      l: lower,
      s: scale,
      o: offset
    } = (0, _util.expand_args)({
      u: 1,
      l: 0,
      s: 1,
      o: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [uv, lv, sv, ov] = (0, _util.freeze_values)([upper, lower, scale, offset], run_args, gen_args);
      const v = (0, _util.undefault)(input, 0) * sv;
      return (v > uv ? uv : v < lv ? lv : v) + ov;
    };
  }
};
const functions = {
  __category: "modifiers",
  __doc: {
    title: "Modifier functions",
    description: `Functions that modify Hydra LFO values in some way or
another.`
  },
  ..._functions
};
exports.functions = functions;

},{"./util":11}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const _functions = {};
_functions.speed = {
  fun: args => {
    const {
      v: value,
      m: mix
    } = (0, _util.expand_args)({
      v: _util.ud,
      m: _util.ud
    }, args);
    return (input, gen_args, run_args) => {
      const [vv, mv] = (0, _util.freeze_values)([value, mix], run_args, gen_args);
      let time_scale = 1;

      if (typeof vv === 'undefined') {
        if (typeof input !== 'undefined') {
          time_scale = input;
        }
      } else if (typeof input === 'undefined') {
        time_scale = vv;
      } else if (typeof mv === 'undefined') {
        time_scale = vv;
      } else {
        time_scale = (0, _util.mix_values)(vv, input, mv);
      }

      gen_args.values.time = time_scale * gen_args.values.time;
      return input;
    };
  }
};
_functions.fast = {
  fun: args => {
    const {
      s: scale,
      o: offset,
      m: mix
    } = (0, _util.expand_args)({
      s: _util.ud,
      o: 0,
      m: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov, mv] = (0, _util.freeze_values)([scale, offset, mix], run_args, gen_args);
      let time_scale = 1;

      if (typeof input === 'undefined') {
        if (typeof sv !== 'undefined') {
          time_scale = sv;
        }
      } else if (typeof sv === 'undefined') {
        time_scale = input;
      } else {
        time_scale = (0, _util.mix_values)(sv, input, mv);
      }

      gen_args.values.time = time_scale * gen_args.values.time + ov;
      return input;
    };
  }
};
_functions.slow = {
  fun: args => {
    const {
      s: scale,
      o: offset,
      m: mix
    } = (0, _util.expand_args)({
      s: _util.ud,
      o: 0,
      m: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov, mv] = (0, _util.freeze_values)([scale, offset, mix], run_args, gen_args);
      let time_scale = 1;

      if (typeof input === 'undefined') {
        if (typeof sv !== 'undefined') {
          time_scale = sv;
        }
      } else if (typeof sv === 'undefined') {
        time_scale = input;
      } else {
        time_scale = (0, _util.mix_values)(sv, input, mv);
      }

      if (time_scale === 0) {
        time_scale = 1;
      }

      gen_args.values.time = gen_args.values.time / time_scale + ov;
      return input;
    };
  }
};
_functions.time = {
  fun: args => {
    const {
      s: scale,
      o: offset
    } = (0, _util.expand_args)({
      s: 1,
      o: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov] = (0, _util.freeze_values)([scale, offset], run_args, gen_args);
      return (0, _util.get_time)(gen_args, run_args) * sv + ov;
    };
  }
};
const functions = {
  __category: "time",
  __doc: {
    title: "Time functions",
    description: `Functions that affect the time such as slowing it down
or speeding it up`
  },
  ..._functions
};
exports.functions = functions;

},{"./util":11}],11:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cb_to_promise = exports.uuid = exports.get_global_env = exports.freeze_values = exports.get_bpm = exports.get_time = exports.expand_args = exports.undefault = exports.mix_values = exports.CANARY = exports.ud = void 0;

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const UUID = require("pure-uuid"); // eslint-disable-next-line no-empty-function


const ud = function () {}();

exports.ud = ud;
const CANARY = "__hydralfo_func";
exports.CANARY = CANARY;

const mix_values = (a, b, m) => m === 0 ? a : m === 1 ? b : a * (1 - m) + b * m;

exports.mix_values = mix_values;

const undefault = (x, def) => typeof x === 'undefined' ? def : x;

exports.undefault = undefault;

const expand_args = (arg_def, args) => {
  const vals = { ...undefault(arg_def, {})
  };

  if (typeof args !== 'undefined' && args.length > 0) {
    const [first] = args;

    if (typeof first === 'object' && !Array.isArray(first)) {
      for (const x in arg_def) {
        if (x in first) {
          vals[x] = first[x];
        }
      }
    } else {
      let defkeys = Object.keys(arg_def);
      defkeys = defkeys.slice(0, Math.min(defkeys.length, args.length));
      defkeys.forEach((k, i) => {
        vals[k] = args[i];
      });
    }
  }

  Object.keys(vals).forEach(x => {
    const vx = vals[x];
    const ax = arg_def[x];

    if (typeof vx === 'function') {
      vals[x] = (input, call_gen_args, call_args) => {
        let nargs = call_args;

        if (typeof nargs === 'undefined') {
          nargs = [{}];
        }

        if (CANARY in vx) {
          // make a 1 level copy of the call args for the call to the sub-chain
          const new_call_args = [];
          nargs.forEach(arg => {
            if (typeof arg === 'object') {
              if (Array.isArray(arg)) {
                new_call_args.push([...arg]);
              } else if ("call" in arg) {
                new_call_args.push(arg);
              } else {
                new_call_args.push({ ...arg
                });
              }
            } else {
              new_call_args.push(arg);
            }
          });
          return undefault(vx.run(new_call_args), ax);
        }

        return undefault(vx(input, call_gen_args, nargs), ax);
      };
    } else if (typeof vx === 'undefined') {
      vals[x] = ax;
    } else {
      vals[x] = vx;
    }
  });
  return vals;
};

exports.expand_args = expand_args;

const get_time = (gen_args, run_args, allow_undef = false) => {
  let namedargs = run_args;

  if (Array.isArray(namedargs) && namedargs.length > 0) {
    [namedargs] = namedargs;
  }

  if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
    const {
      time
    } = namedargs;

    if (typeof time !== 'undefined') {
      return time;
    }
  }

  if (typeof gen_args !== 'undefined') {
    if (typeof gen_args.values !== 'undefined' && typeof gen_args.values.time !== 'undefined') {
      return gen_args.values.time;
    }
  }

  if (typeof window !== 'undefined' && typeof window.time !== 'undefined') {
    return window.time;
  }

  if (allow_undef) {
    return ud;
  }

  return new Date().getTime() / 1000.0;
};

exports.get_time = get_time;

const get_bpm = (gen_args, run_args, allow_undef = false) => {
  let namedargs = run_args;

  if (Array.isArray(namedargs) && namedargs.length > 0) {
    [namedargs] = namedargs;
  }

  if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
    const {
      bpm
    } = namedargs;

    if (typeof bpm !== 'undefined') {
      return bpm;
    }
  }

  if (typeof gen_args !== 'undefined' && typeof gen_args.values !== 'undefined' && gen_args.values.bpm !== 'undefined') {
    return gen_args.values.bpm;
  }

  if (allow_undef) {
    return ud;
  }

  return 60;
};

exports.get_bpm = get_bpm;

const freeze_values = (v, args, gen_args) => {
  if (typeof v === 'undefined') {
    return v;
  }

  if (typeof v === 'function') {
    return v(...args, gen_args);
  }

  if (Array.isArray(v)) {
    return v.map(x => freeze_values(x, args, gen_args));
  }

  return v;
};

exports.freeze_values = freeze_values;

const get_global_env = () => {
  if (typeof window !== 'undefined') {
    return window;
  }

  return global;
};

exports.get_global_env = get_global_env;

const uuid = () => new UUID(4).format();

exports.uuid = uuid;

const cb_to_promise = fn => new Promise((res, rej) => {
  const mycb = (...args) => {
    res(args);
  };

  try {
    fn(mycb);
  } catch (err) {
    rej(err);
  }
});

exports.cb_to_promise = cb_to_promise;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"pure-uuid":4}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = exports.get_doc = void 0;

var _util = require("./components/util");

var _maths = require("./components/maths");

var _generators = require("./components/generators");

var _time = require("./components/time");

var _general = require("./components/general");

var _modifiers = require("./components/modifiers");

var _async = require("./components/async");

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */
const DOCUMENTATION = {};
const BUILTIN_FUNCTIONS = [_maths.functions, _generators.functions, _time.functions, _general.functions, _modifiers.functions, _async.functions].reduce((prev, ob) => {
  let category = "other";

  if ('__category' in ob) {
    category = ob.__category;
  }

  if (!(category in DOCUMENTATION)) {
    DOCUMENTATION[category] = {};
  }

  category = DOCUMENTATION[category];

  if ('__doc' in ob) {
    category.__doc = ob.__doc;
  }

  Object.entries(ob).filter(([name]) => name.indexOf("__") !== 0).forEach(([name, value]) => {
    const {
      fun,
      doc
    } = value;
    category[name] = doc;
    prev[name] = fun;
  });
  return prev;
}, {});

const get_doc = () => DOCUMENTATION;

exports.get_doc = get_doc;

const run_calls = (options, global_state, instance_state, calls, args) => {
  const run_options = { ...{
      return_undef: false
    },
    ...options
  };
  let run_args = args;

  if (typeof run_args === 'undefined' || run_args.length === 0) {
    run_args = [{}];
  }

  if (typeof run_args[0] === 'undefined') {
    run_args[0] = {};
  }

  const gen_args = {
    input: _util.ud,
    current_value: "val",
    values: {
      val: _util.ud,
      initial_args: args,
      ...run_args[0]
    },
    global_state,
    instance_state,
    private_state: {}
  };
  gen_args.values.initial_time = (0, _util.get_time)(gen_args.values, run_args);
  gen_args.values.time = gen_args.values.initial_time;
  gen_args.values.get_bpm = (0, _util.get_bpm)(gen_args.values, gen_args.values);
  run_args[0] = gen_args.values;
  calls.forEach(([fncall, private_state]) => {
    gen_args.private_state = private_state;
    gen_args.input = gen_args.values[gen_args.current_value];
    const res = fncall(gen_args.input, gen_args, run_args);
    gen_args.values[gen_args.current_value] = res;
  });
  const rval = gen_args.values[gen_args.current_value];

  if (typeof rval === 'undefined' && !run_options.return_undef) {
    return (0, _util.undefault)(gen_args.values.time, 0);
  }

  return rval;
};

const sub_call = (global_state, prev_calls, fun) => {
  const calls = prev_calls.map(x => [x, {}]);
  const instance_state = {};

  if (typeof fun !== 'undefined') {
    calls.push([fun, {}]);
  }

  const option_call = (options, args) => run_calls(options, global_state, instance_state, calls, args);

  const run_function = (...args) => option_call({}, args);

  run_function.run = run_function;

  run_function.gen = options => (...args) => option_call(options, args);

  run_function[_util.CANARY] = true;
  Object.entries(BUILTIN_FUNCTIONS).forEach(([name, gen]) => {
    if (name in run_function && !(name in Object.getOwnPropertyNames())) {
      throw new Error(`${name} already exists on parents of run_function`);
    }

    run_function[name] = (...args) => sub_call(global_state, calls.map(([call]) => call), gen(args));
  });
  return run_function;
};

const make_new_lfo = state => {
  const fdef = {};
  const global_state = (0, _util.undefault)(state, {});
  global_state.cleanup = [];
  const functions = BUILTIN_FUNCTIONS;
  Object.keys(functions).forEach(name => {
    fdef[name] = (...args) => sub_call(global_state, [])[name](...args);
  });

  fdef.__release = new_lfo => {
    global_state.cleanup.forEach(cfn => {
      cfn(global_state, new_lfo);
    });
  };

  return fdef;
};

const GLOBAL_INIT_ID = "__hydralfo_global";

const init = args => {
  const {
    state = _util.ud,
    init_global = true,
    force = false
  } = (0, _util.undefault)(args, {});
  const new_lfo = make_new_lfo(state);

  if (!init_global) {
    return new_lfo;
  }

  const env = (0, _util.get_global_env)();

  if (typeof env !== 'undefined') {
    if (GLOBAL_INIT_ID in env) {
      const old_lfo = env[GLOBAL_INIT_ID];

      if (typeof old_lfo === 'object') {
        if ('__release' in old_lfo) {
          old_lfo.__release(new_lfo);
        }

        if (!force) {
          return old_lfo;
        }
      }
    }

    env[GLOBAL_INIT_ID] = new_lfo;
  }

  return new_lfo;
};

exports.init = init;

},{"./components/async":5,"./components/general":6,"./components/generators":7,"./components/maths":8,"./components/modifiers":9,"./components/time":10,"./components/util":11}]},{},[12])(12)
});
//# sourceMappingURL=hydralfo.js.map
