import { Component, OnInit } from '@angular/core';
import { Animator } from '@models/animator';
import { BasePage } from '@pages/base/base.page';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-animator',
  templateUrl: 'animator.page.html',
  styleUrls: ['animator.page.scss'],
})
export class AnimatorPage extends BasePage implements OnInit {

  constructor(
    public baseService: BaseService
  ) {
    super(baseService);
    this.options.title = 'pages_title_animator';
    this.options.backButton = true;
    this.options.rightButton = true;
    this.options.rightHref = '/settings';
  }

  ngOnInit(): void {
   /*  const video = document.getElementById('video');
    const snapshotCanvas = document.getElementById('snapshot-canvas');
    const playCanvas = document.getElementById('play-canvas');
    const videoMessage = document.getElementById('video-message');
    const an = new Animator(video, snapshotCanvas, playCanvas, videoMessage);
    console.log('🚀 ~ file: animator.page.ts ~ line 25 ~ AnimatorPage ~ ngOnInit ~ an', an); */
  }

}
