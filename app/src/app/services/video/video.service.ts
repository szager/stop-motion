import { Injectable } from '@angular/core';
import { HttpService } from '@services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(public httpService: HttpService) { }

  public async createVideo(images: Blob[], frameRate: number, audio?: Blob) {
    console.log('🚀 ~ file: video.service.ts ~ line 12 ~ VideoService ~ createVideo ~ images', images);
    const data = new FormData();
    images.forEach((image, index) => {
      data.append('images', image, `${index}.${image.type}`);
    });

    data.append('frameRate', frameRate.toString());

    if (audio) {
      data.append('audio', audio, `${audio.type}`);
    }

    return await this.httpService.post('/videoCreator', data, { responseType: 'arraybuffer' }).toPromise();
  }
}
