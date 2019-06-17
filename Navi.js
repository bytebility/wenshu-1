//base 64 necessarity -----------------------------
var buffer = require("buffer").Buffer;
var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var b64tab = function(bin) {
    var t = {};
    for (var i = 0, l = bin.length; i < l; i++) {
        t[bin.charAt(i)] = i
    }
    return t
}(b64chars);
var fromCharCode = String.fromCharCode;
var cb_utob = function(c) {
    if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 128 ? c : cc < 2048 ? (fromCharCode(192 | (cc >>> 6)) + fromCharCode(128 | (cc & 63))) : (fromCharCode(224 | ((cc >>> 12) & 15)) + fromCharCode(128 | ((cc >>> 6) & 63)) + fromCharCode(128 | (cc & 63)))
    } else {
        var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
        return (fromCharCode(240 | ((cc >>> 18) & 7)) + fromCharCode(128 | ((cc >>> 12) & 63)) + fromCharCode(128 | ((cc >>> 6) & 63)) + fromCharCode(128 | (cc & 63)))
    }
};
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
var utob = function(u) {
    return u.replace(re_utob, cb_utob)
};
var cb_encode = function(ccc) {
    var padlen = [0, 2, 1][ccc.length % 3]
        , ord = ccc.charCodeAt(0) << 16 | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0))
        , chars = [b64chars.charAt(ord >>> 18), b64chars.charAt((ord >>> 12) & 63), padlen >= 2 ? "=" : b64chars.charAt((ord >>> 6) & 63), padlen >= 1 ? "=" : b64chars.charAt(ord & 63)];
    return chars.join("")
};
var Base64_btoa = function(b) {
    return b.replace(/[\s\S]{1,3}/g, cb_encode)
};
var _encode = buffer ? function(u) {
        return (new buffer(u)).toString("base64")
    }
    : function(u) {
        return Base64_btoa(utob(u))
    }
;
var encode = function(u, urisafe) {
    return !urisafe ? _encode(u) : _encode(u).replace(/[+\/]/g, function(m0) {
        return m0 == "+" ? "-" : "_"
    }).replace(/=/g, "")
};
var encodeURI = function(u) {
    return encode(u, true)
};
var re_btou = new RegExp(["[\xC0-\xDF][\x80-\xBF]", "[\xE0-\xEF][\x80-\xBF]{2}", "[\xF0-\xF7][\x80-\xBF]{3}"].join("|"),"g");
var cb_btou = function(cccc) {
    switch (cccc.length) {
        case 4:
            var cp = ((7 & cccc.charCodeAt(0)) << 18) | ((63 & cccc.charCodeAt(1)) << 12) | ((63 & cccc.charCodeAt(2)) << 6) | (63 & cccc.charCodeAt(3))
                , offset = cp - 65536;
            return (fromCharCode((offset >>> 10) + 55296) + fromCharCode((offset & 1023) + 56320));
        case 3:
            return fromCharCode(((15 & cccc.charCodeAt(0)) << 12) | ((63 & cccc.charCodeAt(1)) << 6) | (63 & cccc.charCodeAt(2)));
        default:
            return fromCharCode(((31 & cccc.charCodeAt(0)) << 6) | (63 & cccc.charCodeAt(1)))
    }
};
var btou = function(b) {
    return b.replace(re_btou, cb_btou)
};
var cb_decode = function(cccc) {
    var len = cccc.length
        , padlen = len % 4
        , n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0)
        , chars = [fromCharCode(n >>> 16), fromCharCode((n >>> 8) & 255), fromCharCode(n & 255)];
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join("")
};
var Base64_atob = function(a) {
    return a.replace(/[\s\S]{1,4}/g, cb_decode)
};
var _decode =
    // buffer ? function(a) {
    //     return (new buffer(a,"base64")).toString()
    // }
    // :
    function(a) {
        return btou(Base64_atob(a))
    }
;
var decode = function(a) {
    return _decode(a.replace(/[-_]/g, function(m0) {
        return m0 == "-" ? "+" : "/"
    }).replace(/[^A-Za-z0-9\+\/]/g, ""))
};
Base64_Zip = {
    VERSION: 'any_version',
    atob: Base64_atob,
    btoa: Base64_btoa,
    fromBase64: decode,
    toBase64: encode,
    utob: utob,
    encode: encode,
    encodeURI: encodeURI,
    btou: btou,
    decode: decode
};
//base 64 necessarity -----------------------------


