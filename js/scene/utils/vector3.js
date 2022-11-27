export default class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  fromVec3(vec3) {
    this.x = vec3[0];
    this.y = vec3[1];
    this.z = vec3[2];

    return this;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  add(vector3) {
    this.x += vector3.x;
    this.y += vector3.y;
    this.z += vector3.z;

    return this;
  }

  multiplyScalar(val) {
    this.x *= val;
    this.y *= val;
    this.z *= val;

    return this;
  }

  copyFrom(vector3) {
    this.x = vector3.x;
    this.y = vector3.y;
    this.z = vector3.z;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  static new() {
    return pool.pop() || new Vector3();
  }

  static release(...instances) {
    pool.push(...instances);
  }
}

const pool = [];