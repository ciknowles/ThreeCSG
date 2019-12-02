import { Matrix4, Vector3 } from 'three';

const EPSILON = 1e-6;

export const CLASSIFY_COPLANAR = 0;
export const CLASSIFY_FRONT = 1;
export const CLASSIFY_BACK = 2;
export const CLASSIFY_SPANNING = 3;

export type SIDE_CLASSIFICATION =
  | typeof CLASSIFY_COPLANAR
  | typeof CLASSIFY_FRONT
  | typeof CLASSIFY_BACK
  | typeof CLASSIFY_SPANNING;

const tempVector3 = new Vector3();

export default class Triangle {
  public a: Array<number>;
  public b: Array<number>;
  public c: Array<number>;
  public normal: Vector3;
  public w: number;

  applyMatrix4(matrix: Matrix4) {
    tempVector3.set(this.a[0], this.a[1], this.a[2]).applyMatrix4(matrix); this.a[0] = tempVector3.x; this.a[1] = tempVector3.y; this.a[2] = tempVector3.z;
    tempVector3.set(this.b[0], this.b[1], this.b[2]).applyMatrix4(matrix); this.b[0] = tempVector3.x; this.b[1] = tempVector3.y; this.b[2] = tempVector3.z;
    tempVector3.set(this.c[0], this.c[1], this.c[2]).applyMatrix4(matrix); this.c[0] = tempVector3.x; this.c[1] = tempVector3.y; this.c[2] = tempVector3.z;
  }

  constructor(a?: Array<number>, b?: Array<number>, c?: Array<number>) {
    if (a === undefined || b === undefined || c === undefined) {
      console.warn('Triangle constructor called w/o arguments');
      this.a = [0, 0, 0];
      this.b = [0, 0, 0];
      this.c = [0, 0, 0];
      this.normal = new Vector3();
      this.w = 0;
      return;
    }

    this.a = a.slice();
    this.b = b.slice();
    this.c = c.slice();

    this.normal = new Vector3();
    this.w = 0;
    this.computeNormal();
  }

  public toArrayBuffer(): ArrayBuffer {
    const arr: number[] = this.toNumberArray();
    return Float32Array.from(arr).buffer;
  }

  public toNumberArray(): number[] {
    const arr: number[] = [
      this.a[0], this.a[1], this.a[2],
      this.b[0], this.b[1], this.b[2],
      this.c[0], this.c[1], this.c[2],
      this.normal.x, this.normal.y, this.normal.z,
      this.w,
    ];

    return arr;
  }

  public fromNumberArray(arr: number[]): void {
    if (arr.length !== 13)
      throw new Error(`Array has incorrect size. It's ${arr.length} and should be 13`);

    this.a = [arr[0], arr[1], arr[2]];
    this.b = [arr[3], arr[4], arr[5]];
    this.c = [arr[6], arr[7], arr[8]];
    this.normal.set(arr[9], arr[10], arr[11]);
    this.w = arr[12];
  }

  public fromArrayBuffer(buff: ArrayBuffer) {
    const arr: Float32Array = new Float32Array(buff, 0,
      buff.byteLength / Float32Array.BYTES_PER_ELEMENT);

    this.fromNumberArray(Array.from(arr));
  }

  public computeNormal(): void {
    tempVector3.set(this.c[0] - this.a[0], this.c[1] - this.a[1], this.c[2] - this.a[2]);
    this.normal
      .set(this.b[0] - this.a[0], this.b[1] - this.a[1], this.b[2] - this.a[2])
      .cross(tempVector3)
      .normalize();
    this.w = this.normal.x * this.a[0] + this.normal.y * this.a[1] + this.normal.z * this.a[2];
  }

  classifyPoint(point: Array<number>): SIDE_CLASSIFICATION {
    const side = this.normal.x * point[0] + this.normal.y * point[1] + this.normal.z * point[2] - this.w;

    if (Math.abs(side) < EPSILON) return CLASSIFY_COPLANAR;
    if (side > 0) return CLASSIFY_FRONT;
    return CLASSIFY_BACK;
  }

  classifySide(triangle: Triangle): SIDE_CLASSIFICATION {
    let side = CLASSIFY_COPLANAR;

    side |= this.classifyPoint(triangle.a);
    side |= this.classifyPoint(triangle.b);
    side |= this.classifyPoint(triangle.c);

    return side as SIDE_CLASSIFICATION;
  }

  invert(): void {
    const { a, c } = this;
    this.a = c;
    this.c = a;
    if (this.a.length > 3) {
      this.a[3] *= -1; this.a[4] *= -1; this.a[5] *= -1;
      this.b[3] *= -1; this.b[4] *= -1; this.b[5] *= -1;
      this.c[3] *= -1; this.c[4] *= -1; this.c[5] *= -1;
    }
    this.normal.multiplyScalar(-1);
    this.w *= -1;
  }

  clone(): Triangle {
    return new Triangle(this.a, this.b, this.c);
  }
}
