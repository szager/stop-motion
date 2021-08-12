import { Component, OnInit } from '@angular/core';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-orientation-button',
  templateUrl: './orientation-button.component.html',
  styleUrls: ['./orientation-button.component.scss'],
})
export class OrientationButtonComponent implements OnInit {

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) { }

  ngOnInit() {}

  public async onClick() {
    const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
    if (frames.length) {
      this.baseService.toastService.presentToast({
        message: this.baseService.translate.instant('toast_animator_change_orientation_hint')
      });
    } else {
    }
  }

}
