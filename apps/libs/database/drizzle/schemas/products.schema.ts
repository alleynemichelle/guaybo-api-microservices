import {
    bigint,
    boolean,
    decimal,
    integer,
    jsonb,
    pgTable,
    serial,
    smallint,
    text,
    time,
    timestamp,
    unique,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { discount } from './billing.schema';
import { availabilityType, currency, meetingPlatform, productType, role, status } from './common.schema';
import { appUser } from './users.schema';
import { host } from './hosts.schema';
import { multimedia } from './common.schema';

export const product = pgTable('product', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    hostId: bigint('host_id', { mode: 'number' })
        .notNull()
        .references(() => host.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 500 }).notNull(),
    alias: varchar('alias', { length: 500 }).notNull(),
    description: varchar('description', { length: 300 }),
    descriptionSection: jsonb('description_section'),
    productTypeId: bigint('product_type_id', { mode: 'number' })
        .notNull()
        .references(() => productType.id, { onDelete: 'restrict' }),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    recordStatusId: bigint('record_status_id', { mode: 'number' }).references(() => status.id),
    isFree: boolean('is_free').default(false),
    timezone: varchar('timezone', { length: 100 }),
    mainDate: timestamp('main_date', { withTimezone: true }),
    minCapacity: integer('min_capacity').default(0),
    maxCapacity: integer('max_capacity').default(0),
    totalBookings: integer('total_bookings').default(0),
    totalResources: integer('total_resources').default(0),
    totalDuration: integer('total_duration').default(0),
    totalSize: bigint('total_size', { mode: 'number' }).default(0),
    totalSections: integer('total_sections').default(0),
    availabilityTypeId: bigint('availability_type', { mode: 'number' }).references(() => availabilityType.id, {
        onDelete: 'set null',
    }),
    meetingPlatformId: bigint('meeting_platform', { mode: 'number' }).references(() => meetingPlatform.id, {
        onDelete: 'set null',
    }),
    meetingUrl: varchar('meeting_url', { length: 1000 }),
    meetingInstructions: text('meeting_instructions'),
    termsAndConditions: jsonb('terms_and_conditions'),
    duration: jsonb('duration'),
    template: jsonb('template'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productRelations = relations(product, ({ one, many }) => ({
    host: one(host, {
        fields: [product.hostId],
        references: [host.id],
    }),
    productType: one(productType, {
        fields: [product.productTypeId],
        references: [productType.id],
    }),
    status: one(status, {
        fields: [product.statusId],
        references: [status.id],
    }),
    availabilityType: one(availabilityType, {
        fields: [product.availabilityTypeId],
        references: [availabilityType.id],
    }),
    meetingPlatform: one(meetingPlatform, {
        fields: [product.meetingPlatformId],
        references: [meetingPlatform.id],
    }),
    productDates: many(productDate),
    productPlans: many(productPlan),
    productDiscounts: many(productDiscount),
    faqs: many(faq),
    testimonials: many(testimonial),
    productMultimedia: many(productMultimedia),
    productBookingSettings: one(productBookingSettings),
    productCurrencies: many(productCurrency),
    productPostBookingSteps: many(productPostBookingStep),
    productInstallmentPrograms: many(productInstallmentProgram),
    coProducers: many(coProducer),
    productWeeklyAvailabilities: many(productWeeklyAvailability),
    productResources: many(productResource),
}));

export const productDate = pgTable('product_date', {
    id: serial('id').primaryKey(),
    recordId: varchar('record_id').notNull().unique(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    initialDate: timestamp('initial_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    timezone: varchar('timezone', { length: 100 }),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    totalBookings: integer('total_bookings').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productDateRelations = relations(productDate, ({ one }) => ({
    product: one(product, {
        fields: [productDate.productId],
        references: [product.id],
    }),
    status: one(status, {
        fields: [productDate.statusId],
        references: [status.id],
    }),
}));

export const productPlan = pgTable('product_plan', {
    id: serial('id').primaryKey(),
    recordId: bigint('record_id', { mode: 'number' }).notNull().unique(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    orderIndex: integer('order_index'),
    totalBookings: integer('total_bookings').default(0),
    minCapacity: integer('min_capacity').default(0),
    maxCapacity: integer('max_capacity').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productPlanRelations = relations(productPlan, ({ one, many }) => ({
    product: one(product, {
        fields: [productPlan.productId],
        references: [product.id],
    }),
    productPrices: many(productPrice),
}));

export const productPrice = pgTable('product_price', {
    id: serial('id').primaryKey(),
    productPlanId: bigint('product_plan_id', { mode: 'number' })
        .notNull()
        .references(() => productPlan.id, { onDelete: 'cascade' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    currencyId: bigint('currency_id', { mode: 'number' })
        .notNull()
        .references(() => currency.id, { onDelete: 'restrict' }),
    fareType: varchar('fare_type', { length: 50 }),
    pricingModel: varchar('pricing_model', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productPriceRelations = relations(productPrice, ({ one }) => ({
    productPlan: one(productPlan, {
        fields: [productPrice.productPlanId],
        references: [productPlan.id],
    }),
    currency: one(currency, {
        fields: [productPrice.currencyId],
        references: [currency.id],
    }),
}));

export const productDiscount = pgTable(
    'product_discount',
    {
        id: serial('id').primaryKey(),
        productId: bigint('product_id', { mode: 'number' })
            .notNull()
            .references(() => product.id, { onDelete: 'cascade' }),
        discountId: bigint('discount_id', { mode: 'number' })
            .notNull()
            .references(() => discount.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        type: varchar('type', { length: 50 }).notNull(),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    },
    (table) => {
        return {
            productDiscountUnique: unique('product_discount_product_id_discount_id_unique').on(
                table.productId,
                table.discountId,
            ),
        };
    },
);

export const productDiscountRelations = relations(productDiscount, ({ one }) => ({
    product: one(product, {
        fields: [productDiscount.productId],
        references: [product.id],
    }),
    discount: one(discount, {
        fields: [productDiscount.discountId],
        references: [discount.id],
    }),
    status: one(status, {
        fields: [productDiscount.statusId],
        references: [status.id],
    }),
}));

export const faq = pgTable('faq', {
    id: serial('id').primaryKey(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    orderIndex: integer('order_index'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const faqRelations = relations(faq, ({ one }) => ({
    product: one(product, {
        fields: [faq.productId],
        references: [product.id],
    }),
}));

export const testimonial = pgTable('testimonial', {
    id: serial('id').primaryKey(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    comment: text('comment').notNull(),
    userName: varchar('user_name', { length: 255 }),
    orderIndex: integer('order_index'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const testimonialRelations = relations(testimonial, ({ one, many }) => ({
    product: one(product, {
        fields: [testimonial.productId],
        references: [product.id],
    }),
    testimonialMultimedia: many(testimonialMultimedia),
}));

export const testimonialMultimedia = pgTable('testimonial_multimedia', {
    id: serial('id').primaryKey(),
    testimonialId: bigint('testimonial_id', { mode: 'number' })
        .notNull()
        .references(() => testimonial.id, { onDelete: 'cascade' }),
    multimediaId: bigint('multimedia_id', { mode: 'number' })
        .notNull()
        .references(() => multimedia.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const testimonialMultimediaRelations = relations(testimonialMultimedia, ({ one }) => ({
    testimonial: one(testimonial, {
        fields: [testimonialMultimedia.testimonialId],
        references: [testimonial.id],
    }),
    multimedia: one(multimedia, {
        fields: [testimonialMultimedia.multimediaId],
        references: [multimedia.id],
    }),
}));

export const productMultimedia = pgTable('product_multimedia', {
    id: serial('id').primaryKey(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    multimediaId: bigint('multimedia_id', { mode: 'number' })
        .notNull()
        .references(() => multimedia.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index'),
    usageType: varchar('usage_type', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productMultimediaRelations = relations(productMultimedia, ({ one }) => ({
    product: one(product, {
        fields: [productMultimedia.productId],
        references: [product.id],
    }),
    multimedia: one(multimedia, {
        fields: [productMultimedia.multimediaId],
        references: [multimedia.id],
    }),
}));

export const productBookingSettings = pgTable('product_booking_settings', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    bookingFlow: varchar('booking_flow', { length: 50 }).notNull(),
    defaultPaymentStatusId: bigint('default_payment_status_id', {
        mode: 'number',
    }).references(() => status.id),
    requiredData: text('required_data').array().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productBookingSettingsRelations = relations(productBookingSettings, ({ one }) => ({
    product: one(product, {
        fields: [productBookingSettings.productId],
        references: [product.id],
    }),
    defaultPaymentStatus: one(status, {
        fields: [productBookingSettings.defaultPaymentStatusId],
        references: [status.id],
    }),
}));

export const productCurrency = pgTable(
    'product_currency',
    {
        id: serial('id').primaryKey(),
        productId: bigint('product_id', { mode: 'number' })
            .notNull()
            .references(() => product.id, { onDelete: 'cascade' }),
        currencyId: bigint('currency_id', { mode: 'number' })
            .notNull()
            .references(() => currency.id, { onDelete: 'restrict' }),
        isDefault: boolean('is_default').default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    },
    (table) => {
        return {
            productCurrencyUnique: unique('product_currency_product_id_currency_id_unique').on(
                table.productId,
                table.currencyId,
            ),
        };
    },
);

export const productCurrencyRelations = relations(productCurrency, ({ one }) => ({
    product: one(product, {
        fields: [productCurrency.productId],
        references: [product.id],
    }),
    currency: one(currency, {
        fields: [productCurrency.currencyId],
        references: [currency.id],
    }),
    status: one(status, {
        fields: [productCurrency.statusId],
        references: [status.id],
    }),
}));

export const productPostBookingStep = pgTable('product_post_booking_step', {
    id: serial('id').primaryKey(),
    recordId: varchar('record_id').notNull().unique(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    conditions: jsonb('conditions'),
    isMandatory: boolean('is_mandatory').default(false),
    isMeetingInvitation: boolean('is_meeting_invitation').default(false),
    customAttributes: jsonb('custom_attributes'),
    orderIndex: integer('order_index'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productPostBookingStepRelations = relations(productPostBookingStep, ({ one }) => ({
    product: one(product, {
        fields: [productPostBookingStep.productId],
        references: [product.id],
    }),
}));

export const productInstallmentProgram = pgTable('product_installment_program', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    initialPaymentAmount: bigint('initial_payment_amount', { mode: 'number' }),
    installmentsCount: integer('installments_count').notNull(),
    paymentDeadlineDaysBeforeEvent: integer('payment_deadline_days_before_event'),
    paymentDeadlineDaysAfterEvent: integer('payment_deadline_days_after_event'),
    frequency: varchar('frequency', { length: 50 }).notNull(),
    interestFeeAmount: bigint('interest_fee_amount', { mode: 'number' }),
    interestFeeType: varchar('interest_fee_type', { length: 50 }),
    conditions: jsonb('conditions'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const productInstallmentProgramRelations = relations(productInstallmentProgram, ({ one }) => ({
    product: one(product, {
        fields: [productInstallmentProgram.productId],
        references: [product.id],
    }),
    status: one(status, {
        fields: [productInstallmentProgram.statusId],
        references: [status.id],
    }),
}));

export const coProducer = pgTable(
    'co_producer',
    {
        id: serial('id').primaryKey(),
        productId: bigint('product_id', { mode: 'number' })
            .notNull()
            .references(() => product.id, { onDelete: 'cascade' }),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        userId: bigint('user_id', { mode: 'number' })
            .notNull()
            .references(() => appUser.id, { onDelete: 'cascade' }),
        revenueShare: decimal('revenue_share', {
            precision: 5,
            scale: 2,
        }).notNull(),
        validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow(),
        validUntil: timestamp('valid_until', { withTimezone: true }),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
        roleId: bigint('role_id', { mode: 'number' })
            .notNull()
            .references(() => role.id, { onDelete: 'restrict' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return {
            productUserUnique: unique('co_producer_product_id_user_id_unique').on(table.productId, table.userId),
        };
    },
);

export const coProducerRelations = relations(coProducer, ({ one }) => ({
    product: one(product, {
        fields: [coProducer.productId],
        references: [product.id],
    }),
    host: one(host, {
        fields: [coProducer.hostId],
        references: [host.id],
    }),
    user: one(appUser, {
        fields: [coProducer.userId],
        references: [appUser.id],
    }),
    status: one(status, {
        fields: [coProducer.statusId],
        references: [status.id],
    }),
    role: one(role, {
        fields: [coProducer.roleId],
        references: [role.id],
    }),
}));

export const productWeeklyAvailability = pgTable('product_weekly_availability', {
    id: serial('id').primaryKey(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    dayOfWeek: smallint('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productWeeklyAvailabilityRelations = relations(productWeeklyAvailability, ({ one }) => ({
    product: one(product, {
        fields: [productWeeklyAvailability.productId],
        references: [product.id],
    }),
}));

export const productResource = pgTable('product_resource', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    parentId: bigint('parent_id', { mode: 'number' }).references(() => productResource.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    longDescription: text('long_description'),
    multimediaId: bigint('multimedia_id', { mode: 'number' }).references(() => multimedia.id, { onDelete: 'set null' }),
    thumbnailId: bigint('thumbnail_id', { mode: 'number' }).references(() => multimedia.id, { onDelete: 'set null' }),
    fileId: varchar('file_id', { length: 255 }),
    processingStatusId: bigint('processing_status_id', {
        mode: 'number',
    }).references(() => status.id),
    encodeProgress: integer('encode_progress'),
    size: decimal('size', { precision: 10, scale: 2 }),
    duration: decimal('duration', { precision: 10, scale: 2 }),
    preview: boolean('preview').default(false),
    downloadable: boolean('downloadable').default(false),
    orderIndex: integer('order_index').notNull(),
    totalViews: integer('total_views').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const productResourceRelations = relations(productResource, ({ one, many }) => ({
    product: one(product, {
        fields: [productResource.productId],
        references: [product.id],
    }),
    parent: one(productResource, {
        fields: [productResource.parentId],
        references: [productResource.id],
    }),
    children: many(productResource),
    multimedia: one(multimedia, {
        fields: [productResource.multimediaId],
        references: [multimedia.id],
    }),
    thumbnail: one(multimedia, {
        fields: [productResource.thumbnailId],
        references: [multimedia.id],
    }),
    processingStatus: one(status, {
        fields: [productResource.processingStatusId],
        references: [status.id],
    }),
    status: one(status, {
        fields: [productResource.statusId],
        references: [status.id],
    }),
    questions: many(question),
}));

export const question = pgTable('question', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    productResourceId: bigint('product_resource_id', { mode: 'number' })
        .notNull()
        .references(() => productResource.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    questionType: varchar('question_type', { length: 50 }).notNull(),
    orderIndex: integer('order_index').notNull(),
    explanation: text('explanation'),
    ratingScale: integer('rating_scale'),
    minRatingLabel: varchar('min_rating_label', { length: 255 }),
    maxRatingLabel: varchar('max_rating_label', { length: 255 }),
    isRequired: boolean('is_required').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const questionRelations = relations(question, ({ one, many }) => ({
    productResource: one(productResource, {
        fields: [question.productResourceId],
        references: [productResource.id],
    }),
    status: one(status, {
        fields: [question.statusId],
        references: [status.id],
    }),
    answerOptions: many(answerOption),
}));

export const answerOption = pgTable('answer_option', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    questionId: bigint('question_id', { mode: 'number' })
        .notNull()
        .references(() => question.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    orderIndex: integer('order_index'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const answerOptionRelations = relations(answerOption, ({ one }) => ({
    question: one(question, {
        fields: [answerOption.questionId],
        references: [question.id],
    }),
    status: one(status, {
        fields: [answerOption.statusId],
        references: [status.id],
    }),
}));
