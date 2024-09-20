import { Controller, Get, Header, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("upload-audio")
  @UseInterceptors(FileInterceptor('myfile'))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<string> {
    await this.appService.uploadAudio(file);
    return 'uploaded'
  }

  @Get("read-image")
  @Header("Content-Type", "audio/mp3")
  async read(@Res() res, @Query('name') name) {
    const data = await this.appService.readStream(name)
    return data.pipe(res);
  }

  @Get("get-audio-url")
  async getAudioUrl(@Query('name') name: string): Promise<{ url: string }> {
    const url = await this.appService.getAudioUrl(name);
    return { url };
  }

  @Get("get-audio-sas-url")
  async getAudioSasUrl(@Query('name') name: string): Promise<{ url: string }> {
    const sasUrl = await this.appService.generateSasUrl(name);
    return { url: sasUrl };
  }
}
