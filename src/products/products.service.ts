import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) { }

  async create(createProductDto: CreateProductDto) {

    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      await this.productRepository.save(product);

      return { ...product, images };

    } catch (error) {
      this.handleDBExceptions(error)
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    console.log(paginationDto)

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // relaciones
      relations: {
        images: true,
      }
    });

    // return products.map(product => ({
    //   ...product,
    //   images: product.images.map(img => img.url)
    // }))  
    // o bien des-estructurando

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {

      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) = :title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term,
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()

    }

    if (!product) throw new NotFoundException(`Product with: ${term} is not found`)

    return product;
  }

  // funcion intermedia para regresar objeto exactamente como se desea, de esta manera, no afectar la funcionalidad de la funcion remove
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      imgaes: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate, })

    if (!product) throw new NotFoundException(`Product with id: ${id} is not found`)

    // transaction: serie de queries que pueden impactar la base de datos, actualizar, eliminar, insertar
    // pero que se ejecuta hasta que se hace un commit a la base de datos, si no se llama al commit o se quita la conexión no impacta la base
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        )
      } else {
        // ??? tambien se pudiera hacer aqui
        // product.images ???
      }

      await queryRunner.manager.save(product);
      // await this.productRepository.save(product)

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error)
    }

  }

  async remove(id: string) {

    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    return `Product with id: ${id} was successfully deleted`;
  }

  // Función que puede ayudar para usarse solo en QA, aqui unicamente la ejecutamos desde seed.service (imports y exports respectivos) y borra todos los productos con sus imágenes 
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
        // esto no es una transaction, borrará todos los productos y sus relaciones

    } catch (error) {
      this.handleDBExceptions(error)
    }
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
