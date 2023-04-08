const BLEND_DIST_FACTOR = 100;
const MAX_OBJECTS_COUNT = 64;
const MIN_RADIUS = -1000;
const EMPTY_DATA_VAL = MIN_RADIUS - 1;
const DATA_TEXTURE_SIZE = MAX_OBJECTS_COUNT;
const DATA_TEXTURE_SIZE_IVS = 1 / DATA_TEXTURE_SIZE;
const MASK_SCALE = 0.1;
const MASK_EDGE_OFFSET = 7;

export {
    MIN_RADIUS,
    EMPTY_DATA_VAL,
    BLEND_DIST_FACTOR,
    MAX_OBJECTS_COUNT,
    DATA_TEXTURE_SIZE,
    DATA_TEXTURE_SIZE_IVS,
    MASK_SCALE,
    MASK_EDGE_OFFSET,
};