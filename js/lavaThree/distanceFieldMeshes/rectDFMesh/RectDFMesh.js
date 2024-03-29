import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector4 } from 'three/src/math/Vector4';

import DFMesh from '../DFMesh';

import vs from "./rectDF.vs.glsl";
import fs from "./rectDF.fs.glsl";
import { setKFactor } from '../../LavaConfig';

export default class RectDFMesh extends DFMesh {
    constructor() {
        const material = new ShaderMaterial({
            vertexShader: setKFactor(vs),
            fragmentShader: setKFactor(fs),
            uniforms: {
                screenSize: { value: new Vector2() },
                dimensions: { value: new Vector4() },
                radius: { value: 0 },
                channels: { value: new Vector4() },
            },
        });

        super(material);

        this._dimensions = this.material.uniforms.dimensions.value;

        this.radius = 10;
    }

    get x() {
        return this._dimensions.x;
    }

    set x(val) {
        this._dimensions.x = val;
    }

    get y() {
        return this._dimensions.y;
    }

    set y(val) {
        this._dimensions.y = val;
    }

    get width() {
        return this._dimensions.z * 2;
    }

    set width(val) {
        this._dimensions.z = val * 0.5;
    }

    get height() {
        return this._dimensions.w * 2;
    }

    set height(val) {
        this._dimensions.w = val * 0.5;
    }

    get radius() {
        return this.material.uniforms.radius.value;
    }

    set radius(val) {
        this.material.uniforms.radius.value = val;
    }
}