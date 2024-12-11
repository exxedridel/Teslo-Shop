import { Controller, Get, Post, Body, Patch, Param, Delete, ParseFilePipe, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  // Idealmente guardar archivos en un bucket independiente al proyecto
  // Aqui se muestra como guardarlos en este repo (archivos sin relevancia o proyectos muy pequeños)
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000}
    storage: diskStorage({
      destination: './static/uploads'
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    if (!file) {
      throw new BadRequestException('File must be a supported image format')
    }

    return {
      fileName: file?.originalname
    };
  }

}
