import { Component } from '@angular/core';
import {GridStaggeringComponent} from '../grid-staggering/grid-staggering.component';
import {AnimatedMenuComponent} from '../animated-menu/animated-menu.component';
import {DraggedMenuComponent} from '../dragged-menu/dragged-menu.component';

@Component({
  selector: 'app-demo-anime',
  imports: [GridStaggeringComponent, AnimatedMenuComponent, DraggedMenuComponent],
  templateUrl: './demo-anime.component.html',
  styleUrl: './demo-anime.component.css',
})
export class DemoAnimeComponent {}
