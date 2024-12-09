import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(

    // fue necesario importar ProductsModule en seed.Module y exportar ProductsService en products.module
    private readonly productsService: ProductsService

  ) { }

  async runSeed() {
    await this.insertNewProducts()

    return 'Seed executed successfully';
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts()

    const products = initialData.products;

    const insertPromises = []

    products.forEach(product => {
      insertPromises.push ( this.productsService.create(product) )
    })

    // esperar a resolver todas las promesas y guardarlas sus resultados en el array 'insertPromises' sincronicamente
    await Promise.all( insertPromises) 

    return true
  }

}
