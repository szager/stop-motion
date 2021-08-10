import { Directive, HostListener, Input } from '@angular/core';
import { BaseService } from '@services/base/base.service';

@Directive({
  selector: '[appOpenUrl]'
})
export class OpenUrlDirective {

  @Input() url: string;

  constructor(
    private baseService: BaseService
  ) { }

  @HostListener('click') async onClick() {
    const loader = await this.baseService.loadingController.create({
      message: this.baseService.translate.instant('labels_loading')
    });
    await loader.present();
    window.open(this.url, '_blank');
    await loader.dismiss();
  }

}
