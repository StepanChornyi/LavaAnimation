import BaseRectMesh from "../../RectMesh/RectMesh";

// const topColor = 0xb13d3d;
// const bottomColor = 0x32146e;

import RenderTexture from "../../WebGL/RenderTexture";
import MaskSprite from "./MaskSprite";
import SkipFitterSprite from "./SkipFilterSprite";

export default class SkipFilter {
    constructor(gl) {
        this.gl = gl;

        this._rt1 = new RenderTexture(gl);
        this._rt2 = new RenderTexture(gl);
        this._activeRt = this._rt1;

        this.sprite = new SkipFitterSprite(gl);
        this.maskSprite = new MaskSprite(gl);

        this.texture = this._activeRt.texture;
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const gl = this.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.uniform1i(gl.getUniformLocation(this.program, "spriteTexture"), 0);
    }

    onResize(width, height) {
        this._rt1.setSize(width, height);
        this._rt2.setSize(width, height);
        this.sprite.setSize(width, height)
        this.maskSprite.setSize(width, height)
    }

    render(viewMatrix3x3, texture) {
        const gl = this.gl;

        this._bindRenderTexture(this._rt1);

        const stroke = 30;

        this.sprite.texture = texture;
        this.sprite.setOffset(50, stroke);
        this.sprite.render(viewMatrix3x3);


        for (let i = 0; i < 5; i++) {
            this._bindRenderTexture(this._rt2);

            this.sprite.texture = this._rt1.texture;
            this.sprite.setOffset(0, stroke);
            this.sprite.render(viewMatrix3x3);
    
            this._bindRenderTexture(this._rt1);
    
            this.sprite.texture = this._rt2.texture;
            this.sprite.setOffset(-50, stroke);
            this.sprite.render(viewMatrix3x3);
        }
        
   
        this._bindRenderTexture(this._rt2);

        this.maskSprite.texture = this._rt1.texture;
        this.maskSprite.maskTexture = texture;
        this.maskSprite.render(viewMatrix3x3);
    }

    _bindRenderTexture(rt) {
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frameBuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, rt.width, rt.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}