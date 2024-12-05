import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    // se puede trasformar el string recibido por el param a number con validationPipe en app file como en Pokedex API
    @Type(()=> Number) // pero aqui emulamos enableImplicitConversions: true
    limit?: number;


    @IsOptional()
    @Min(0)
    @Type(()=> Number) // pero aqui emulamos enableImplicitConversions: true
    offset?: number;

}