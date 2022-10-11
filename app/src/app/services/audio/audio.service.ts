import { Injectable } from '@angular/core';
import { HttpService } from '@services/http/http.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(public httpService: HttpService) { }

  public async convertAudio(blob: Blob) {
    const data = new FormData();
    data.append('audio', blob, 'audio.mp3');
    return await this.httpService.post('/audioConverter', data, { responseType: 'arraybuffer' }).toPromise();
  }
}
