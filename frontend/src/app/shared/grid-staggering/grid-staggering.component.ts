import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-grid-staggering',
  standalone: true,
  templateUrl: 'grid-staggering.component.html',
  imports: [NgStyle],
  styles: [
    `
      .stagger-visualizer div {
        width: 1rem;
        height: 1rem;
        background: lime;
        box-sizing: border-box;
      }
    `,
  ],
})
export class GridStaggeringComponent implements AfterViewInit {
  @ViewChild('staggerVisualizer', { static: false }) staggerVisualizer!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) gridSize: number = 5;

  ngAfterViewInit() {
    setTimeout(() => {
      const staggerVisualizerEl = this.staggerVisualizer.nativeElement;
      const fragment = document.createDocumentFragment();
      const grid = [this.gridSize, this.gridSize];
      const numberOfElements = grid[0] * grid[1];

      for (let i = 0; i < numberOfElements; i++) {
        const div = document.createElement('div');
        fragment.appendChild(div);
      }
      staggerVisualizerEl.appendChild(fragment);

      // change box color
      staggerVisualizerEl.querySelectorAll('div').forEach((el) => {
        (el as HTMLElement).style.background = '#00D390FF';
      });

      const staggersAnimation = anime
        .timeline({
          targets: '.stagger-visualizer div',
          easing: 'easeInOutSine',
          delay: anime.stagger(50),
          loop: true,
          autoplay: false,
        })
        .add({
          translateX: [
            { value: anime.stagger('-.1rem', { grid, from: 'center', axis: 'x' }) },
            { value: anime.stagger('.1rem', { grid, from: 'center', axis: 'x' }) },
          ],
          translateY: [
            { value: anime.stagger('-.1rem', { grid, from: 'center', axis: 'y' }) },
            { value: anime.stagger('.1rem', { grid, from: 'center', axis: 'y' }) },
          ],
          duration: 1000,
          scale: 0.5,
          delay: anime.stagger(100, { grid, from: 'center' }),
        })
        .add({
          translateX: () => anime.random(-10, 10),
          translateY: () => anime.random(-10, 10),
          delay: anime.stagger(8, { from: 'last' }),
        })
        .add({
          translateX: anime.stagger('.25rem', { grid, from: 'center', axis: 'x' }),
          translateY: anime.stagger('.25rem', { grid, from: 'center', axis: 'y' }),
          rotate: 0,
          scaleX: 2.5,
          scaleY: 0.25,
          delay: anime.stagger(4, { from: 'center' }),
        })
        .add({
          rotate: anime.stagger([90, 0], { grid, from: 'center' }),
          delay: anime.stagger(50, { grid, from: 'center' }),
        })
        .add({
          translateX: 0,
          translateY: 0,
          scale: 0.5,
          scaleX: 1,
          rotate: 180,
          duration: 1000,
          delay: anime.stagger(100, { grid, from: 'center' }),
        })
        .add({
          scaleY: 1,
          scale: 1,
          delay: anime.stagger(20, { grid, from: 'center' }),
        });
      staggersAnimation.play();
    }, 0);
  }
}
