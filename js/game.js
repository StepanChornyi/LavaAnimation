import { LoaderType, AssetManager, GameObject, AssetType, Asset, Debug } from 'black-engine';

import SceneOld from './sceneOld/scene-old';
import Scene from './Scene/Scene';

export class Game extends GameObject {
  constructor() {
    super();

    const assets = new CustomAssetManager();

    assets.on('complete', this.onAssetsLoadded, this);

    assets.loadQueue();
  }

  onAssetsLoadded(m) {
    this.touchable = true;

    // this.add(new SceneOld());
    this.add(new Scene("canvas3D3", 13));
    this.add(new Scene("canvas3D2", 7));
    this.add(new Scene("canvas3D", 1));
  }
}

AssetType.XHR = 'xhr';

export class XHRAsset extends Asset {
  constructor(name, url) {
    super(AssetType.XHR, name);

    this.mUrl = url;
    this.mXHR = null;
  }

  onLoaderRequested(factory) {
    this.mXHR = factory.get(LoaderType.XHR, this.mUrl);
    this.mXHR.mimeType = 'text/plain';
    this.mXHR.responseType = 'text';
    this.addLoader(this.mXHR);
  }

  onAllLoaded() {
    super.ready(this.mXHR.data);
  }
}

class CustomAssetManager extends AssetManager {
  constructor() {
    super();

    Cache.enabled = false;

    this.mGlTextures = {};
  }

  registerDefaultTypes() {
    super.registerDefaultTypes();

    this.mAssetTypeMap[AssetType.XHR] = XHRAsset;
  }

  enqueueXHR(name, url) {
    this.enqueueAsset(name, this.__getAsset(AssetType.XHR, name, this.mDefaultPath + url));
  }

  getXHRAsset(name) {
    const xmlAssets = this.mAssets[AssetType.XHR];

    if (!xmlAssets || !xmlAssets[name]) {
      Debug.warn(`XHR asset "${name}" not foun in cache`);

      return null;
    }

    return xmlAssets[name];
  }

  addGLTexture(name, texture) {
    this.mGlTextures[name] = texture;
  }

  getGLTexture(name) {
    return this.mGlTextures[name];
  }
}