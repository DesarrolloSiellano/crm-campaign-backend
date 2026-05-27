import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import axios from 'axios';

@Controller('proxy')
export class ProxyController {
  @Get('image')
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      return res.status(HttpStatus.BAD_REQUEST).send('URL is required');
    }

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'];

      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(response.data);
    } catch (error) {
      console.error('Error proxying image:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error fetching image');
    }
  }
}
