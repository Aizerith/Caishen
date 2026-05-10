import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import anime from 'animejs/lib/anime.es.js';

type MenuStatus = 'open' | 'closed';

@Component({
  selector: 'app-animated-menu',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './animated-menu.component.html',
  styleUrls: ['./animated-menu.component.scss'],
})
export class AnimatedMenuComponent implements AfterViewInit {
  itemData = [
    { icon: 'list',             color: '#FFFFFF' },
    { icon: 'torso',            color: '#FF5C5C' },
    { icon: 'social-facebook',  color: '#5CD1FF' },
    { icon: 'paypal',           color: '#FFF15C' },
    { icon: 'link',             color: '#64F592' },
  ];

  status: MenuStatus = 'closed';
  dragPos = { x: 0, y: 0 };
  isDraggingGlobal = false;
  dragDisabled = false;
  headDown = false;
  headStart = { x: 0, y: 0 };
  headEnd   = { x: 0, y: 0 };
  headThresholdPx = 5;

  @ViewChild('menu', { static: true }) menuRef!: ElementRef<HTMLElement>;
  @ViewChildren('itemEl') itemRefs!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    const size = 40;
    this.dragPos = {
      x: Math.round(window.innerWidth / 2 - size / 2),
      y: Math.round(window.innerHeight / 2 - size / 2),
    };

    this.itemRefs.forEach(ref => {
      const el = ref.nativeElement;
      el.style.position = 'absolute';
      el.style.left = '0px';
      el.style.top = '0px';
    });
  }

  onHeadPointerDown(ev: PointerEvent) {
    this.headDown = true;
    this.dragDisabled = true;
    this.headStart = { x: ev.clientX, y: ev.clientY };
  }

  onHeadPointerUp(ev: PointerEvent) {
    this.headDown = false;
    this.headEnd = { x: ev.clientX, y: ev.clientY };

    const dx = Math.abs(this.headEnd.x - this.headStart.x);
    const dy = Math.abs(this.headEnd.y - this.headStart.y);
    const moved = dx > this.headThresholdPx || dy > this.headThresholdPx;

    if (!moved && !this.isDraggingGlobal) {
      this.toggle();
    }
    setTimeout(() => (this.dragDisabled = false), 0);
  }

  onItemClick(idx: number) {
    if (idx === 0) return; // head géré par pointerdown/up
  }

  toggle(): void {
    this.status === 'closed' ? this.open() : this.close();
  }

  open(): void {
    this.status = 'open';

    const rect = this.menuRef.nativeElement.getBoundingClientRect();
    const dir = rect.left < window.innerWidth / 2 ? 1 : -1;

    const items = this.itemRefs.toArray().map(r => r.nativeElement);
    const head = items[0];

    items.slice(1).forEach((item, i) => {
      anime({
        targets: item,
        left: `${(i + 1) * 50 * dir}px`,
        top: '0px',
        duration: 600,
        easing: 'easeOutElastic(1, .7)',
      });
    });
    anime({ targets: head, scale: [1, 1.08, 1], duration: 220, easing: 'easeOutQuad' });
  }

  close(): void {
    this.status = 'closed';

    const items = this.itemRefs.toArray().map(r => r.nativeElement);
    const head = items[0];

    items.slice(1).forEach(item => {
      anime({
        targets: item,
        left: '0px',
        top: '0px',
        duration: 380,
        easing: 'easeInOutQuad',
      });
    });
    anime({ targets: head, scale: [1, 0.95, 1], duration: 180, easing: 'easeOutQuad' });
  }

  onDragStarted(): void {
    this.isDraggingGlobal = true;
  }

  onDragEnded(_e: CdkDragEnd): void {
    if (this.status === 'open') {
      this.close();
      setTimeout(() => this.open(), 60);
    }
    setTimeout(() => (this.isDraggingGlobal = false), 0);
  }
}
