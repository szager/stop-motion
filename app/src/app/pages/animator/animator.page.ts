import { Component } from '@angular/core';
import { BasePage } from '@pages/base/base.page';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-animator',
  templateUrl: 'animator.page.html',
  styleUrls: ['animator.page.scss'],
})
export class AnimatorPage extends BasePage {

  constructor(
    public baseService: BaseService
  ) {
    super(baseService);
  }

}
