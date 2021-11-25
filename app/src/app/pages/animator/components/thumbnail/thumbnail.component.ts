import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit {

  @ViewChild('thumbnail', { static: true }) public thumbnail: ElementRef;
  @Input() frame: HTMLCanvasElement;
  @Input() index: number;
  @Output() thumbnailClicked = new EventEmitter();

  public ctx: CanvasRenderingContext2D;
  public width = this.animatorService.animator.width;
  public height = this.animatorService.animator.height;

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {
    this.thumbnail.nativeElement.width = this.width;
    this.thumbnail.nativeElement.height = this.height;
    this.ctx = this.thumbnail.nativeElement.getContext('2d');
    this.ctx.drawImage(this.frame, 0, 0, this.width, this.height);
  }

  onClick() {
    this.thumbnailClicked.emit(this.index);
  }

}

