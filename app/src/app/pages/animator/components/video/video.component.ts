import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { LayoutOptions } from '@interfaces/layout-options.interface';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CameraStatus } from '@enums/camera-status.enum';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  animations: [
    // Each unique animation requires its own trigger. The first argument of the trigger function is the name
    trigger('rotatedState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('rotated => default', animate('1500ms ease-out')),
      transition('default => rotated', animate('400ms ease-in'))
    ])
  ]
})
export class VideoComponent extends BaseComponent {

  @ViewChild('video', { static: true }) public video: ElementRef;

  public cameraStatus = CameraStatus;
  public cameraRotation = 'default';
  public height: number;
  public width: number;

  constructor(
    public animatorService: AnimatorService,
    public baseService: BaseService
  ) {
    super(baseService);
    this.state = combineLatest([this.animatorService.getCameraStatus(), this.animatorService.getCameraIsRotated()
      , this.baseService.layoutService.getLayoutOptions()])
    .pipe(tap(([camerStatus, cameraIsRotated, layoutOptions]: [CameraStatus, boolean, LayoutOptions]) => {
      this.cameraRotation = (cameraIsRotated) ? 'rotated' : 'default';
      // TODO could probably removed
      const screenDimensions = this.animatorService.animator.calculateDimensions(layoutOptions);
      this.height = screenDimensions.height;
      this.width = screenDimensions.width;
      return camerStatus;
    }));
  }
}
