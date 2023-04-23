import { LoaderType, AssetManager, GameObject, AssetType, Asset, Debug } from 'black-engine';

import Scene from './Scene/scene';

export class Game extends GameObject {
  constructor() {
    super();

    const assets = new AssetManager();

    assets.on('complete', this.onAssetsLoaded, this);

    assets.loadQueue();
  }

  onAssetsLoaded() {
    this.touchable = true;

    this.add(new Scene(document.getElementById("blobContainer")));
  }
}