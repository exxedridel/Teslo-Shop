import { Controller, Get, Post, Body, Patch, Param, Delete, ParseFilePipe, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  // servicio carga archivo con Express y agregando @types/multer
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    // `fileInController` viene vacio si no se validó en true por alguna de las condiciones del archivo fileFilter.helper
    // console.log({ fileInController: file })

    if (!file) {
      throw new BadRequestException('File must be a supported image format')
    }

    return {
      fileName: file?.originalname
    };
  }

  // servicio carga archivo con Pipe del nestjs/common
}
