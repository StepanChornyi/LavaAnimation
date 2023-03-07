import { TEXTURE_DEBUG, FPS_METER } from "../../animationConfig";
import { INT_SCALE } from "./lavaConfig";

export default class BitmapData {
    constructor(gl, width, height = width) {
        this.gl = gl;

        this.glTexture = this._createGlTexture();

        const canvas = this.canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const ctx = this._ctx = canvas.getContext("2d");

        this._imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (TEXTURE_DEBUG) {
            canvas.style.position = "absolute";
            canvas.style.imageRendering = "pixelated";
            canvas.style.width = "500px";
            canvas.style.top = FPS_METER ? "48px" : "0px";
            document.body.appendChild(canvas);
        }
    }

    _createGlTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    }

    updateAndBindTexture() {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this._imgData.data);
        gl.activeTexture(gl.TEXTURE0);

        if (TEXTURE_DEBUG) {
            const d = this._imgData.data;

            for (let i = 0; i < d.length; i += 4) {
                if (d[i] > 0 || d[i + 1] > 0 || d[i + 2] > 0) {
                    d[i + 3] = 255;
                }
            }

            this._ctx.putImageData(this._imgData, 0, 0);
        }
    }

    setCircle(circle, dataX, dataY) {
        const x = numberTo2Bytes(circle.x);
        const y = numberTo2Bytes(circle.y);
        const r = numberTo2Bytes(circle.r);

        this.setPixel(dataX, dataY, x[0], x[1], y[0], y[1]);
        this.setPixel(dataX + 1, dataY, r[0], r[1], 0, 0);
    }

    setRect(rect, dataX, dataY) {
        const x = numberTo2Bytes(rect.centerX);
        const y = numberTo2Bytes(rect.centerY);
        const w = numberTo2Bytes(rect.halfWidth);
        const h = numberTo2Bytes(rect.halfHeight);

        this.setPixel(dataX, dataY, x[0], x[1], y[0], y[1]);
        this.setPixel(dataX + 1, dataY, w[0], w[1], h[0], h[1]);
    }

    setPixel(x, y, r, g, b, a) {
        const i = (x + this._imgData.width * y) * 4;

        this._imgData.data[i] = r;
        this._imgData.data[i + 1] = g;
        this._imgData.data[i + 2] = b;
        this._imgData.data[i + 3] = a;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    static get INT_SCALE() {
        return INT_SCALE;
    }
}

const IVS_255 = 1 / 255;

function numberTo2Bytes(num) {
    num = Math.round(num * INT_SCALE);

    return [num % 255, Math.floor(num * IVS_255)]
}