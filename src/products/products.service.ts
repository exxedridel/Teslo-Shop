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

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      // product = await this.productRepository.findOneBy({ slug: term })

      // *Contra inyección de consultas (SQL Injection) ya que se usa parametrización y los valores que se asignen se escapan automáticamente
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(`LOWER(title) = :title or slug =:slug`, { // ej. de como convertir a Upper en el query de postgres
          title: term.toUpperCase(),  // aca hacerlo coincidir. O se puede así, sin tener que modificar el term `.where(`LOWER(title) = LOWER(:title) or slug =:slug`, {`
          slug: term,
        }).getOne()

      // `select * from Products where slug='xxxx' or title='xxxx'`  // es como hacer esto pero de manera segura 
    }

    // NotFound
    if (!product) throw new NotFoundException(`Product with: ${term} is not found`)

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
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
    // aqui se reutiliza la consulta de findOne, si no encuentra un UUID mandará su NotFoundException
    const product = await this.findOne( id );
    // pero esto resultará en ejecutar esta segunda consulta
    await this.productRepository.remove( product) ;

    return `Product with id: ${id} was successfully deleted`;
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
