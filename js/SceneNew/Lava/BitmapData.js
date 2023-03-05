import { TEXTURE_DEBUG, FPS_METER } from "../../animationConfig";
import { INT_SCALE } from "./lavaConfig";

export default class BitmapData {
    constructor(width, height = width) {
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

    putImageData() {
        this._ctx.putImageData(this._imgData, 0, 0);
    }

    setCircle(circle, dataX, dataY) {
        const x = Math.round(circle.x * INT_SCALE);
        const y = Math.round(circle.y * INT_SCALE);
        const r = Math.round(circle.r);

        const xR = (x) & 0xff;
        const xG = (x >> 8) & 0xff;
        const yR = (y) & 0xff;
        const yG = (y >> 8) & 0xff;
        const rB = (r) & 0xff;

        // console.log(Math.round((circle.x)), r, g, r + g * 255);

        this.setPixel(dataX, dataY, xR, xG, rB, 255);
        this.setPixel(dataX + 1, dataY, yR, yG, 0, 255);
    }

    setPixel(x, y, r, g, b, a) {
        const i = (x + this._imgData.width * y) * 4;

        this._imgData.data[i] = r;
        this._imgData.data[i + 1] = g;
        this._imgData.data[i + 2] = b;
        this._imgData.data[i + 3] = a;
    }

    static get INT_SCALE() {
        return INT_SCALE;
    }
}