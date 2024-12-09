import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage])
  ],
  exports: [ ProductsService, TypeOrmModule ] // asi, cualquiera que importe ProductsModule tendrá acceso a este
  // tambien se usa de una vez exportar el TypeOrmModule por cualquier operacion que se ocupe realizarle
})
export class ProductsModule { }