// RawInflate.js  necessarity---------- downward
var zip_WSIZE = 32768;
var zip_STORED_BLOCK = 0;
var zip_STATIC_TREES = 1;
var zip_DYN_TREES = 2;
var zip_lbits = 9;
var zip_dbits = 6;
var zip_INBUFSIZ = 32768;
var zip_INBUF_EXTRA = 64;
var zip_slide;
var zip_wp;
var zip_fixed_tl = null;
var zip_fixed_td;
var zip_fixed_bl, zip_fixed_bd;
var zip_bit_buf;
var zip_bit_len;
var zip_method;
var zip_eof;
var zip_copy_leng;
var zip_copy_dist;
var zip_tl, zip_td;
var zip_bl, zip_bd;
var zip_inflate_data;
var zip_inflate_pos;
var zip_MASK_BITS = new Array(0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535);
var zip_cplens = new Array(3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0);
var zip_cplext = new Array(0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99);
var zip_cpdist = new Array(1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577);
var zip_cpdext = new Array(0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13);
var zip_border = new Array(16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15);
var zip_HuftList = function() {
    this.next = null;
    this.list = null
};
var zip_HuftNode = function() {
    this.e = 0;
    this.b = 0;
    this.n = 0;
    this.t = null
};
var zip_HuftBuild = function(b, n, s, d, e, mm) {
    this.BMAX = 16;
    this.N_MAX = 288;
    this.status = 0;
    this.root = null;
    this.m = 0;
    var a;
    var c = new Array(this.BMAX + 1);
    var el;
    var f;
    var g;
    var h;
    var i;
    var j;
    var k;
    var lx = new Array(this.BMAX + 1);
    var p;
    var pidx;
    var q;
    var r = new zip_HuftNode();
    var u = new Array(this.BMAX);
    var v = new Array(this.N_MAX);
    var w;
    var x = new Array(this.BMAX + 1);
    var xp;
    var y;
    var z;
    var o;
    var tail;
    tail = this.root = null;
    for (i = 0; i < c.length; i++) {
        c[i] = 0
    }
    for (i = 0; i < lx.length; i++) {
        lx[i] = 0
    }
    for (i = 0; i < u.length; i++) {
        u[i] = null
    }
    for (i = 0; i < v.length; i++) {
        v[i] = 0
    }
    for (i = 0; i < x.length; i++) {
        x[i] = 0
    }
    el = n > 256 ? b[256] : this.BMAX;
    p = b;
    pidx = 0;
    i = n;
    do {
        c[p[pidx]]++;
        pidx++
    } while (--i > 0);if (c[0] == n) {
        this.root = null;
        this.m = 0;
        this.status = 0;
        return
    }
    for (j = 1; j <= this.BMAX; j++) {
        if (c[j] != 0) {
            break
        }
    }
    k = j;
    if (mm < j) {
        mm = j
    }
    for (i = this.BMAX; i != 0; i--) {
        if (c[i] != 0) {
            break
        }
    }
    g = i;
    if (mm > i) {
        mm = i
    }
    for (y = 1 << j; j < i; j++,
        y <<= 1) {
        if ((y -= c[j]) < 0) {
            this.status = 2;
            this.m = mm;
            return
        }
    }
    if ((y -= c[i]) < 0) {
        this.status = 2;
        this.m = mm;
        return
    }
    c[i] += y;
    x[1] = j = 0;
    p = c;
    pidx = 1;
    xp = 2;
    while (--i > 0) {
        x[xp++] = (j += p[pidx++])
    }
    p = b;
    pidx = 0;
    i = 0;
    do {
        if ((j = p[pidx++]) != 0) {
            v[x[j]++] = i
        }
    } while (++i < n);n = x[g];
    x[0] = i = 0;
    p = v;
    pidx = 0;
    h = -1;
    w = lx[0] = 0;
    q = null;
    z = 0;
    for (; k <= g; k++) {
        a = c[k];
        while (a-- > 0) {
            while (k > w + lx[1 + h]) {
                w += lx[1 + h];
                h++;
                z = (z = g - w) > mm ? mm : z;
                if ((f = 1 << (j = k - w)) > a + 1) {
                    f -= a + 1;
                    xp = k;
                    while (++j < z) {
                        if ((f <<= 1) <= c[++xp]) {
                            break
                        }
                        f -= c[xp]
                    }
                }
                if (w + j > el && w < el) {
                    j = el - w
                }
                z = 1 << j;
                lx[1 + h] = j;
                q = new Array(z);
                for (o = 0; o < z; o++) {
                    q[o] = new zip_HuftNode()
                }
                if (tail == null) {
                    tail = this.root = new zip_HuftList()
                } else {
                    tail = tail.next = new zip_HuftList()
                }
                tail.next = null;
                tail.list = q;
                u[h] = q;
                if (h > 0) {
                    x[h] = i;
                    r.b = lx[h];
                    r.e = 16 + j;
                    r.t = q;
                    j = (i & ((1 << w) - 1)) >> (w - lx[h]);
                    u[h - 1][j].e = r.e;
                    u[h - 1][j].b = r.b;
                    u[h - 1][j].n = r.n;
                    u[h - 1][j].t = r.t
                }
            }
            r.b = k - w;
            if (pidx >= n) {
                r.e = 99
            } else {
                if (p[pidx] < s) {
                    r.e = (p[pidx] < 256 ? 16 : 15);
                    r.n = p[pidx++]
                } else {
                    r.e = e[p[pidx] - s];
                    r.n = d[p[pidx++] - s]
                }
            }
            f = 1 << (k - w);
            for (j = i >> w; j < z; j += f) {
                q[j].e = r.e;
                q[j].b = r.b;
                q[j].n = r.n;
                q[j].t = r.t
            }
            for (j = 1 << (k - 1); (i & j) != 0; j >>= 1) {
                i ^= j
            }
            i ^= j;
            while ((i & ((1 << w) - 1)) != x[h]) {
                w -= lx[h];
                h--
            }
        }
    }
    this.m = lx[1];
    this.status = ((y != 0 && g != 1) ? 1 : 0)
};
function zip_GET_BYTE() {

    // ignore the error case here
    // if (zip_inflate_data.length == zip_inflate_pos) {
    //     return -1

    var charcode = zip_inflate_data.charCodeAt(zip_inflate_pos++);
    return charcode & 255
}
var zip_NEEDBITS = function(n) {
    while (zip_bit_len < n) {
        zip_bit_buf |= zip_GET_BYTE() << zip_bit_len;
        zip_bit_len += 8
    }
};
var zip_GETBITS = function(n) {
    return zip_bit_buf & zip_MASK_BITS[n]
};
var zip_DUMPBITS = function(n) {
    zip_bit_buf >>= n;
    zip_bit_len -= n
};
var zip_inflate_codes = function(buff, off, size) {
    var e;
    var t;
    var n;
    if (size == 0) {
        return 0
    }
    n = 0;
    for (; ; ) {
        zip_NEEDBITS(zip_bl);
        t = zip_tl.list[zip_GETBITS(zip_bl)];
        e = t.e;
        while (e > 16) {
            if (e == 99) {
                return -1
            }
            zip_DUMPBITS(t.b);
            e -= 16;
            zip_NEEDBITS(e);
            t = t.t[zip_GETBITS(e)];
            e = t.e
        }
        zip_DUMPBITS(t.b);
        if (e == 16) {
            zip_wp &= zip_WSIZE - 1;
            buff[off + n++] = zip_slide[zip_wp++] = t.n;
            if (n == size) {
                return size
            }
            continue
        }
        if (e == 15) {
            break
        }
        zip_NEEDBITS(e);
        zip_copy_leng = t.n + zip_GETBITS(e);
        zip_DUMPBITS(e);
        zip_NEEDBITS(zip_bd);
        t = zip_td.list[zip_GETBITS(zip_bd)];
        e = t.e;
        while (e > 16) {
            if (e == 99) {
                return -1
            }
            zip_DUMPBITS(t.b);
            e -= 16;
            zip_NEEDBITS(e);
            t = t.t[zip_GETBITS(e)];
            e = t.e
        }
        zip_DUMPBITS(t.b);
        zip_NEEDBITS(e);
        zip_copy_dist = zip_wp - t.n - zip_GETBITS(e);
        zip_DUMPBITS(e);
        while (zip_copy_leng > 0 && n < size) {
            zip_copy_leng--;
            zip_copy_dist &= zip_WSIZE - 1;
            zip_wp &= zip_WSIZE - 1;
            buff[off + n++] = zip_slide[zip_wp++] = zip_slide[zip_copy_dist++]
        }
        if (n == size) {
            return size
        }
    }
    zip_method = -1;
    return n
};
var zip_inflate_stored = function(buff, off, size) {
    var n;
    n = zip_bit_len & 7;
    zip_DUMPBITS(n);
    zip_NEEDBITS(16);
    n = zip_GETBITS(16);
    zip_DUMPBITS(16);
    zip_NEEDBITS(16);
    if (n != ((~zip_bit_buf) & 65535)) {
        return -1
    }
    zip_DUMPBITS(16);
    zip_copy_leng = n;
    n = 0;
    while (zip_copy_leng > 0 && n < size) {
        zip_copy_leng--;
        zip_wp &= zip_WSIZE - 1;
        zip_NEEDBITS(8);
        buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
        zip_DUMPBITS(8)
    }
    if (zip_copy_leng == 0) {
        zip_method = -1
    }
    return n
};
var zip_inflate_fixed = function(buff, off, size) {
    if (zip_fixed_tl == null) {
        var i;
        var l = new Array(288);
        var h;
        for (i = 0; i < 144; i++) {
            l[i] = 8
        }
        for (; i < 256; i++) {
            l[i] = 9
        }
        for (; i < 280; i++) {
            l[i] = 7
        }
        for (; i < 288; i++) {
            l[i] = 8
        }
        zip_fixed_bl = 7;
        h = new zip_HuftBuild(l,288,257,zip_cplens,zip_cplext,zip_fixed_bl);
        if (h.status != 0) {
            alert("HufBuild error: " + h.status);
            return -1
        }
        zip_fixed_tl = h.root;
        zip_fixed_bl = h.m;
        for (i = 0; i < 30; i++) {
            l[i] = 5
        }
        zip_fixed_bd = 5;
        h = new zip_HuftBuild(l,30,0,zip_cpdist,zip_cpdext,zip_fixed_bd);
        if (h.status > 1) {
            zip_fixed_tl = null;
            alert("HufBuild error: " + h.status);
            return -1
        }
        zip_fixed_td = h.root;
        zip_fixed_bd = h.m
    }
    zip_tl = zip_fixed_tl;
    zip_td = zip_fixed_td;
    zip_bl = zip_fixed_bl;
    zip_bd = zip_fixed_bd;
    return zip_inflate_codes(buff, off, size)
};
var zip_inflate_dynamic = function(buff, off, size) {
    var i;
    var j;
    var l;
    var n;
    var t;
    var nb;
    var nl;
    var nd;
    var ll = new Array(286 + 30);
    var h;
    for (i = 0; i < ll.length; i++) {
        ll[i] = 0
    }
    zip_NEEDBITS(5);
    nl = 257 + zip_GETBITS(5);
    zip_DUMPBITS(5);
    zip_NEEDBITS(5);
    nd = 1 + zip_GETBITS(5);
    zip_DUMPBITS(5);
    zip_NEEDBITS(4);
    nb = 4 + zip_GETBITS(4);
    zip_DUMPBITS(4);
    if (nl > 286 || nd > 30) {
        return -1
    }
    for (j = 0; j < nb; j++) {
        zip_NEEDBITS(3);
        ll[zip_border[j]] = zip_GETBITS(3);
        zip_DUMPBITS(3)
    }
    for (; j < 19; j++) {
        ll[zip_border[j]] = 0
    }
    zip_bl = 7;
    h = new zip_HuftBuild(ll,19,19,null,null,zip_bl);
    if (h.status != 0) {
        return -1
    }
    zip_tl = h.root;
    zip_bl = h.m;
    n = nl + nd;
    i = l = 0;
    while (i < n) {
        zip_NEEDBITS(zip_bl);
        t = zip_tl.list[zip_GETBITS(zip_bl)];
        j = t.b;
        zip_DUMPBITS(j);
        j = t.n;
        if (j < 16) {
            ll[i++] = l = j
        } else {
            if (j == 16) {
                zip_NEEDBITS(2);
                j = 3 + zip_GETBITS(2);
                zip_DUMPBITS(2);
                if (i + j > n) {
                    return -1
                }
                while (j-- > 0) {
                    ll[i++] = l
                }
            } else {
                if (j == 17) {
                    zip_NEEDBITS(3);
                    j = 3 + zip_GETBITS(3);
                    zip_DUMPBITS(3);
                    if (i + j > n) {
                        return -1
                    }
                    while (j-- > 0) {
                        ll[i++] = 0
                    }
                    l = 0
                } else {
                    zip_NEEDBITS(7);
                    j = 11 + zip_GETBITS(7);
                    zip_DUMPBITS(7);
                    if (i + j > n) {
                        return -1
                    }
                    while (j-- > 0) {
                        ll[i++] = 0
                    }
                    l = 0
                }
            }
        }
    }
    zip_bl = zip_lbits;
    h = new zip_HuftBuild(ll,nl,257,zip_cplens,zip_cplext,zip_bl);
    if (zip_bl == 0) {
        h.status = 1
    }
    if (h.status != 0) {
        if (h.status == 1) {}
        return -1
    }
    zip_tl = h.root;
    zip_bl = h.m;
    for (i = 0; i < nd; i++) {
        ll[i] = ll[i + nl]
    }
    zip_bd = zip_dbits;
    h = new zip_HuftBuild(ll,nd,0,zip_cpdist,zip_cpdext,zip_bd);
    zip_td = h.root;
    zip_bd = h.m;
    if (zip_bd == 0 && nl > 257) {
        return -1
    }
    if (h.status == 1) {}
    if (h.status != 0) {
        return -1
    }
    return zip_inflate_codes(buff, off, size)
};
var zip_inflate_start = function() {
    var i;
    if (zip_slide == null) {
        zip_slide = new Array(2 * zip_WSIZE)
    }
    zip_wp = 0;
    zip_bit_buf = 0;
    zip_bit_len = 0;
    zip_method = -1;
    zip_eof = false;
    zip_copy_leng = zip_copy_dist = 0;
    zip_tl = null
};
var zip_inflate_internal = function(buff, off, size) {
    var n, i;
    n = 0;
    while (n < size) {
        if (zip_eof && zip_method == -1) {
            return n
        }
        if (zip_copy_leng > 0) {
            if (zip_method != zip_STORED_BLOCK) {
                while (zip_copy_leng > 0 && n < size) {
                    zip_copy_leng--;
                    zip_copy_dist &= zip_WSIZE - 1;
                    zip_wp &= zip_WSIZE - 1;
                    buff[off + n++] = zip_slide[zip_wp++] = zip_slide[zip_copy_dist++]
                }
            } else {
                while (zip_copy_leng > 0 && n < size) {
                    zip_copy_leng--;
                    zip_wp &= zip_WSIZE - 1;
                    zip_NEEDBITS(8);
                    buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
                    zip_DUMPBITS(8)
                }
                if (zip_copy_leng == 0) {
                    zip_method = -1
                }
            }
            if (n == size) {
                return n
            }
        }
        if (zip_method == -1) {
            if (zip_eof) {
                break
            }
            zip_NEEDBITS(1);
            // if (zip_GETBITS(1) != 0) {
            //     zip_eof = true
            // }
            zip_eof = true;
            zip_DUMPBITS(1);
            zip_NEEDBITS(2);
            zip_method = zip_GETBITS(2);
            zip_DUMPBITS(2);
            zip_tl = null;
            zip_copy_leng = 0
            // console.log('ERROR: zip_method = -1')
        }
        switch (zip_method) {
            case 0:
                i = zip_inflate_stored(buff, off + n, size - n);
                break;
            case 1:
                if (zip_tl != null) {
                    i = zip_inflate_codes(buff, off + n, size - n)
                } else {
                    i = zip_inflate_fixed(buff, off + n, size - n)
                }
                break;
            case 2:
                if (zip_tl != null) {
                    i = zip_inflate_codes(buff, off + n, size - n)
                } else {
                    i = zip_inflate_dynamic(buff, off + n, size - n)
                }
                break;
            default:
                i = -1;
                break
        }
        if (i == -1) {
            if (zip_eof) {
                return 0
            }
            return -1
        }
        n += i
    }
    return n
};
var zip_inflate = function(str) {
    var i, j;
    zip_inflate_start();
    zip_inflate_data = str;
    zip_inflate_pos = 0;
    var buff = new Array(1024);
    var aout = [];
    while ((i = zip_inflate_internal(buff, 0, buff.length)) > 0) {
        var cbuf = new Array(i);
        for (j = 0; j < i; j++) {
            cbuf[j] = String.fromCharCode(buff[j])
        }
        aout[aout.length] = cbuf.join("")
    }
    zip_inflate_data = null;
    return aout.join("")
};
var RawDeflate = new Object();
RawDeflate.inflate = zip_inflate;
// RawInflate.js  necessarity---------- upward

