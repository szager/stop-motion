import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-message',
  templateUrl: './video-message.component.html',
  styleUrls: ['./video-message.component.scss'],
})
export class VideoMessageComponent implements OnInit {

  @ViewChild('videoMessage' , {static: true}) public videoMessage: ElementRef;

  constructor() { }

  ngOnInit() {}

}
