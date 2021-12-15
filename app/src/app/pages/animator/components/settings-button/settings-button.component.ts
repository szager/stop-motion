import { Component } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';

@Component({
  selector: 'app-settings-button',
  templateUrl: './settings-button.component.html',
  styleUrls: ['./settings-button.component.scss'],
})
export class SettingsButtonComponent extends BaseComponent {

  public async onClick() {
    this.baseService.router.navigateByUrl('/settings');
  }

}