function unzip(b64Data) {
    var strData;
    // if (!window.atob) {} else {}
    var charData;
    // if (!Array.prototype.map) {} else {}
    strData = Base64_Zip.btou(RawDeflate.inflate(Base64_Zip.fromBase64(b64Data)));
    return strData
}

// import cryptoJS files
var com = {};
var CryptoJS = require('crypto-js');




com.str = {
    _KEY: "12345678900000001234567890000000",
    _IV: "abcd134556abcedf",
    Encrypt: function(str) {
        var key = CryptoJS.enc.Utf8.parse(this._KEY);
        var iv = CryptoJS.enc.Utf8.parse(this._IV);
        var encrypted = "";
        var srcs = CryptoJS.enc.Utf8.parse(str);
        encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.ciphertext.toString()
    },
    Decrypt: function(str) {
        var result = com.str.DecryptInner(str);
        try {
            var newstr = com.str.DecryptInner(result);
            if (newstr != "") {
                result = newstr
            }
        } catch (ex) {
            var msg = ex
        }
        return result
    },
    DecryptInner: function(str) {
        console.log('inside DecryptInner, key = ',this._KEY);
        var key = CryptoJS.enc.Utf8.parse(this._KEY);
        var iv = CryptoJS.enc.Utf8.parse(this._IV);
        var encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        var decrypt = CryptoJS.AES.decrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        var result = decryptedStr.toString();
        try {
            result = Decrypt(result)
        } catch (ex) {
            var msg = ex
        }
        return result
    }
};

