import { Directive, HostListener, Input } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BaseService } from '@services/base/base.service';

@Directive({
  selector: '[appOpenUrl]'
})
export class OpenUrlDirective {

  @Input() url: string;

  constructor(
    private baseService: BaseService,
    private platform: Platform
  ) { }

  @HostListener('click') async onClick() {
    const loader = await this.baseService.loadingController.create({
      message: this.baseService.translate.instant('labels_loading')
    });
    await loader.present();
    if (this.platform.is('ios')) {
      window.location.href = this.url;
    } else {
      window.open(this.url, '_blank');
    }
    await loader.dismiss();
  }

}
