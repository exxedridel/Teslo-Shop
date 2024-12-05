import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    // se puede trasformar con validationPipe en app file como en Pokedex API
    @Type(()=> Number) // aqui emulamos enableImplicitConversions: true
    limit?: number;


    @IsOptional()
    @IsPositive()
    @Min(0)
    // se puede trasformar con validationPipe en app file como en Pokedex API
    @Type(()=> Number) // aqui emulamos enableImplicitConversions: true
    offset?: number;

}