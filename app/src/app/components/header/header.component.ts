import { BaseService } from '@services/base/base.service';
import { Component, OnInit, Input } from '@angular/core';
import { HeaderOptions } from '@interfaces/header-options.interface';
import { Location } from '@angular/common';
import { BaseComponent } from '@components/base/base.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseComponent implements OnInit {

    @Input() options: HeaderOptions;

    constructor(
        public baseService: BaseService,
        public location: Location
    ) {
        super(baseService);
    }

    ngOnInit() {}

    onNavigate(url: string) {
        this.baseService.router.navigateByUrl(url);
    }

    onNavigateLastRoute() {
        this.location.back();
    }

}
