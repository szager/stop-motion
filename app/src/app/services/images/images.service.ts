import { Injectable } from '@angular/core';
import { HttpService } from '@services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(public httpService: HttpService) { }
  public async convertImages(image: Blob): Promise<ArrayBuffer> {
    console.log('🚀 ~ file: images.service.ts ~ line 11 ~ ImagesService ~ convertImages ~ image', image);
    const data = new FormData();
    data.append('image', image, `image.png`);
    return await this.httpService.post('/imageConverter', data, { responseType: 'arraybuffer' }).toPromise();
  }
}
