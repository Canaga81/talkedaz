import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";

export class ForgetPasswordDto {

    @Type()
    @IsString()
    @ApiProperty( { default: 'john.doe@example.com' } )
    email: string;

}