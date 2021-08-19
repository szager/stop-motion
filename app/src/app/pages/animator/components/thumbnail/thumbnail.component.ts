import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit {

  @ViewChild('thumbnail', { static: true }) public thumbnail: ElementRef;
  @Input() frame: HTMLCanvasElement;

  public ctx: CanvasRenderingContext2D;
  public width = this.animatorService.animator.width/5 - 6;
  public height = this.animatorService.animator.height/5;

  constructor(
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {
    console.log(this.width);
    this.thumbnail.nativeElement.width = this.width;
    this.thumbnail.nativeElement.height = this.height;
    this.ctx = this.thumbnail.nativeElement.getContext('2d');
    this.ctx.drawImage(this.frame, 0, 0, this.width, this.height);
  }

}

