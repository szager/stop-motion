import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BasePage } from '@pages/base/base.page';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { PlayerCanvasComponent } from './components/player-canvas/player-canvas.component';
import { SnapshotCanvasComponent } from './components/snapshot-canvas/snapshot-canvas.component';
import { VideoMessageComponent } from './components/video-message/video-message.component';
import { VideoComponent } from './components/video/video.component';

@Component({
  selector: 'app-animator',
  templateUrl: 'animator.page.html',
  styleUrls: ['animator.page.scss'],
})
export class AnimatorPage extends BasePage implements AfterViewInit {

  @ViewChild('appVideo') videoComponent: VideoComponent;
  @ViewChild('appPlayerCanvas') playerCanvasComponent: PlayerCanvasComponent;
  @ViewChild('appSnapshotCanvas') snapshotCanvasComponent: SnapshotCanvasComponent;
  @ViewChild('appVideoMessage') videoMessageComponent: VideoMessageComponent;
  public state;

  constructor(
    public animatorService: AnimatorService,
    public baseService: BaseService
  ) {
    super(baseService);
    this.options.title = 'pages_title_animator';
    this.options.backButton = true;
    this.options.rightButton = true;
    this.options.rightHref = '/settings';
    
  }

  async ngAfterViewInit(): Promise<void> {
    console.log(this.videoComponent, this.playerCanvasComponent, this.snapshotCanvasComponent, this.videoMessageComponent);
    this.state = this.videoComponent.state;
    const video = this.videoComponent.video.nativeElement;
    const snapshotCanvas = this.snapshotCanvasComponent.snapshotCanvas.nativeElement;
    const playerCanvas = this.playerCanvasComponent.playerCanvas.nativeElement;
    const videoMessage = this.videoMessageComponent.videoMessage.nativeElement;
    await this.animatorService.init(video, snapshotCanvas, playerCanvas, videoMessage);
  }

}
