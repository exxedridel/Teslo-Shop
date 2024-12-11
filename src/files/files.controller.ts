import { Controller, Get, Post, Body, Patch, Param, Delete, ParseFilePipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  // servicio carga archivo con Express y agregando @types/multer
  @Post('product')
  @UseInterceptors(FileInterceptor('file')) // p/ interceptar la coleccion de bytes que construyen la imagen (se guarda en un buffer)
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {
    return file; // por defecto se guardda en una carpeta temporal
  }

  // servicio carga archivo con nestjs/common
}
