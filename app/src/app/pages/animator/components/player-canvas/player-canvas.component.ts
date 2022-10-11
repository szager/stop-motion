import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-player-canvas',
  templateUrl: './player-canvas.component.html',
  styleUrls: ['./player-canvas.component.scss'],
})
export class PlayerCanvasComponent extends BaseComponent implements OnInit {

  @ViewChild('playerCanvas', { static: true }) public playerCanvas: ElementRef;

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  ngOnInit() {
    this.animatorService.animator.getIsPlaying().pipe(takeUntil(this.unsubscribe$)).subscribe((isPlaying: boolean) => {
      this.isPlaying = isPlaying;
    });
  }

}
