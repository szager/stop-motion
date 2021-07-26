import { Component } from '@angular/core';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private baseService: BaseService
  ) {
    this.baseService.translate.setDefaultLang('de');
  }
}
