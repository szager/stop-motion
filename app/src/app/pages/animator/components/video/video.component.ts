import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit {

  @ViewChild('video', {static: true}) public video: ElementRef;

  constructor() { }

  ngOnInit() {
  console.log('🚀 ~ file: video.component.ts ~ line 15 ~ VideoComponent ~ video', this.video);
  }

}
