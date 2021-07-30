import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit {

  @ViewChild('thumbnail', { static: true }) public thumbnail: ElementRef;
  @Input() frame: HTMLCanvasElement;

  public ctx: CanvasRenderingContext2D;
  public width = 96;
  public height = 72;

  ngOnInit() {
    this.ctx = this.thumbnail.nativeElement.getContext('2d');
    this.ctx.drawImage(this.frame, this.width, this.height);
  }

}

