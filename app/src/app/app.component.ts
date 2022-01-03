import { Component, OnInit } from '@angular/core';
import { BaseService } from '@services/base/base.service';
import { ServiceWorkerService } from '@services/service-worker/service-worker.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private baseService: BaseService,
    private serviceWorkerService: ServiceWorkerService
  ) {
    this.baseService.translate.setDefaultLang('de');
  }

  async ngOnInit() {
    // init service worker service
    await this.serviceWorkerService.initListener();
  }
}
