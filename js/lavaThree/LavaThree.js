import * as THREE from 'three';
import Fin from './fin/Fin';
import MyCircle from './circle/MyCircle';
import MySine from './sine/MySine';

export class LavaThree {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

        const camera = this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        const scene = this.scene = new THREE.Scene();

        const renderTargetOutline = this.renderTargetOutline = new THREE.WebGLRenderTarget(10, 10, { depthBuffer: false });
        const renderTargetOutlineSkip = this.renderTargetOutlineSkip = new THREE.WebGLRenderTarget(10, 10, { depthBuffer: false });

        const mycArr = this.mycArr = [];
        const tmpScene = this.tmpScene = new THREE.Scene();

        {
            const myc = new MyCircle(new THREE.Vector3());

            myc.setPosition(300, 400);
            myc.setRadius(50);

            mycArr.push(myc);
            tmpScene.add(myc);
        }

        {
            const myc = new MyCircle(new THREE.Vector3());

            myc.setPosition(300, 300);
            myc.setRadius(50);

            myc.material.uniforms.channels.value.set(0, 0, 1, 0);

            mycArr.push(myc);
            tmpScene.add(myc);
        }

        const myc2 = this.myc2 = new MySine();

        myc2.material.uniforms.channels.value.set(0, 1, 0, 0);

        window.addEventListener("mousemove", (evt) => {
            myc2.setPosition(evt.clientX, evt.clientY);
        })

        const tmpScene2 = this.tmpScene2 = new THREE.Scene();

        tmpScene.add(myc2);

        const fin = this.fin = new Fin(renderTargetOutline.texture, renderTargetOutlineSkip.texture, camera.near, camera.far);

        scene.add(fin);
    }

    update(dt, time) {
        this.myc2.onUpdate(dt);
    }

    render() {
        const { renderer, camera, scene } = this;

        renderer.setClearColor(0x000000, 0)
        renderer.setRenderTarget(this.renderTargetOutline);
        renderer.render(this.tmpScene, camera);

        // renderer.setClearColor(0xffffff, 1)
        // renderer.setRenderTarget(this.renderTargetOutline);
        // renderer.render(this.tmpScene2, camera);

        renderer.setClearColor(0x303030, 1)
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }

    resize(width, height) {
        const { renderer, camera } = this;

        renderer.setSize(width, height);

        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        this.renderTargetOutline.setSize(width, height);
        this.renderTargetOutlineSkip.setSize(width, height);


        for (let i = 0; i < this.mycArr.length; i++) {
            this.mycArr[i].onResize(width, height);
        }

        this.myc2.onResize(width, height);
    }
}