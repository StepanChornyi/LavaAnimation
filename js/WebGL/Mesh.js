const EMPTY_MESH_CONFIG = { attribs: [], uniforms: [] };

export default class Mesh {
    constructor(gl, program, config = EMPTY_MESH_CONFIG) {
        this.gl = gl;

        this.program = program;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        this.vertices = [];
        this.indices = [];

        this.initUniformsAndAttribs(config);
    }

    initUniformsAndAttribs(config) {
        const gl = this.gl;
        const program = this.program;

        config = Mesh.mergeConfigs(config, EMPTY_MESH_CONFIG);

        this.vertexByteSize = config.attribs.reduce((acc, attr) => (acc + attr.size), 0);
        this.attribs = [];
        this.uniforms = {};

        for (let i = 0, offset = 0; i < config.attribs.length; i++) {
            const { name, size } = config.attribs[i];

            this.attribs.push({
                name,
                location: gl.getAttribLocation(this.program, name),
                size,
                offset,
            });

            offset += size;
        }

        for (let i = 0; i < config.uniforms.length; i++) {
            const uniformName = config.uniforms[i];

            this.uniforms[uniformName] = {
                location: gl.getUniformLocation(program, uniformName)
            };
        }
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

        const gl = this.gl;
        const vertexByteSize = this.vertexByteSize;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        for (let i = 0; i < this.attribs.length; i++) {
            const { location, size, offset } = this.attribs[i];

            gl.vertexAttribPointer(
                location,
                size,
                gl.FLOAT,
                gl.FALSE,
                vertexByteSize * Float32Array.BYTES_PER_ELEMENT,
                offset * Float32Array.BYTES_PER_ELEMENT
            );

            gl.enableVertexAttribArray(location);
        }
    }

    setUniforms() { }

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

    static mergeConfigs(config, fallbackConfig) {
        return {
            attribs: config.attribs || fallbackConfig.attribs,
            uniforms: [...(fallbackConfig.uniforms || []), ...(config.uniforms || [])]
        };
    };
}
