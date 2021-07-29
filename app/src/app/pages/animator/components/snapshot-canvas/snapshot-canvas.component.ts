import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-snapshot-canvas',
  templateUrl: './snapshot-canvas.component.html',
  styleUrls: ['./snapshot-canvas.component.scss'],
})
export class SnapshotCanvasComponent implements OnInit {

  @ViewChild('snapshotCanvas' , {static: true}) public snapshotCanvas: ElementRef;

  constructor() { }

  ngOnInit() {}

}
