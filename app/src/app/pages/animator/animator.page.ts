import { Component, ViewChild } from '@angular/core';
import { CameraStatus } from '@enums/camera-status.enum';
import { Platform } from '@ionic/angular';
import { BasePage } from '@pages/base/base.page';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { Observable } from 'rxjs';
import { PlayerCanvasComponent } from './components/player-canvas/player-canvas.component';
import { SnapshotCanvasComponent } from './components/snapshot-canvas/snapshot-canvas.component';
import { VideoComponent } from './components/video/video.component';

@Component({
  selector: 'app-animator',
  templateUrl: 'animator.page.html',
  styleUrls: ['animator.page.scss'],
})
export class AnimatorPage extends BasePage {

  @ViewChild('appVideo') videoComponent: VideoComponent;
  @ViewChild('appPlayerCanvas') playerCanvasComponent: PlayerCanvasComponent;
  @ViewChild('appSnapshotCanvas') snapshotCanvasComponent: SnapshotCanvasComponent;
  public state: Observable<CameraStatus>;

  constructor(
    public animatorService: AnimatorService,
    public baseService: BaseService,
    public platform: Platform
  ) {
    super(baseService);
  }

  async ionViewWillEnter() {
    this.state = this.videoComponent.state;
    const video = this.videoComponent.video.nativeElement;
    const snapshotCanvas = this.snapshotCanvasComponent.snapshotCanvas.nativeElement;
    const playerCanvas = this.playerCanvasComponent.playerCanvas.nativeElement;
    await this.animatorService.init(video, snapshotCanvas, playerCanvas);
  }

  ionViewWillLeave() {
    this.animatorService.destroy();
  }

}
