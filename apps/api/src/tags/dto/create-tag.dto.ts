import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a hex color, e.g. #A1B2C3',
  })
  color!: string;
}
