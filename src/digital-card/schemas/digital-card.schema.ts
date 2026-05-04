import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DigitalCardDocument = DigitalCard & Document;

@Schema({ timestamps: true })
export class DigitalCard {
  @Prop({ required: true, unique: true })
  company: string;

  @Prop({ default: '#33528b' })
  headerBackground: string;

  @Prop({ default: '#dde6f4' })
  headerTextColor: string;

  @Prop({ default: '#33528b' })
  footerBackground: string;

  @Prop({ default: '#ffffff' })
  footerTextColor: string;

  @Prop({ default: '#33528b' })
  borderColor: string;

  @Prop()
  logoUrl?: string;

  @Prop({ default: 16 })
  borderRadius: number;

  @Prop({ default: 'rounded' })
  borderType: string;

  @Prop({ default: false })
  showHologram: boolean;
}

export const DigitalCardSchema = SchemaFactory.createForClass(DigitalCard);
