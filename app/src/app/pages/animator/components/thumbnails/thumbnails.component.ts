import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-thumbnails',
  templateUrl: './thumbnails.component.html',
  styleUrls: ['./thumbnails.component.scss'],
})
export class ThumbnailsComponent extends BaseComponent implements OnInit {

  @ViewChild('thumbnailsContainer', { static: true }) public thumbnailsContainer: ElementRef;

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  ngOnInit() {
    this.list = this.animatorService.getFrames();
  }

}
