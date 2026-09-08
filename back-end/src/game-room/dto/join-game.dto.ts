import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  invit?: string;
}
