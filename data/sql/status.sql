-- ================================================
-- INSERTS PARA TABLA STATUS
-- Basado en los enums encontrados en apps/libs/common/enums
-- ================================================

-- Status generales (Base entity - recordStatus)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('ACTIVE', 'Record is active and operational', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('INACTIVE', 'Record is inactive but not deleted', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PAID', 'Payment has been completed', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PENDING', 'Action or process is pending', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CANCELLED', 'Action or process has been cancelled', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('COMPLETED', 'Action or process has been completed', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ERROR', 'An error occurred during processing', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DELETED', 'Record has been marked as deleted', 'GENERAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Booking Status (BookingStatus enum - booking entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('RECEIVED', 'Booking has been received and is being processed', 'BOOKING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: DELETED is already inserted above as GENERAL

-- Booking Payment Status (BookingPaymentStatus enum - booking settings)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('CONFIRMATION_PENDING', 'Payment is pending confirmation', 'BOOKING_PAYMENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DELAYED', 'Payment is overdue', 'BOOKING_PAYMENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('REFUNDED', 'Payment has been refunded', 'BOOKING_PAYMENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: COMPLETED and PENDING already inserted as GENERAL

-- Product Status (ProductStatus enum - product entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('PUBLISHED', 'Product is published and available for booking', 'PRODUCT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DRAFT', 'Product is in draft mode, not yet published', 'PRODUCT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PAUSED', 'Product is temporarily paused', 'PRODUCT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CLOSED', 'Product is closed for bookings', 'PRODUCT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: DELETED already inserted as GENERAL

-- Payment Status (PaymentStatus enum - payment entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('PAYMENT_COORDINATION_PENDING', 'Payment coordination is pending between host and customer', 'PAYMENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CONFIRMED', 'Payment has been confirmed by the host', 'PAYMENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('REJECTED', 'Payment has been rejected by the host', 'PAYMENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: PENDING and CONFIRMATION_PENDING already inserted

-- Invoice Status (InvoiceStatus enum - invoice entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('IN_PROGRESS', 'Invoice is being generated or processed', 'INVOICE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EXEMPT', 'Invoice is exempt from payment', 'INVOICE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: PENDING, PAID, CONFIRMATION_PENDING, DELAYED already inserted

-- KYC Status (KYCStatus enum - kyc_session and kyc_identity entities)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('NOT_STARTED', 'KYC process has not been started', 'KYC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('APPROVED', 'KYC verification has been approved', 'KYC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DECLINED', 'KYC verification has been declined', 'KYC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IN_REVIEW', 'KYC verification is under review', 'KYC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ABANDONED', 'KYC process was abandoned by user', 'KYC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MAX_RETRIES_REACHED', 'Maximum KYC verification attempts reached', 'KYC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Event Status (EventStatus enum - event entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('OPEN', 'Event is open for registration', 'EVENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: CLOSED already inserted as PRODUCT (can be shared)

-- Product Date Status (ProductDateStatus enum - product_date entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('DEPENDS_ON_DATE', 'Availability depends on the specific date', 'PRODUCT_DATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANUALLY_OPENED', 'Date has been manually opened for bookings', 'PRODUCT_DATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANUALLY_CLOSED', 'Date has been manually closed for bookings', 'PRODUCT_DATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Resource Processing Status (ResourceProcessingStatus enum - product_resource entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('CREATED', 'Resource has been created but not uploaded', 'RESOURCE_PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('UPLOADED', 'Resource has been uploaded successfully', 'RESOURCE_PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PROCESSING', 'Resource is being processed', 'RESOURCE_PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TRANSCODING', 'Resource is being transcoded', 'RESOURCE_PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('FINISHED', 'Resource processing has finished successfully', 'RESOURCE_PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('UPLOAD_FAILED', 'Resource upload has failed', 'RESOURCE_PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: ERROR already inserted as GENERAL

-- Confirmation Code Status (ConfirmationCodeStatus enum - confirmation_code entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('USED', 'Confirmation code has been used', 'CONFIRMATION_CODE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: ACTIVE already inserted as GENERAL

-- Discount Status (DiscountStatus enum - discount entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('EXPIRED', 'Discount has expired', 'DISCOUNT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: ACTIVE and INACTIVE already inserted as GENERAL

-- Dispersion Status (DispersionStatus enum - payment_dispersion entity)
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('DISPERSED', 'Payment has been successfully dispersed', 'DISPERSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('FAILED', 'Payment dispersion has failed', 'DISPERSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: PENDING already inserted as GENERAL

-- Product Progress Status (ProductProgressStatus enum - product progress tracking)
-- Note: NOT_STARTED ya existe para KYC, así que usamos nombres específicos
INSERT INTO status (name, description, entity_type, created_at, updated_at) VALUES
('PROGRESS_NOT_STARTED', 'Progress tracking has not started', 'PRODUCT_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PROGRESS_IN_PROGRESS', 'Progress is in progress', 'PRODUCT_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Note: COMPLETED already inserted as GENERAL

-- Summary of unique status values found:
-- GENERAL: ACTIVE, INACTIVE, PAID, PENDING, CANCELLED, COMPLETED, ERROR, DELETED, IN_PROGRESS
-- BOOKING: RECEIVED
-- BOOKING_PAYMENT: CONFIRMATION_PENDING, DELAYED, REFUNDED
-- PRODUCT: PUBLISHED, DRAFT, PAUSED, CLOSED
-- PAYMENT: PAYMENT_COORDINATION_PENDING, CONFIRMED, REJECTED
-- INVOICE: IN_PROGRESS, EXEMPT
-- KYC: NOT_STARTED, APPROVED, DECLINED, IN_REVIEW, ABANDONED, MAX_RETRIES_REACHED
-- EVENT: OPEN
-- PRODUCT_DATE: DEPENDS_ON_DATE, MANUALLY_OPENED, MANUALLY_CLOSED
-- RESOURCE_PROCESSING: CREATED, UPLOADED, PROCESSING, TRANSCODING, FINISHED, UPLOAD_FAILED
-- CONFIRMATION_CODE: USED
-- DISCOUNT: EXPIRED
-- DISPERSION: DISPERSED, FAILED
-- PRODUCT_PROGRESS: PROGRESS_NOT_STARTED, PROGRESS_IN_PROGRESS