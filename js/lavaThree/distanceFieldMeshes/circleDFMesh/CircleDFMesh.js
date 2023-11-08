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

    get radius() {
        return this._dimensions.z;
    }

    set radius(val) {
        this._dimensions.z = val;
    }
}