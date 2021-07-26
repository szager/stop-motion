import { BaseService } from '@services/base/base.service';
import { Component, OnInit, Input } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';

@Component({
    selector: 'app-tabbar',
    templateUrl: './tabbar.component.html',
    styleUrls: ['./tabbar.component.scss']
})
export class TabbarComponent extends BaseComponent implements OnInit {
    constructor(
        public baseService: BaseService
    ) {
        super(baseService);
    }

    ngOnInit() {}

    onNavigate(url: string) {
        this.baseService.router.navigateByUrl(url);
    }

}
