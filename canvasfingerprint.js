PngToy.prototype.fetchDataURL = function(a) {

    return this.url = a, this.buffer = this.chunks = this.view = null, this._pos = 0, new Promise(function(c, d) {
        try {
            for (var e = new ArrayBuffer(a.length), f = new Uint8Array(e), g = 0, h = a.length; g < h; g++)
                f[g] = a.charCodeAt(g);

            var i, j = new DataView(e);
            2303741511 === j.getUint32(0) && 218765834 === j.getUint32(4)
                ? (this.buffer = j.buffer
                    , this.view = j
                    , i = PngToy._getChunks(b.buffer, this.view, this.doCRC, this.allowInvalid)
                    , this.chunks = i.chunks || null
                    , this.chunks || this.allowInvalid
                    ? c()
                    : d(i.error))
                : d("Not a PNG file.")
        }
        catch (a) {
            d(a.message)
        }
    })
}

//
jQuery(function() {
    function canvasFingerprint() {

        "use strict";

        jQuery("#load").removeClass("none");
        var a, c = !0,
            d = pixelArray(),
            h = pixelArray(),
            i = pixelArray(),
            j = "Canvas Fingerprint 1.0",
            iframe = jQuery('body').append('<iframe id="iframe2"></iframe>'),
            k = document.getElementById("iframe2").contentDocument.createElement("canvas");
            jQuery('#iframe2').attr('style','width:1px;height:1px;border:0px solid black;display:none;visibility:hidden;');

        if (k.getContext && (a = k.getContext("2d"))) {
            if (d = f(), "function" == typeof k.getContext("2d").fillText) {
                h = f();
                try {
                    k.setAttribute("width", 220)
                        , k.setAttribute("height", 30)
                        , a.textBaseline = "top"
                        , a.font = "14px 'Arial'"
                        , a.textBaseline = "alphabetic"
                        , a.fillStyle = "#f60", a.fillRect(125, 1, 62, 20)
                        , a.fillStyle = "#069", a.fillText(j, 2, 15)
                        , a.fillStyle = "rgba(102, 204, 0, 0.7)"
                        , a.fillText(j, 4, 17)
                }
                catch (b) {
                    console.warn("https://bugzilla.mozilla.org/show_bug.cgi?id=941146", b)
                        , k = document.createElement("canvas")
                        , a = k.getContext("2d")
                        , "undefined" == typeof a || "function" != typeof k.getContext("2d").fillText 
                            ? (d = pixelArray(), h = pixelArray(), c = !1)
                            : (k.setAttribute("width", 220), k.setAttribute("height", 30)
                                , a.textBaseline = "top"
                                , a.font = "14px 'Arial'"
                                , a.textBaseline = "alphabetic"
                                , a.fillStyle = "#f60"
                                , a.fillRect(125, 1, 62, 20)
                                , a.fillStyle = "#069"
                                , a.fillText(j, 2, 15)
                                , a.fillStyle = "rgba(102, 204, 0, 0.7)"
                                , a.fillText(j, 4, 17))
                }
            } 
            else {
                c = !1;
            }

            if (c && "function" == typeof k.toDataURL) {
                var l;
                try {
                    if (l = k.toDataURL("image/png"), "boolean" == typeof l || "undefined" == typeof l){
                        throw e;
                    }
                } 
                catch (a) {
                    l = ""
                }
                0 === l.indexOf("data:image/png") 
                    ? i = f() 
                    : c = !1
            } 
            else {
                c = !1
            }
        } 
        else {
            c = !1;
        }
        if (jQuery("#is-canvas").html(d), jQuery("#is-canvas-text").html(h)
            , jQuery("#is-canvas-todataurl").html(i), c) {
            b(a, l)
        } 
        else {
            jQuery("#crc-detect").text("n/a"), jQuery(".no").css("opacity", "0.5")
        }
            
    }

    function b(canvas2DContext, imageBase64) {

        let fingerprintImage = atob(imageBase64.replace("data:image/png;base64,", ""));
        window.fingerprintImage = imageBase64;
        let e = 0;
        try {
            let imageBase64 = canvas2DContext.getImageData(0, 0, 220, 30);
            let pixelArray = new Uint32Array(imageBase64.data.buffer);
            let pixelCount = pixelArray.length;
            i = {};
            e = 0;

            for (let j = 0; j < pixelCount; j++) {
                let k = 0xFFFFFF & pixelArray[j];
                if(i[k] === 0) e++;
                i[k]++;
            }
        } 
        catch (a) {
            console.warn(a);
        }

        if (e < 1 && (e = "n/a")) {
            jQuery("#canvas-file-colors").text(e);
            jQuery("#canvas-file-size").text(fingerprintImage.length + " bytes");
            jQuery("#canvas-file-md5").text(md5(fingerprintImage).toUpperCase());
        }

        var l = new PngToy([{
            doCRC: "true"
        }]);

        l.fetchDataURL(fingerprintImage).then(function(a) {
            function b(a, b) {
                let c = "";
                return "IHDR" == a 
                    ? (c = "PNG image header: ", c += b.width + "x" + b.height + ", ", c += b.depth + " bits/sample, ", 0 == b.type
                    ? c += "grayscale, "
                    : 2 == b.type 
                    ? c += "truecolor, "
                    : 3 == b.type 
                    ? c += "paletted, "
                    : 4 == b.type 
                    ? c += "grayscale+alpha, " : 6 == b.type && (c += "truecolor+alpha, "), "0" == b.interlaced
                    ? c += "noninterlaced, " : "1" == b.interlaced && (c += "interlaced, "), c = c.slice(0, -2))
                    : "gAMA" == a 
                    ? c = "file gamma = : " + b.gamma : "sRGB" == a
                    ? c = "sRGB color space, rendering intent: " + b.desc : "IDAT" == a
                    ? c = "PNG image data" : "IEND" == a && (c = "end-of-image marker"), c
            }

            console.log("Chunks = ", l.chunks.length);

            for (var d, e, f, g = "IHDR,PLTE,sPLT,tRNS,tEXt,gAMA,cHRM,sRGB,hIST,pHYs,bKGD,tIME,sBIT,oFFs,sTER,sCAL,pCAL"
                , h = "", i = 0, j = l.chunks.length; i < j; i++) {

                // Should be 8 symbols in fingerprint
                for (e = l.chunks[i].crc.toString(16); e.length < 8;){
                    e = "0" + e;
                }

                console.log("Iteration = ", i, " E = ", e, "D = ", d);

                if("IDAT" === l.chunks[i].name)
                    fingerprintImage = e, jQuery("#crc").html('<span class="good">&#10004;</span> ' + d.toUpperCase());
                h += '<tr><td class="nt"></td>';
                h += '<td class="br t wb">' + l.chunks[i].name + "</td>", h += '<td class="br t wb">' + l.chunks[i].length + "</td>";
                h += '<td class="br t wb">' + e.toUpperCase() + "</code></td>";
                imageBase64 = "";

                console.log("H = ", h);
                
                try {
                    imageBase64 = g.indexOf(l.chunks[i].name) != -1
                        ? b(l.chunks[i].name, l.getChunk(l.chunks[i].name)) 
                        : b(l.chunks[i].name)
                            , "" == f && g.indexOf(l.chunks[i].name) != -1 && (imageBase64 = JSON.stringify(l.getChunk(l.chunks[i].name)))
                } 
                catch (a) {
                    console.warn(a);
                }

                if("" === f) {
                    imageBase64 = "parser error";
                }

                h += '<td class="t"><div>' + f + "</div></td></tr>";
            }
            jQuery("#canvas-file").removeClass("none");
            jQuery("#canvas-png").html(h).removeClass("none");
            renderFingerprintHtml(d);
        }, 
        function(a) {
            jQuery("#crc-detect").text("n/a")
                , jQuery("#canvas-file")
                    .append('<tr><td class="nt"></td><td colspan="4"><span class="bad">&#215;</span>' + a + "</td>")
                    .removeClass("none")
        })
    }

    function renderFingerprintHtml(hash_text) {
      //Here is the unic fingerprint.
      window.fingerprint=hash_text;
      jQuery('#result').html(window.fingerprint);
    }

    function f() {
        return '<span class="good">&#10004;</span> True'
    }

    function pixelArray() {
        return '<span class="bad">&#215;</span> False'
    }

    canvasFingerprint();
});
