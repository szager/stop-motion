import { Component } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
})
export class ToggleButtonComponent extends BaseComponent {

  constructor(
    public baseService: BaseService,
    private animatorService: AnimatorService
  ) {
    super(baseService);
  }

  async onClick() {
    const layoutOptions =await this.baseService.layoutService.getLayoutOptions().pipe(take(1)).toPromise();
    await this.animatorService.toggleCamera(layoutOptions);
  }

}
