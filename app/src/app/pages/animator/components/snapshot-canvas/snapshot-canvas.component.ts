import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-snapshot-canvas',
  templateUrl: './snapshot-canvas.component.html',
  styleUrls: ['./snapshot-canvas.component.scss'],
})
export class SnapshotCanvasComponent {

  @ViewChild('snapshotCanvas' , {static: true}) public snapshotCanvas: ElementRef;

}
