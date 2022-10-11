import { BaseService } from '@services/base/base.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

/*
 * Base class for all other services. Sets some default values for all child services.
 * Also holds base configuration, depending on environment.
 */
export class HttpService {

    constructor(
        private baseService: BaseService,
        private http: HttpClient
    ) { }
    /*
     * Base get method to send a GET request.
     */
    public get(path: string, responseType?: string) {
        return this.http.get(this.baseService.getEnv('apiUrl') + path);
    }

    /*
     * Base post method to send a POST request.
     */
    public post(path: string, body: any, responseType?: any) {
        return this.http.post(this.baseService.getEnv('apiUrl') + path, body, { responseType: 'arraybuffer' });
    }

    /*
     * Base put method to send a PUT request.
     */
    public put(path: string, body: any, responseType?: string) {
        return this.http.put(this.baseService.getEnv('apiUrl') + path, body);
    }

    /*
     * Base patch method to send a PATCH request.
     */
    public patch(path: string, body: any, responseType?: string) {
        return this.http.patch(this.baseService.getEnv('apiUrl') + path, body);
    }

    /*
     * Base delete method to send a PUT request.
     */
    public delete(path: string) {
        return this.http.delete(this.baseService.getEnv('apiUrl') + path);
    }

    // get response type
    /*
     * Retrieve current request settings. Consists of headers, request method.
     */
    public setRequestHeaders(type: string, value: string): any {
        if (type) {
            const headers = new HttpHeaders().set(type, value);
            return {
                headers,
            };
        } else {
            return {
                headers: new HttpHeaders()
            };
        }
    }
}
