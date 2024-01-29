import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';

import DFMesh from '../DFMesh';

import vs from "./circleDF.vs.glsl";
import fs from "./circleDF.fs.glsl";
import { setKFactor } from '../../LavaConfig';

export default class CircleDFMesh extends DFMesh {
    constructor() {
        const material = new ShaderMaterial({
            vertexShader: setKFactor(vs),
            fragmentShader: setKFactor(fs),
            uniforms: {
                screenSize: { value: new Vector2() },
                dimensions: { value: new Vector3() },
                channels: { value: new Vector4() },
            },
        });

        super(material);

        this._dimensions = this.material.uniforms.dimensions.value;
    }

    get x() {
        return this.dimensions.x;
    }

    set x(val) {
        this.dimensions.x = val;
    }

    get y() {
        return this.dimensions.y;
    }

    set y(val) {
        this.dimensions.y = val;
    }

    get radius() {
        return this.dimensions.z;
    }

    set radius(val) {
        this.dimensions.z = val;
    }

    get left() {
        return this.dimensions.x - Math.max(0, this.dimensions.z);
    }

    get right() {
        return this.dimensions.x + Math.max(0, this.dimensions.z);
    }

    get top() {
        return this.dimensions.y - Math.max(0, this.dimensions.z);
    }

    get bottom() {
        return this.dimensions.y + Math.max(0, this.dimensions.z);
    }

    get dimensions() {
        return this._dimensions;
    }
}