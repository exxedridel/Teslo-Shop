import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {

      // ver manera mas sencilla con @BeforeInsert de typrorm en product.entity
      // if (!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.title
      //     .toLowerCase()
      //     .replaceAll(' ', '_')
      //     .replaceAll("'", '')
      // } else {
      //   createProductDto.slug = createProductDto.slug
      //     .toLowerCase()
      //     .replaceAll(' ', '_')
      //     .replaceAll("'", '')
      // }

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;

    } catch (error) {
      this.handleDBExceptions(error)
    }

  }

  findAll(paginationDto: PaginationDto) {

    // si no vienen los valores en los params, estos se pondrán por defecto
    const { limit = 10, offset = 0 } = paginationDto;

    console.log(paginationDto)
    // los valores predeterminados que se definen en la desestructuración no alteran el objeto original (paginationDto). 
    // Los valores predeterminados solo afectan las variables se obtienen durante la desestructuración, no añaden 
    // propiedades al objeto.

    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
    });
  }

  async findOne(term: string) {

    let product: Product;

    if ( isUUID(term )) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      product = await this.productRepository.findOneBy({ slug: term })
    }

    // NotFound
    if (!product) throw new NotFoundException(`Product with: ${term} is not found`)

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete({ id })
    // this.productRepository.remove({ id }) // se usa este cuando se procederá a borrar por registro (buscándolo previamente findAlgo())

    if (affected === 0) throw new BadRequestException(`Product with id: ${id} is not found`)
    return `Product with id: ${id} successfully deleted`;
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
