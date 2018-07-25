/* pngtoy version 0.5.5 ALPHA (c) 2015-2016 Epistemex.com MIT License +pngtoy.js +pngtoy.chunks.js +pngtoy.chunk.bkgd.js +pngtoy.chunk.chrm.js +pngtoy.chunk.ext.offs.js +pngtoy.chunk.ext.pcal.js +pngtoy.chunk.ext.scal.js +pngtoy.chunk.ext.ster.js +pngtoy.chunk.gama.js +pngtoy.chunk.hist.js +pngtoy.chunk.ihdr.js +pngtoy.chunk.phys.js +pngtoy.chunk.plte.js +pngtoy.chunk.sbit.js +pngtoy.chunk.splt.js +pngtoy.chunk.srgb.js +pngtoy.chunk.text.js +pngtoy.chunk.time.js +pngtoy.chunk.trns.js -PngImage.js -pako_inflate.js -pngtoy.chunk.iccp.js -pngtoy.chunk.idat.js -pngtoy.chunk.itxt.js -pngtoy.chunk.ztxt.js -pngtoy.convert.canvas.js -pngtoy.convert.rgba.js -pngtoy.decode.js */
function PngToy(a) {
    a = a || {};
    this.doCRC = "boolean" === typeof a.doCRC ? a.doCRC : !0;
    this.allowInvalid = "boolean" === typeof a.allowInvalid ? a.allowInvalid : !1;
    this.beforeSend = a.beforeSend || function (a) { };
    this.chunks = this.view = this.buffer = this.url = null;
    this.debug = {}
}
PngToy.prototype = {
    fetch: function (a) {
        var b = this;
        b.url = a;
        b.buffer = b.chunks = b.view = null;
        b._pos = 0;
        return new Promise(function (f, c) {
            try {
                var d = new XMLHttpRequest;
                d.open("GET", a, !0);
                d.responseType = "arraybuffer";
                b.beforeSend(d);
                d.onerror = function (a) {
                    c("Network error. " + a.message)
                };
                d.onload = function () {
                    if (200 === d.status) {
                        var a = new DataView(d.response);
                        2303741511 === a.getUint32(0) && 218765834 === a.getUint32(4)
                            ? (b.buffer = a.buffer
                                , b.view = a
                                , a = PngToy._getChunks(b.buffer, b.view, b.doCRC, b.allowInvalid)
                                , b.chunks = a.chunks || null, b.chunks || b.allowInvalid ? f() : c(a.error))
                            : c("Not a PNG file.")
                    } else c("Loading error:" + d.statusText)
                };
                d.send()
            } catch (g) {
                c(g.message)
            }
        })
    },
    getChunk: function (a) {
        return -1 < "IHDR IDAT PLTE sPLT tRNS iTXt tEXt zTXt iCCP gAMA cHRM sRGB hIST sBIT pHYs bKGD tIME oFFs sTER sCAL pCAL IEND".split(" ").indexOf(a)
            ? "IEND" === a
                ? !!PngToy._findChunk(this.chunks, "IEND")
                : PngToy["_" + a](this)
            : PngToy._findChunk(this.chunks, a)
    },
    getGammaLUT: function (a, b, f) {
        a = a || 1;
        b = b || 2.2;
        f = f || 1;
        var c = new Uint8Array(256),
            d = 0;
        for (a = 1 / (a * b * f); 256 > d; d++) c[d] = 255 * Math.pow(d / 255, a) + .5 | 0;
        return c
    },
    guessDisplayGamma: function () {
        return -1 < navigator.userAgent.indexOf("Mac OS") ? 1.8 : 2.2
    }
};
PngToy._blockSize = 3E6;
PngToy._delay = 7;
PngToy._getChunks = function (a, b, f, c) {
    function d(a, b, c) {
        a = PngToy._findChunks(h, a);
        return 0 > c ? a.length >= b : a.length >= b && a.length <= c
    }

    function g(a, b, c) {
        return e(a, b) && e(b, c)
    }

    function e(a, b) {
        var c = -1,
            d = -1,
            e, f = h.length;
        for (e = 0; e < f; e++) h[e].name === a && (c = e), h[e].name === b && (d = e);
        return c < d
    }

    function k(b) {
        var c = new Uint8Array(a, b.offset - 4, b.length + 4),
            d = b.crc,
            e = 4294967295,
            f = c.length,
            g;
        for (g = 0; g < f; g++) e = e >>> 8 ^ r.table[(e ^ c[g]) & 255];
        b.crcOk = d === (e ^ -1) >>> 0
    }

    function n() {
        var a = q(),
            b = String.fromCharCode;
        return b((a & 4278190080) >>> 24) + b((a & 16711680) >>> 16) + b((a & 65280) >>> 8) + b((a & 255) >>> 0)
    }

    function q() {
        var a = b.getUint32(p);
        p += 4;
        return a >>> 0
    }
    var r = this,
        p = 8,
        v = a.byteLength,
        h = [],
        m, t, l, w, x = !0,
        y = ["iTXT", "tIME", "tEXt", "zTXt"],
        u = PngToy._findChunk;
    if (f && !this.table)
        for (this.table = new Uint32Array(256), l = 0; 256 > l; l++) {
            m = l >>> 0;
            for (t = 0; 8 > t; t++) m = m & 1 ? 3988292384 ^ m >>> 1 : m >>> 1;
            this.table[l] = m
        }
    for (; p < v;) {
        t = q();
        l = n();
        if (2147483647 < t && !c) return {
            error: "Invalid chunk size."
        };
        w = p;
        p = w + t;
        m = q();
        m = new PngToy.Chunk(l, w, t, m);
        if (f && (k(m), !m.crcOk && !c)) return {
            error: "Invalid CRC in chunk " + l
        };
        if (m.isReserved && !c) return {
            error: "Invalid chunk name: " + l
        };
        h.push(m)
    }
    if (!c) {
        if (!d("IHDR", 1, 1)) return {
            error: "Invalid number of IHDR chunks."
        };
        if (!d("tIME", 0, 1)) return {
            error: "Invalid number of tIME chunks."
        };
        if (!d("zTXt", 0, -1)) return {
            error: "Invalid number of zTXt chunks."
        };
        if (!d("tEXt", 0, -1)) return {
            error: "Invalid number of tEXt chunks."
        };
        if (!d("iTXt", 0, -1)) return {
            error: "Invalid number of iTXt chunks."
        };
        if (!d("pHYs", 0, 1)) return {
            error: "Invalid number of pHYs chunks."
        };
        if (!d("sPLT", 0, -1)) return {
            error: "Invalid number of sPLT chunks."
        };
        if (!d("iCCP", 0, 1)) return {
            error: "Invalid number of iCCP chunks."
        };
        if (!d("sRGB", 0, 1)) return {
            error: "Invalid number of sRGB chunks."
        };
        if (!d("sBIT", 0, 1)) return {
            error: "Invalid number of sBIT chunks."
        };
        if (!d("gAMA", 0, 1)) return {
            error: "Invalid number of gAMA chunks."
        };
        if (!d("cHRM", 0, 1)) return {
            error: "Invalid number of cHRM chunks."
        };
        if (!d("PLTE", 0, 1)) return {
            error: "Invalid number of PLTE chunks."
        };
        if (!d("tRNS", 0, 1)) return {
            error: "Invalid number of tRNS chunks."
        };
        if (!d("hIST", 0, 1)) return {
            error: "Invalid number of hIST chunks."
        };
        if (!d("bKGD", 0, 1)) return {
            error: "Invalid number of bKGD chunks."
        };
        if (!d("IDAT", 1, -1)) return {
            error: "Invalid number of IDAT chunks."
        };
        if (!d("IEND", 1, 1)) return {
            error: "Invalid number of IEND chunks."
        };
        if ("IHDR" !== h[0].name || "IEND" !== h[h.length - 1].name) return {
            error: "Invalid PNG chunk order."
        };
        f = b.getUint8(u(h, "IHDR").offset + 9);
        c = u(h, "PLTE");
        m = u(h, "hIST");
        v = u(h, "tRNS");
        l = u(h, "oFFs");
        t = u(h, "sTER");
        if (u(h, "iCCP") && u(h, "sRGB")) return {
            error: "Both iCCP and sRGB cannot be present."
        };
        if (3 === f && !c) return {
            error: "Missing PLTE chunk."
        };
        if ((0 === f || 4 === f) && c) return {
            error: "PLTE chunk should not appear with this color type."
        };
        if ((4 === f || 6 === f) && v) return {
            error: "tRNS chunk should not appear with this color type."
        };
        if (m && !c) return {
            error: "hIST chunk can only appear if a PLTE chunk is present."
        };
        if (c) {
            if (!e("PLTE", "IDAT")) return {
                error: "Invalid chunk order for PLTE."
            };
            if (m && !g("PLTE", "hIST", "IDAT")) return {
                error: "Invalid chunk order for hIST."
            };
            if (v && !g("PLTE", "tRNS", "IDAT")) return {
                error: "Invalid chunk order for tRNS."
            };
            if (u(h, "bKGD") && !g("PLTE", "bKGD", "IDAT")) return {
                error: "Invalid chunk order for bKGD."
            };
            if (!e("cHRM", "PLTE")) return {
                error: "Invalid chunk order for cHRM."
            };
            if (!e("gAMA", "PLTE")) return {
                error: "Invalid chunk order for gAMA."
            };
            if (!e("iCCP", "PLTE")) return {
                error: "Invalid chunk order for iCCP."
            };
            if (!e("sRGB", "PLTE")) return {
                error: "Invalid chunk order for sRGB."
            }
        }
        if (l && !e("oFFs", "IDAT")) return {
            error: "Invalid chunk order for oFFs."
        };
        if (t && !e("sTER", "IDAT")) return {
            error: "Invalid chunk order for sTER."
        };
        for (l = h.length - 2; 0 < l; l--)
            if (x && "IDAT" !== h[l].name && 0 > y.indexOf(h[l].name)) x = !1;
            else if (!x && "IDAT" === h[l].name) return {
                error: "Invalid chunk inside IDAT chunk sequence."
            }
    }
    return {
        chunks: h
    }
};
PngToy._getChunks.table = null;
PngToy._findChunk = function (a, b) {
    for (var f = 0, c; c = a[f++];)
        if (c.name === b) return c;
    return null
};
PngToy._findChunks = function (a, b) {
    for (var f = 0, c = [], d; d = a[f++];) d.name === b && c.push(d);
    return c
};
PngToy._getStr = function (a, b, f) {
    var c = "",
        d = -1,
        g, e = !1,
        k = String.fromCharCode;
    for (f += b; b < f && d;)
        if (d = a.getUint8(b++)) g = k(d), -1 < " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"%&'()*+,-./:;<=>?_".indexOf(g)
            ? c += g
            : e = !0;
        else break;
    return {
        offset: b,
        text: c,
        warning: e
    }
};
PngToy.Chunk = function (a, b, f, c) {
    this.name = a;
    this.offset = b;
    this.length = f;
    this.crc = c;
    this.crcOk = !0;
    this.isCritical = !(a.charCodeAt(0) & 32);
    this.isPrivate = !!(a.charCodeAt(1) & 32);
    this.isReserved = !!(a.charCodeAt(2) & 32);
    this.isCopySafe = !!(a.charCodeAt(3) & 32)
};
PngToy._bKGD = function (a) {
    var b = a.view,
        f = PngToy._findChunk(a.chunks, "bKGD");
    a = PngToy._IHDR(a);
    if (!f) return null;
    switch (a.type) {
        case 0:
        case 4:
            return {
                background: [b.getUint16(f.offset)]
            };
        case 2:
        case 6:
            return {
                background: new Uint16Array(b.buffer, f.offset, 6)
            };
        default:
            return {
                index: b.getUint8(f.offset)
            }
    }
};
PngToy._cHRM = function (a) {
    var b = a.view;
    a = PngToy._findChunk(a.chunks, "cHRM");
    if (!a) return null;
    a = a.offset;
    return {
        whiteX: b.getUint32(a) / 1E5,
        whiteY: b.getUint32(a + 4) / 1E5,
        redX: b.getUint32(a + 8) / 1E5,
        redY: b.getUint32(a + 12) / 1E5,
        greenX: b.getUint32(a + 16) / 1E5,
        greenY: b.getUint32(a + 20) / 1E5,
        blueX: b.getUint32(a + 24) / 1E5,
        blueY: b.getUint32(a + 28) / 1E5
    }
};
PngToy._oFFs = function (a) {
    var b = a.view,
        f = a.allowInvalid,
        c = PngToy._findChunk(a.chunks, "oFFs");
    a = {};
    if (!c) return null;
    c = c.offset;
    a.x = b.getInt32(c);
    a.y = b.getInt32(c + 4);
    a.unit = b.getUint8(c + 8);
    a.desc = ["Pixels", "Micrometers"][a.unit] || "Invalid";
    return !f && (0 > a.unit || 1 < a.unit) ? {
        error: "Invalid unit for oFFs chunk."
    } : a
};
PngToy._pCAL = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "pCAL");
    var c = !1,
        d, g, e = {},
        k = [],
        n = 0,
        q;
    if (!a.length) return null;
    d = a.offset;
    g = PngToy._getStr(b, d, 80);
    e.calName = g.text;
    d = g.offset;
    g.warn && (c = !0);
    e.x0 = b.getInt32(d);
    e.x1 = b.getInt32(d + 4);
    e.eqType = b.getUint8(d + 8);
    e.eqDesc = ["Linear mapping"
        , "Base-e exponential mapping"
        , "Arbitrary-base exponential mapping"
        , "Hyperbolic mapping"][e.eqType] || null;
    e.paramCount = b.getUint8(d + 9);
    g = PngToy._getStr(b, d + 10, 1E4);
    e.unitName = g.text;
    d = g.offset;
    g.warn && (c = !0);
    for (q = e.paramCount - 1; n < q; n++)
        g = PngToy._getStr(b, d, 1E4), k.push(g.text), d = g.offset, g.warn && (c = !0);
    g = PngToy._getStr(b, d, a.length - (d - a.offset));
    k.push(g.text);
    g.warn && (c = !0);
    e.parameters = k;
    if (!f) {
        if (e.x0 === e.x1) return {
            error: "Invalid x0 or x1."
        };
        if (k.length !== e.paramCount) return {
            error: "Mismatching parameter count and number of parameters."
        };
        if (0 > e.eqType || 3 < e.eqType) return {
            error: "Invalid equation type."
        };
        if (c) return {
            error: "One or more text field contains illegal chars."
        }
    }
    return e
};
PngToy._sCAL = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "sCAL");
    var c, d = {};
    if (!a.length) return null;
    c = a.offset;
    d.unit = b.getUint8(c++);
    d.desc = ["meters", "radians"][d.unit] || null;
    c = PngToy._getStr(b, c, 1E5);
    d.unitsX = c.text;
    c = c.offset;
    c = PngToy._getStr(b, c, a.length - (c - a.offset));
    d.unitsY = c.text;
    return !f && (1 > d.unit || 2 < d.unit) ? {
        error: "Invalid unit"
    } : d
};
PngToy._sTER = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "sTER");
    var c = {};
    if (!a) return null;
    c.mode = b.getUint8(a.offset);
    c.desc = ["Cross-fuse layout", "Diverging-fuse layout"][c.mode];
    return !f && (0 > c.mode || 1 < c.mode) ? {
        error: "Invalid mode for sTER chunk."
    } : c
};
PngToy._gAMA = function (a) {
    var b = a.view;
    return (a = PngToy._findChunk(a.chunks, "gAMA")) ? {
        gamma: b.getUint32(a.offset) / 1E5
    } : null
};
PngToy._hIST = function (a) {
    var b = a.view,
        f = a.allowInvalid,
        c = PngToy._findChunk(a.chunks, "hIST");
    a = PngToy._PLTE(a);
    var d = [],
        g;
    if (!c) return null;
    if (!f && c.length % 2) return {
        error: "Invalid length of hIST chunk."
    };
    g = c.offset;
    for (c = g + c.length; g < c; g += 2) d.push(b.getUint16(g));
    return f || d.length === a.length ? {
        histogram: d
    } : {
            error: "hIST chunk must have same number of entries as PLTE chunk."
        }
};
PngToy._IHDR = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "IHDR");
    if (!a) return {
        error: "Critical - IHDR chunk is missing."
    };
    a = a.offset;
    b = {
        width: b.getUint32(a),
        height: b.getUint32(a + 4),
        depth: b.getUint8(a + 8),
        type: b.getUint8(a + 9),
        compression: b.getUint8(a + 10),
        filter: b.getUint8(a + 11),
        interlaced: b.getUint8(a + 12)
    };
    if (!f) {
        if (0 > [0, 2, 3, 4, 6].indexOf(b.type)) return {
            error: "Invalid color type."
        };
        switch (b.type) {
            case 0:
                if (0 > [1, 2, 4, 8, 16].indexOf(b.depth)) return {
                    error: "Invalid color depth."
                };
                break;
            case 3:
                if (0 > [1, 2, 4, 8].indexOf(b.depth)) return {
                    error: "Invalid color depth."
                };
                break;
            default:
                if (0 > [8, 16].indexOf(b.depth)) return {
                    error: "Invalid color depth."
                }
        }
        if (!b.width || !b.height) return {
            error: "Invalid dimension."
        };
        if (b.compression) return {
            error: "Invalid compression type."
        };
        if (b.filter) return {
            error: "Invalid filter type."
        };
        if (0 > b.interlaced || 1 < b.interlaced) return {
            error: "Invalid interlace mode " + b.interlaced
        }
    }
    return b
};
PngToy._pHYs = function (a) {
    var b = a.view,
        f = a.allowInvalid,
        c = PngToy._findChunk(a.chunks, "pHYs");
    a = {};
    if (!c) return null;
    c = c.offset;
    a.ppuX = b.getUint32(c);
    a.ppuY = b.getUint32(c + 4);
    a.unit = b.getUint8(c + 8);
    a.desc = 1 === a.unit ? "Meters" : "ratio";
    if (f) a.ppuX &= 2147483647, a.ppuY &= 2147483647, a.unit &= 1;
    else {
        if (2147483647 < a.ppuX || 2147483647 < a.ppuY) return {
            error: "Invalid unit lengths."
        };
        if (0 > a.unit || 1 < a.unit) return {
            error: "Invalid unit for pHYs chunk."
        }
    }
    return a
};
PngToy._PLTE = function (a) {
    var b = a.buffer,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "PLTE");
    if (!a) return null;
    b = new Uint8Array(b, a.offset, a.length);
    if (!f) {
        if (b.length % 3) return {
            error: "Invalid palette size."
        };
        if (3 > b.length || 768 < b.length) return {
            error: "Invalid number of palette entries."
        }
    }
    return {
        palette: b,
        length: b.length / 3
    }
};
PngToy._sBIT = function (a) {
    var b = a.view,
        f = a.allowInvalid,
        c = PngToy._findChunk(a.chunks, "sBIT");
    a = PngToy._IHDR(a);
    var d, g = !1,
        e = {
            grey: null,
            alpha: null,
            red: null,
            green: null,
            blue: null
        };
    if (!c) return null;
    c = c.offset;
    d = 3 === a.type ? 8 : a.depth;
    switch (a.type) {
        case 0:
            e.grey = b.getUint8(c);
            break;
        case 2:
        case 3:
            e.red = b.getUint8(c++);
            e.green = b.getUint8(c++);
            e.blue = b.getUint8(c);
            break;
        case 4:
            e.grey = b.getUint8(c++);
            e.alpha = b.getUint8(c);
            break;
        case 6:
            e.red = b.getUint8(c++)
                , e.green = b.getUint8(c++)
                , e.blue = b.getUint8(c++)
                , e.alpha = b.getUint8(c)
    }
    return !f
        && (null !== e.red && (e.red > d || 0 === e.red)
            && (g = !0), null !== e.green && (e.green > d || 0 === e.green)
            && (g = !0), null !== e.blue
            && (e.blue > d || 0 === e.blue)
            && (g = !0), null !== e.grey
            && (e.grey > d || 0 === e.grey)
            && (g = !0), null !== e.alpha
            && (e.alpha > d || 0 === e.alpha)
            && (g = !0), g) ? {
            error: "Invalid sBIT chunk."
        } : e
};
PngToy._sPLT = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunks(a.chunks, "sPLT");
    var c = [];
    if (!a.length) return null;
    a.forEach(function (a) {
        var d = {
            depth: null,
            name: null,
            palette: [],
            entries: 0
        },
            e, k, n, q = [],
            r, p;
        e = a.offset;
        e = PngToy._getStr(b, e, 80);
        d.name = e.text;
        e = e.offset;
        d.depth = b.getUint8(e++);
        k = 8 === d.depth ? 6 : 10;
        n = 8 === d.depth ? 1 : 2;
        a = a.length - (e - a.offset);
        p = 6 === k ? b.getUint8.bind(b) : b.getUint16.bind(b);
        for (r = 0; r < a; r += k)
            q.push(p(e + r), p(e + r + n), p(e + r + 2 * n), p(e + r + 3 * n), b.getUint16(e + r + 4 * n));
        d.palette = q;
        d.entries = q.length / k;
        if (!f && (8 === d.depth && a % 6 || 16 === d.depth && a % 10)) return {
            error: "Invalid sPLT chunk."
        };
        c.push(d)
    });
    return c
};
PngToy._sRGB = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "sRGB");
    if (!a) return null;
    b = b.getUint8(a.offset);
    return !f && (0 > b || 3 < b) ? {
        error: "Invalid range for sRGB render intent."
    } : {
            intent: b,
            desc: ["Perceptual", "Relative colorimetric", "Saturation", "Absolute colorimetric"][b] || null
        }
};
PngToy._tEXt = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunks(a.chunks, "tEXt");
    var c = !1,
        d = !1,
        g, e, k, n, q = [];
    if (!a.length) return null;
    a.forEach(function (a) {
        if (!d) {
            var p = {};
            g = a.offset;
            k = PngToy._getStr(b, g, 80);
            p.keyword = k.text;
            g = k.offset;
            k.warn && (c = !0);
            e = new Uint8Array(b.buffer, g, a.length - (g - a.offset));
            k = "";
            for (n = 0; n < e.length; n++) k += String.fromCharCode(e[n]);
            p.text = k;
            q.push(p);
            if (!f && c) return d = !0, {
                error: "One or more field contains illegal chars."
            }
        }
    });
    return q
};
PngToy._tIME = function (a) {
    var b = a.view,
        f = a.allowInvalid;
    a = PngToy._findChunk(a.chunks, "tIME");
    if (!a) return null;
    a = a.offset;
    b = {
        year: b.getUint16(a),
        month: b.getUint8(a + 2),
        day: b.getUint8(a + 3),
        hour: b.getUint8(a + 4),
        minute: b.getUint8(a + 5),
        second: b.getUint8(a + 6),
        date: null
    };
    if (!f && (0 > b.year
        || 65535 < b.year
        || 1 > b.month
        || 12 < b.month
        || 1 > b.day
        || 31 < b.day
        || 0 > b.hour
        || 23 < b.hour
        || 0 > b.minute
        || 59 < b.minute
        || 0 > b.second
        || 60 < b.second)) return {
            error: "Invalid timestamp."
        };
    try {
        b.date = new Date(b.year, b.month - 1, b.day, b.hour, b.minute, Math.min(59, b.second))
    } catch (c) {
        if (!f) return {
            error: c
        }
    }
    return b
};
PngToy._tRNS = function (a) {
    var b = a.buffer,
        f = a.allowInvalid,
        c = PngToy._findChunk(a.chunks, "tRNS"),
        d = PngToy._PLTE(a);
    a = PngToy._IHDR(a);
    if (!c) return null;
    if (!f && 2 === a.type && c.length % 6) return {
        error: "Invalid tRNS length."
    };
    switch (a.type) {
        case 0:
            b = {
                alphas: new Uint16Array(b.slice(c.offset, c.offset + c.length)),
                length: c.length >> 1
            };
            break;
        case 2:
            b = {
                alphas: new Uint16Array(b.slice(c.offset, c.offset + c.length)),
                length: c.length / 6
            };
            break;
        case 3:
            b = {
                alphas: new Uint8Array(b, c.offset, c.length),
                length: c.length
            };
            break;
        default:
            return f ? {
                alphas: null,
                length: 0
            } : {
                    error: "tRNS chunk is not valid for this color type."
                }
    }
    return !f && d && b.length > d.length ? {
        error: "tRNS chunk contains more entries than palette entries."
    } : b
};