// call Navi to gei docid
function Navi(id,key,keyword='') {
    com.str._KEY = key;
    // com.str._KEY = key;
    var unzipid = unzip(id);
    // console.log('unzipid = ',unzipid);
    try {
        var realid = com.str.Decrypt(unzipid);
        // console.log(realid)
        if (realid == "") {
            return -1;
        } else {
            // var url = "/content/content?DocID=" + realid + "&KeyWord=" + encodeURI(keyword);
            // Changed here! return a url postfix now, not directly navigate
            return realid;
        }
    } catch (ex) {
        return -1;
    }
}

function jsfuck(RunEvalString){
    var jsfuckString = unzip(RunEvalString);
    // a is a array save 3 lines of jsfuck(string objects)
    funcString = eval(jsfuckString.slice(0,-3)+';').toString();
    // var a = jsfuckString.split(';');
    // eval(a[0]);
    // eval(a[2])
    // // cancel self execute ()
    // a[3] = a[3].slice(0,-3)+';';
    // b = eval(a[3]);
    // print the anonymous function
    // funcString = b.toString();
    // console.log(funcString);
    key = funcString.split('"')[1];
    // console.log('KEY =',key );
    com.str._KEY = key;
    return key;
}

function checkcom(){
    return com.str._KEY;
}


