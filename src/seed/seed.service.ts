import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SeedService {

  constructor(

    // fue necesario importar ProductsModule en seed.Module y exportar ProductsService en products.module
    private readonly productsService: ProductsService 

  ) { }

  async runSeed() {
    await this.insertNewProducts()
    return 'This action executes seed';
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts()

    return true
  }

}
