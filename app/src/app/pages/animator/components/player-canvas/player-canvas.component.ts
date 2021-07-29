import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-player-canvas',
  templateUrl: './player-canvas.component.html',
  styleUrls: ['./player-canvas.component.scss'],
})
export class PlayerCanvasComponent implements OnInit {

  @ViewChild('playerCanvas' , {static: true}) public playerCanvas: ElementRef;

  constructor() { }

  ngOnInit() {}

}