// test method

// a = jsfuck("w61Zw5vCjsKCMBDDvRbCjA9tw5jDrA8Qwp/DvMKEfcKcNGTCgzceVkxlwp/CjMO/wr7DgCoCwq0CUhrCqichQ2jCpzPDp8KcacKhDcOzXcK8Wh8jGR/DksOFVyrDo8O9w7ZzI8KTwp/DpcOuWy7Ck8OVwprDucKeTwJmw5LDpgMiw4DCvMOHDHkFIm/CslzDsVZCbWHCoDvClMKFQcO1wqAYwooLw5ZQB8O8IQfChMKBCMKgDsOCw5AEOsKBHCjCoQIwwpgIEzI8CMOCw4UsSsO2w4dUw75GaSJnQUjCocOILsOGw7zDkzl3K8Kvw5PCmcOTw79Iw4rCjBA+w7PCig5Ow7XCmHlHe0/DsTjCv8O9wpMnwpY3Zx7DpMOlPSQowrs1EsOWw53CvcOLwoDDu8OJGsK4wrXCvg8xVcKjw6nDm8OLVAVqVSIFwoLClsODwoPDmCXDiG7CilYeW2F3w7TDqMOjw5bDm8O3wrkBA0YNHcKqw44tXcKVDMOkUELCmgDCrsKhcF1pw4bDhMKxRsOBXD1tBXYFwqfCoypoZndjwoHCmls9wqMVw5JRw6DDo8KmwrAAw5tleSxgH8Ohw6PDlifDtcO9PcKefsOjZcOjDWNQD8KresK2Z8K0D8OHw6XCpcKBPMKvwpbDuwLCoMK5ccOtdFLCnMKaSsKaM8Khw4LCi2onAX1rNSANOMOVTkM3QBHCnMOxw6AP");
// console.log(a);


