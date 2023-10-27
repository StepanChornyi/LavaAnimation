export const K_FACTOR = 100;

export const setKFactor = (shader) => {
    return shader
        .replace(/K_FACTOR_IVS_HALF/g, (0.5 / K_FACTOR))
        .replace(/K_FACTOR_IVS/g, (1 / K_FACTOR))
        .replace(/K_FACTOR/g, K_FACTOR.toFixed(1))
}
