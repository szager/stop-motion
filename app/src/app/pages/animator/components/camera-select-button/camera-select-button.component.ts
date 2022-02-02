import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-camera-select-button',
  templateUrl: './camera-select-button.component.html',
  styleUrls: ['./camera-select-button.component.scss'],
})
export class CameraSelectButtonComponent extends BaseComponent implements OnInit {

  public isDisabled = true;
  private cameras: MediaDeviceInfo[];

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
    this.cameras = [];
  }

  ngOnInit() {
    this.animatorService.getCameras().pipe(takeUntil(this.unsubscribe$)).subscribe((cameras: MediaDeviceInfo[]) => {
      this.cameras = cameras;
      this.isDisabled = (this.cameras.length > 1 || this.isIos) ? false : true;
    });
  }

  async onClick() {
    console.log('🚀 ~ file: camera-select-button.component.ts ~ line 33 ~ CameraSelectButtonComponent ~ onClick ~ onClick');
    const layoutOptions = await this.baseService.layoutService.getLayoutOptions().pipe(take(1)).toPromise();
    await this.animatorService.switchCamera(layoutOptions);
  }

}
