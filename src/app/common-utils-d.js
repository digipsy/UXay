declare module './common-utils' {
    export function loadTexture(url: string): Promise<THREE.Texture>;
    // Add type definitions for other exports from common-utils
  }