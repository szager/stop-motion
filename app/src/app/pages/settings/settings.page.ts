import { Component, OnInit } from '@angular/core';
import { BasePage } from '@pages/base/base.page';
import { BaseService } from '@services/base/base.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage extends BasePage implements OnInit {

  constructor(
    public baseService: BaseService
  ) {
    super(baseService);
    this.options.title = 'pages_title_info';
    this.options.rightButton = false;
    this.options.backButton = true;
  }

  ngOnInit() { }

}
