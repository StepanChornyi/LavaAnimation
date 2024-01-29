import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';

import DFMesh from '../DFMesh';

import vs from "./mergedCirclesDF.vs.glsl";
import fs from "./mergedCirclesDF.fs.glsl";
import { K_FACTOR, setKFactor } from '../../LavaConfig';

export default class MergedCirclesDFMesh extends DFMesh {
    constructor(circleDFA, circleDFB) {
        const material = new ShaderMaterial({
            vertexShader: setKFactor(vs),
            fragmentShader: setKFactor(fs),
            uniforms: {
                screenSize: { value: new Vector2() },
                circleA: { value: circleDFA.dimensions },
                circleB: { value: circleDFB.dimensions },
                dimensions: { value: new Vector4() },
                channels: { value: new Vector4() },
            },
        });

        super(material);

        this.circleDFA = circleDFA;
        this.circleDFB = circleDFB;

        this.add(circleDFA, circleDFB)

        this._dimensions = this.material.uniforms.dimensions.value;
    }

    setRenderChannel(renderChannel) {
        super.setRenderChannel(renderChannel);

        this.circleDFA.setRenderChannel(renderChannel);
        this.circleDFB.setRenderChannel(renderChannel);
    }

    onUpdate() {
        const { circleDFA, circleDFB } = this;

        const dX = Math.abs(circleDFA.x - circleDFB.x);
        const dY = Math.abs(circleDFA.y - circleDFB.y);
        const maxDist = circleDFA.radius + circleDFB.radius + K_FACTOR;

        const renderSeparateCircles = (dX > maxDist || dY > maxDist);

        if (renderSeparateCircles) {
            this._dimensions.set(-10000, -10000, -100, -100);

            circleDFA.visible = true;
            circleDFA.visible = true;

            return;
        }

        circleDFA.visible = false;
        circleDFA.visible = false;

        const minX = Math.min(circleDFA.left, circleDFB.left);
        const minY = Math.min(circleDFA.top, circleDFB.top);
        const maxX = Math.max(circleDFA.right, circleDFB.right);
        const maxY = Math.max(circleDFA.bottom, circleDFB.bottom);

        const x = (minX + maxX) * 0.5;
        const y = (minY + maxY) * 0.5;
        const halfWidth = Math.max(0, (maxY - minY - K_FACTOR) * 0.5);
        const halfHeight = Math.max(0, (maxY - minY - K_FACTOR) * 0.5);

        this._dimensions.set(x, y, halfWidth, halfHeight);
    }

    onResize(width, height) {
        super.onResize(width, height);

        // console.log(this.circleDFA, this.circleDFB);


        this.circleDFA.onResize(width, height);
        this.circleDFB.onResize(width, height);
    }
}