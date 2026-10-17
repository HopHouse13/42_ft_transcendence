import { IsString, IsOptional, MaxLength } from "class-validator";

export class SearchDto
{
	@IsOptional()
	@IsString()
	@MaxLength( 50 )
	query?: string;
};