/*
* CustomHttpInterceptor is used to intercept http calls.
*/

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '@services/base/base.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { ErrorCodes } from '../enums/error-codes.enum';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

    constructor(
        private baseService: BaseService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): any {

        return next.handle(request).pipe(catchError((response: any) => {
            if (response instanceof HttpErrorResponse) {
                this.showToast(response.error);
                return throwError(response);
            } else {
                this.showToast('error_message_unknown');
                return throwError(response);
            }
        }));
    }

    private async showToast(message: string) {
        this.baseService.toastService.presentToast({ message: this.baseService.translate.instant(message), color: 'danger' });
        this.baseService.loadingController.getTop().then((loader: any) => { if (loader) { loader.dismiss(); } });
    }
}
