import { Injectable, ElementRef, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import html2canvas from 'html2canvas';

import heightmapFragment from './shaders/heightmapFragment';
import smoothFragment from './shaders/smoothFragment';
import waterFragment from './shaders/waterFragment';
import waterVertex from './shaders/waterVertex';

@Injectable({
  providedIn: 'root',
})

export class RippleEffectService implements OnDestroy {
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private plane!: THREE.Mesh;
  private animationFrameId: number | null = null;
  private mousePosition = new THREE.Vector2(0.0, 0.0);
  private mouseSpeed = 0.0;
  private startTime!: 0.0;
  private texture!: THREE.CanvasTexture;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async initialize(canvas: HTMLCanvasElement): Promise<void> {

    console.log('Initializing RippleEffectService');

    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    console.log('Renderer size set to:', window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 1;
    this.scene.add(this.camera);
    console.log(this.scene.children)

    const shallowWater = new THREE.PlaneGeometry(5, 3, 80, 80);

    const material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        transparent: true,
        wireframe: true        
    });

    const elapsedTime = (performance.now() - this.startTime) / 1000; // Seconds
    material.uniforms['uTime'].value = elapsedTime;

    console.log('Page was loaded since:', elapsedTime.toString());
    
    // console.log('Material Color is set to:', material.vertexShader);
    // console.log('Material Color is set to:', material.fragmentShader);
    
    this.plane = new THREE.Mesh(shallowWater, material);
    this.scene.add(this.plane);

    console.log('Initialization complete:', {
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      plane: this.plane,
    });

    window.addEventListener('mousemove', this.handleMouseMove.bind(this));

    
    this.animate();
  }

  private uniforms = {
    uTime: { value: 0.0 },
    uSpeed: { value: 0.0 },
    uColor: {value: new THREE.Color(0.8, 0.2, 0.2)},
    uMouse: { value: new THREE.Vector2(0.0, 0.0)},
  };
  
  private vertexShader = /* glsl */ `
    precision mediump float;
    
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uSpeed;

    varying vec2 vUv;

    // GLSL Simplex Noise Implementation
    vec4 permute(vec4 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
    }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      vec3 ns = D.wyz * vec3(1.0 / 7.0) - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(
          dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(
          dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1),
          dot(p2, x2), dot(p3, x3)));
  }

  void main() {
      vUv = uv;
      vec3 pos = position;
  
      // Calculate distance from vertex to mouse cursor
      float dist = distance(vec2(pos.x, pos.y), uMouse);
      
      // Define an influence radius
      float radius = 0.56; // Adjust this radius as needed
      float effect = smoothstep(radius, 0.2, dist); // Smooth blend within radius

      // Calculate noise
      vec2 uvNoise = vUv * 10.0; // Scale UVs for more ripples
      float noisePos = snoise(vec3(uvNoise.x, uvNoise.y, uTime * 0.8));

      // Apply noise scaled by effect (closer vertices have stronger influence)
      pos.z += (1.0 * effect * dist) * noisePos * 0.1;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;


  private fragmentShader = /* glsl */`
    
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      gl_FragColor = vec4(vUv.x, vUv.y, 1.0, 1.0);
    }
  `;

  animate(): void {
    const renderLoop = (time: number) => {
      this.uniforms.uTime.value = time * 0.001;
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(renderLoop);
      // console.log('animationFrameId inside renderLoop:', this.animationFrameId);
    };

    renderLoop(0);
    // console.log('Starting animation...');
  }

  handleMouseMove(event: MouseEvent): void {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -((event.clientY / window.innerHeight) * 2 - 1);
    const newMousePosition = new THREE.Vector2(mouseX, mouseY);

    this.mouseSpeed = newMousePosition.distanceTo(this.mousePosition);

    this.uniforms.uMouse.value.set(mouseX, mouseY);
    this.uniforms.uSpeed.value = this.mouseSpeed;

    this.mousePosition.copy(newMousePosition);
  }

  resize(width: number, height: number): void {
    if (!this.renderer || !this.camera) {
      console.warn('Renderer or camera is not initialized, skipping resize.');
      return;
    }
  
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      console.log(this.animationFrameId)
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}