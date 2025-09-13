import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    answerOption,
    coProducer,
    faq,
    product,
    productBookingSettings,
    productCurrency,
    productDate,
    productDiscount,
    productInstallmentProgram,
    productMultimedia,
    productPlan,
    productPostBookingStep,
    productPrice,
    productResource,
    productWeeklyAvailability,
    question,
    testimonial,
    testimonialMultimedia,
    status,
    multimedia,
} from '../schemas';
import { Status } from './common.type';

export type Product = InferSelectModel<typeof product>;
export type NewProduct = InferInsertModel<typeof product>;

export type ProductDate = InferSelectModel<typeof productDate>;
export type NewProductDate = InferInsertModel<typeof productDate>;

export type ProductPlan = InferSelectModel<typeof productPlan>;
export type NewProductPlan = InferInsertModel<typeof productPlan>;

export type ProductPrice = InferSelectModel<typeof productPrice>;
export type NewProductPrice = InferInsertModel<typeof productPrice>;

export type ProductDiscount = InferSelectModel<typeof productDiscount>;
export type NewProductDiscount = InferInsertModel<typeof productDiscount>;

export type Faq = InferSelectModel<typeof faq>;
export type NewFaq = InferInsertModel<typeof faq>;

export type Testimonial = InferSelectModel<typeof testimonial>;
export type NewTestimonial = InferInsertModel<typeof testimonial>;

export type TestimonialMultimedia = InferSelectModel<typeof testimonialMultimedia>;
export type NewTestimonialMultimedia = InferInsertModel<typeof testimonialMultimedia>;

export type ProductMultimedia = InferSelectModel<typeof productMultimedia>;
export type NewProductMultimedia = InferInsertModel<typeof productMultimedia>;

export type ProductBookingSettings = InferSelectModel<typeof productBookingSettings>;
export type NewProductBookingSettings = InferInsertModel<typeof productBookingSettings>;

export type ProductCurrency = InferSelectModel<typeof productCurrency>;
export type NewProductCurrency = InferInsertModel<typeof productCurrency>;

export type ProductPostBookingStep = InferSelectModel<typeof productPostBookingStep>;
export type NewProductPostBookingStep = InferInsertModel<typeof productPostBookingStep>;

export type ProductInstallmentProgram = InferSelectModel<typeof productInstallmentProgram>;
export type NewProductInstallmentProgram = InferInsertModel<typeof productInstallmentProgram>;

export type CoProducer = InferSelectModel<typeof coProducer>;
export type NewCoProducer = InferInsertModel<typeof coProducer>;

export type ProductWeeklyAvailability = InferSelectModel<typeof productWeeklyAvailability>;
export type NewProductWeeklyAvailability = InferInsertModel<typeof productWeeklyAvailability>;

export type ProductResource = InferSelectModel<typeof productResource>;
export type NewProductResource = InferInsertModel<typeof productResource>;

export type Question = InferSelectModel<typeof question>;
export type NewQuestion = InferInsertModel<typeof question>;

export type AnswerOption = InferSelectModel<typeof answerOption>;
export type NewAnswerOption = InferInsertModel<typeof answerOption>;

export type ProductWithTotalBookings = typeof product.$inferSelect & { totalBookings: number };

export type ProductResourceWithRelations = ProductResource & {
    status?: InferSelectModel<typeof status>;
    processingStatus?: InferSelectModel<typeof status>;
    multimedia?: InferSelectModel<typeof multimedia>;
    thumbnail?: InferSelectModel<typeof multimedia>;
};
