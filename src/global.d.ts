import { ThreeElements } from '@react-three/fiber';

export {};

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export class MeshLineGeometry extends THREE.BufferGeometry {
    // MeshLineGeometry의 구체적인 속성과 메서드
  }
  export class MeshLineMaterial extends THREE.ShaderMaterial {
    // MeshLineMaterial의 구체적인 속성과 메서드
  }
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {
        meshLineGeometry: {
          attach?: string;
          args?: any[];
          [key: string]: any;
        };
        meshLineMaterial: {
          attach?: string;
          color?: string;
          depthTest?: boolean;
          resolution?: [number, number];
          useMap?: boolean;
          map?: any;
          repeat?: [number, number];
          lineWidth?: number;
          [key: string]: any;
        };
      }
    }
  }
}
