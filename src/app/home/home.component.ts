import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, ViewChild, OnDestroy, OnInit, HostListener, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RippleEffectService } from '../ripple-effect.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit  {
  projects = [
    {
      id: 0,
      srNo: '01',
      name: 'Prudential Insurance',
      image: '/assets/img/pud-banner.png',
    },
    {
      id: 1,
      srNo: '02',
      name: 'American Chemical Society',
      image: '/assets/img/acs-banner.png',
    },
    {
      id: 2,
      srNo: '03',
      name: 'Tia Health',
      image: '/assets/img/tia-banner.png',
    },
    {
      id: 3,
      srNo: '04',
      name: 'Arist',
      image: '/assets/img/arist-banner.png',
    },
    {
      id: 4,
      srNo: '05',
      name: 'Gizmo',
      image: '/assets/img/gizmo-banner.png',
    },
    {
      id: 5,
      srNo: '06',
      name: 'Workee',
      image: '/assets/img/workee-banner.png',
    }
  ]

  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private lastTimestamp: number = performance.now();

  @ViewChild('canvasElement', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private rippleEffectService: RippleEffectService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.rippleEffectService.initialize(this.canvas.nativeElement);
      this.rippleEffectService.animate();
      
      // console.log('The PlatformBrowser is active and the platform id is:', this.platformId )
      // console.log('The rippleEffectService is initialized and the canvas is:', this.canvas )
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const x = event.clientX / window.innerWidth;
    const y = 1 - event.clientY / window.innerHeight;
    const dx = event.clientX - this.lastMouseX;
    const dy = event.clientY - this.lastMouseY;
    const dt = performance.now() - this.lastTimestamp;

    const speed = Math.sqrt(dx * dx + dy * dy) / (dt || 1);

    this.rippleEffectService.handleMouseMove(event);

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.lastTimestamp = performance.now();
    
  }
  
  @HostListener('window:resize')
  onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.rippleEffectService.resize(width, height);
  }
}