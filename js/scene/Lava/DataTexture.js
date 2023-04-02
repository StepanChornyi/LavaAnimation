export default class DataTexture {
    constructor(gl, width, height = width) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        const texture = this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this.data = new Float32Array(width * height * 4);
    }

    set(x, y, r, g, b, a) {
        const index = (y * this.width + x) * 4;

        this.data[index] = r;
        this.data[index + 1] = g;
        this.data[index + 2] = b;
        this.data[index + 3] = a;
    }

    clear() {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = 0;
        }
    }

    drawToGPU() {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, this.width, this.height, 0, gl.RGBA, gl.FLOAT, this.data);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}