import { Geometry, Mesh, Vector3 } from 'three';
import Triangle from './Triangle';
import { isBufferGeometry } from './utils';
import BSPNode from './BSPNode';

export function convertGeometryToTriangles(
  geometry: Mesh['geometry']
): Triangle[] {
  const triangles: Triangle[] = [];

  if (isBufferGeometry(geometry)) {
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    const uv = geometry.getAttribute('uv');

    const index = geometry.getIndex();
    if (index) {
      for (let i = 0; i < index.array.length; i+=3) {
        let j = index.array[i];
        const a = [position.getX(j), position.getY(j), position.getZ(j)];
        if (normal) a.push(normal.getX(j), normal.getY(j), position.getZ(j));
        if (uv) a.push(uv.getX(j), uv.getY(j));
        j = index.array[i + 1];
        const b = [position.getX(j), position.getY(j), position.getZ(j)];
        if (normal) b.push(normal.getX(j), normal.getY(j), position.getZ(j));
        if (uv) b.push(uv.getX(j), uv.getY(j));
        j = index.array[i + 2];
        const c = [position.getX(j), position.getY(j), position.getZ(j)];
        if (normal) c.push(normal.getX(j), normal.getY(j), position.getZ(j));
        if (uv) c.push(uv.getX(j), uv.getY(j));

        triangles.push(new Triangle(a, b, c));
      }
    } else {
      for (let j = 0; j < position.count; j++) {
        const a = [position.getX(j), position.getY(j), position.getZ(j)];
        if (normal) a.push(normal.getX(j), normal.getY(j), position.getZ(j));
        if (uv) a.push(uv.getX(j), uv.getY(j));
        j++;
        const b = [position.getX(j), position.getY(j), position.getZ(j)];
        if (normal) b.push(normal.getX(j), normal.getY(j), position.getZ(j));
        if (uv) b.push(uv.getX(j), uv.getY(j));
        j++;
        const c = [position.getX(j), position.getY(j), position.getZ(j)];
        if (normal) c.push(normal.getX(j), normal.getY(j), position.getZ(j));
        if (uv) c.push(uv.getX(j), uv.getY(j));

        triangles.push(new Triangle(a, b, c));
      }
    }
    return triangles;
  }

  const { faces, vertices } = geometry;
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];

    const va = vertices[face.a];
    const vb = vertices[face.b];
    const vc = vertices[face.c];

    const triangle = new Triangle([va.x, va.y, va.z], [vb.x, vb.y, vb.z], [vc.x, vc.y, vc.z]);

    triangles.push(triangle);
  }

  return triangles;
}

export function transformBSP(bsp: BSPNode, mesh: Mesh) {
  mesh.updateMatrixWorld(true);
  const { matrixWorld: transform } = mesh;
  return bsp.clone(transform);
}
