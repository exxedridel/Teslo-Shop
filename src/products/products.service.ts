import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private readonly productImageRepository: Repository<ProductImage>
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
  async findOnePlain( term: string) {
    const { images = [], ...rest} = await this.findOne( term);
    return {
      ...rest,
      imgaes: images.map( image=> image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: [],
    })

    if (!product) throw new NotFoundException(`Product with id: ${id} is not found`)

    try {

      await this.productRepository.save(product)
      return product;

    } catch (error) {
      this.handleDBExceptions(error)
    }

  }

  async remove(id: string) {

    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    return `Product with id: ${id} was successfully deleted`;
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