// var postfix = Navi("DcONw4EVAEEEBMORwpQYBn1kwpB/SMK7w7fCqsO3w4nChFfClBlkXcOhMMKxwodQOCLDu8KtUMKHw47CrgtzwpslwpLCt8Kbw6/DhsOawpkFTcOvW0bCvSpJw5FzZ8KcHQ1Ww4Uowq/CjUkuGzVNw7rDvwogJsO0wq44YCQ/wqx5TsOYw51Bw7ZmEGnDtQ19w7l+w6nCpcK4DysfUXMZw6bCkTlEWcOCdsOPw74Bw4fDpStKw5cLMVXCuEJAw7XDkQ8=","奇异");

// a = jsfuck('w61ZS27CgzAQPQtRFsK2wqh6AcKUVcKOw5DDpcOIQhXDucKxaMKoHMK6wopyw7cCJcKEwo8TSMKxHcKTPAkNw4LCnsOPwps3woPCscOFfBfCr8OWwodIw4bDn8Opw6IjwpXDsX7Du8K+wpHDicOXcsO3KcKXw4lqw418w48nAcOhwrR4AwkQwq/DkSHDj8KQw4jCi8K8wq5YwpVQWwjDsA5mIVA9MMKGw6IiYXDCgsKswpE6wpgACSAGw7nCgx3DsMKEw6TCkBIqAMKBRnBDw7AgCBfCsyjDmR9Sw7kTwqXCicKcBSHChSLCuxjDs8KPwqdcwq3CusKOJ05/wpbClAkhfMOmFRPCnMKaPsOzwonDvsKZw6JxfsO5HU8sH8OONMOIw4tnSFB2awVswqp7wqXDgcO1YC3DnErDncKbwpjDqsOew5TDo1XCqAJ1wpfCog4EZQ43fFcgwocxWnvDrMKFPVDDox7CtcK7dcO/ZzDDgmrCrMKpFnt9TsOaw63CocOVwq9mwphmfcKacGwMwqcFw69uw7NRb1kbTBt8QWzClXbCosKwDcOyUX5dw497woVGwrnCr30vLXDDuMOAw6BWw6NoDmbCu0fCpsK5wpRNwrnDllbDgcO2R8K0D8OHVlh3w7bCp8KOw63ClMKnFcK7BMOQXl4GHVhdY0lxNMOtw6RFwo3CpVo9WndIIw7Dl27DsAYowoIzHsO8Ag==');
// var postfix = Navi("DcKMwrcNw4BADMOEVlJ6woVSccO/wpHDrMKOB8Oww6jDnETDncK2JsOHL8OmJsOcw4rCmMKuScO3TDHCmMKzHMOYw6HDiXIZwroow7slKMO0woNgD8OTDcKeSB3CgsKJOMObGxbCncKFBzhXwr0Mwo3Crlwow6nDtMKPWBErUcO0IiV8SVLCj8OJw6LDkcKvwrNzw6rDq8Opw7nCkzV7TDNewr7Dr8OkfwLCo0zDvmgpKnjDh8Oqw5fDocO+BxbDiRPDi8Oiw4gAY8OvAw==",a);
// console.log(postfix);