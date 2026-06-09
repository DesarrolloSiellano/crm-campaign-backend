import { IsString, IsOptional, IsHexColor, IsUrl } from 'class-validator';

export class CreateDigitalCardDto {
  @IsString()
  company: string;

  @IsOptional()
  @IsHexColor()
  headerBackground?: string;

  @IsOptional()
  @IsHexColor()
  headerTextColor?: string;

  @IsOptional()
  @IsHexColor()
  footerBackground?: string;

  @IsOptional()
  @IsHexColor()
  footerTextColor?: string;

  @IsOptional()
  @IsHexColor()
  borderColor?: string;

  @IsOptional()
  @IsString() // Allowing generic string or URL
  logoUrl?: string;

  @IsOptional()
  borderRadius?: number;

  @IsOptional()
  @IsString()
  borderType?: string;

  @IsOptional()
  showHologram?: boolean;
}
