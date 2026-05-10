import { Component, AfterViewInit } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';

declare const $: any;

@Component({
  selector: 'app-drag-menu',
  standalone: true,
  templateUrl: './dragged-menu.component.html',
  styleUrls: ['./dragged-menu.component.scss']
})
export class DraggedMenuComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.initMenu();
  }

  initMenu(): void {
    // === Ton JS adapté Angular ===

    let timeOut: any;

    class Item {
      $element: any;
      icon: string;
      prev: any = null;
      next: any = null;
      isMoving = false;

      constructor(icon: string, backgroundColor = 'white') {
        this.$element = $(document.createElement("div"));
        this.icon = icon;
        this.$element.addClass("item");
        this.$element.css("background-color", backgroundColor);

        const i = document.createElement("i");
        $(i).addClass("fi-" + icon);
        this.$element.append(i);

        this.$element.on("mousemove", () => {
          clearTimeout(timeOut);
          timeOut = setTimeout(() => {
            if (this.next && this.isMoving) {
              this.next.moveTo(this);
            }
          }, 10);
        });
      }

      moveTo(item: any) {
        anime({
          targets: this.$element[0],
          left: item.$element.css("left"),
          top: item.$element.css("top"),
          duration: 700,
          elasticity: 500
        });
        if (this.next) this.next.moveTo(item);
      }

      updatePosition() {
        anime({
          targets: this.$element[0],
          left: this.prev.$element.css("left"),
          top: this.prev.$element.css("top"),
          duration: 80
        });
        if (this.next) this.next.updatePosition();
      }
    }

    class Menu {
      $element: any;
      first: any = null;
      last: any = null;
      status = "closed";

      constructor(menu: string) {
        this.$element = $(menu);
      }

      add(item: any) {
        if (!this.first) {
          this.first = item;
          this.last = item;

          this.first.$element.on("mouseup", () => {
            if (this.first.isMoving) {
              this.first.isMoving = false;
            } else {
              this.click();
            }
          });

          item.$element.draggable({
            start: () => {
              this.close();
              item.isMoving = true;
            },
            drag: () => {
              if (item.next) item.next.updatePosition();
            },
            stop: () => {
              item.isMoving = false;
              if (item.next) item.next.moveTo(item);
            }
          });

        } else {
          this.last.next = item;
          item.prev = this.last;
          this.last = item;
        }

        // 👉 LIGNE IMPORTANTE
        this.$element.append(item.$element);
      }

      open() {
        this.status = "open";
        let current = this.first.next;
        let iterator = 1;
        const head = this.first;

        while (current) {
          anime({
            targets: current.$element[0],
            left: parseInt(head.$element.css("left")) + (iterator * 50),
            top: head.$element.css("top"),
            duration: 500
          });
          iterator++;
          current = current.next;
        }
      }

      close() {
        this.status = "closed";
        let current = this.first.next;
        const head = this.first;

        while (current) {
          anime({
            targets: current.$element[0],
            left: head.$element.css("left"),
            top: head.$element.css("top"),
            duration: 500
          });
          current = current.next;
        }
      }

      click() {
        this.status === "closed" ? this.open() : this.close();
      }
    }

    // === Initialisation ===
    const menu = new Menu("#myMenu");
    menu.add(new Item("list"));
    menu.add(new Item("torso", "#FF5C5C"));
    menu.add(new Item("social-facebook", "#5CD1FF"));
    menu.add(new Item("paypal", "#FFF15C"));
    menu.add(new Item("link", "#64F592"));

    setTimeout(() => {
      menu.open();
      setTimeout(() => menu.close(), 1000);
    }, 50);
  }
}
