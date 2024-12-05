import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./";


@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;
    
    // referencia al product
    @ManyToOne(
        ()=> Product,
        product => product.images,
    )
    product: Product

}