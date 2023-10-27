import * as THREE from 'three';

import vs from "./sineDF.vs.glsl";
import fs from "./sineDF.fs.glsl";
import DFMesh from '../DFMesh';
import { setKFactor } from '../../LavaConfig';

export default class SineDFMesh extends DFMesh {
    constructor({ halfLength = 1000, amplitude = 50, thickness = 0, frequency = 0.01, phaseShift = 0 } = {}) {
        const material = new THREE.ShaderMaterial({
            vertexShader: setKFactor(vs),
            fragmentShader: setKFactor(fs),
            uniforms: {
                screenSize: { value: new THREE.Vector2() },
                dimensions: { value: new THREE.Vector4() },
                character: { value: new THREE.Vector4() },
                channels: { value: new THREE.Vector4() },
            },
        });

        super(material);

        this._dimensions = material.uniforms.dimensions.value;
        this._character = material.uniforms.character.value;

        this.halfLength = halfLength;
        this.amplitude = amplitude;
        this.thickness = thickness;
        this.frequency = frequency;
        this.phaseShift = phaseShift;
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

    get halfLength() {
        return this._dimensions.z;
    }

    set halfLength(val) {
        this._dimensions.z = val;
    }

    get amplitude() {
        return this._dimensions.w;
    }

    set amplitude(val) {
        this._dimensions.w = val;
    }

    get thickness() {
        return this._character.x;
    }

    set thickness(val) {
        this._character.x = val;
    }

    get frequency() {
        return this._character.y;
    }

    set frequency(val) {
        this._character.y = val;
    }

    get phaseShift() {
        return this._character.z;
    }

    set phaseShift(val) {
        this._character.z = val;
    }

    get angle() {
        return this.rotation.z;
    }

    set angle(val) {
        this.rotation.z = val;
    }

    get scaleX() {
        return this.scale.x;
    }

    set scaleX(val) {
        this.scale.x = val;
    }

    get scaleY() {
        return this.scale.y;
    }

    set scaleY(val) {
        this.scale.y = val;
    }
}
