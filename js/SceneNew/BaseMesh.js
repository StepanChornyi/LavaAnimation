export default class BaseMesh {
    constructor(gl, program) {
        this.gl = gl;

        this.program = program;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        this.vertices = [];
        this.indices = [];
    }

    drawBuffersData() {
        const gl = this.gl;

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    updateAttribPointers() {
        this.bindIndexBuffer();
    }

    bindIndexBuffer() {
        const gl = this.gl;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    render(_, count = this.indices.length, offset = 0) {
        const gl = this.gl;

        gl.useProgram(this.program);

        this.updateAttribPointers();

        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
    }
}
