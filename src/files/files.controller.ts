import { Controller, Get, Post, Body, Patch, Param, Delete, ParseFilePipe, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  // Idealmente guardar archivos en un bucket independiente al proyecto
  // Aqui se muestra como guardarlos en este repo (archivos sin relevancia o proyectos muy pequeños)
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    if (!file) {
      throw new BadRequestException('File must be a supported image format')
    }

    // importar ConfigService de nest/common en files.module
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return { secureUrl };
  }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // esto indica tomaremos contros de la respuesta a regresar, usando res. de Express (ej, res.status()) pero se salta ciertas validaciones o pasos del ciclo de vida de nest
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }
}
