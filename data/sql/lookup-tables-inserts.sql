-- ================================================
-- INSERTS PARA TABLAS LOOKUP
-- Basado en los enums encontrados en apps/libs/common/enums
-- ================================================

-- ================================================
-- PRODUCT_TYPE
-- ================================================
INSERT INTO product_type (key, description) VALUES
('EVENT', 'Live events with specific dates and times'),
('DIGITAL_PRODUCT', 'Digital products for download or online access'),
('ONE_TO_ONE_SESSION', 'Individual consultation or coaching sessions'),
('DIGITAL_COURSE', 'Structured online courses with multiple lessons');

-- ================================================
-- AVAILABILITY_TYPE (SessionAvailabilityType)
-- ================================================
INSERT INTO availability_type (key, description) VALUES
('CLIENT_AGREEMENT', 'Availability determined by agreement with client'),
('DEFINED_RANGE', 'Fixed availability within defined date ranges'),
('INFINITE', 'Always available, no time restrictions');

-- ================================================
-- MEETING_PLATFORM
-- ================================================
INSERT INTO meeting_platform (key, description) VALUES
('ZOOM', 'Zoom video conferencing platform'),
('GOOGLE_MEETS', 'Google Meets video conferencing'),
('MICROSOFT_TEAMS', 'Microsoft Teams collaboration platform'),
('CUSTOM', 'Custom meeting platform or link'),
('NONE', 'No meeting platform required');

-- ================================================
-- TRANSACTION_TYPE
-- ================================================
-- Basado en los comentarios del DDL y lógica de negocio
INSERT INTO transaction_type (key, description) VALUES
('SALE', 'Revenue from product or service sales'),
('COMMISSION', 'Platform commission fees'),
('AFFILIATE_COMMISSION', 'Commission paid to affiliate partners'),
('WITHDRAWAL', 'Money withdrawal by hosts'),
('FEE', 'Additional fees (processing, interest, etc.)'),
('REFUND', 'Money returned to customers'),
('CHARGEBACK', 'Payment disputed and reversed'),
('ADJUSTMENT', 'Manual adjustments to accounts');

-- ================================================
-- TRANSACTION_DIRECTION
-- ================================================
INSERT INTO transaction_direction (key, description) VALUES
('IN', 'Incoming money (credit to account)'),
('OUT', 'Outgoing money (debit from account)');

-- ================================================
-- BENEFICIARY_TYPE
-- ================================================
-- Basado en los comentarios del DDL y lógica de splits
INSERT INTO beneficiary_type (key, description) VALUES
('HOST', 'Host or service provider receiving revenue'),
('CO_PRODUCER', 'Co-producer sharing revenue from product'),
('AFFILIATE', 'Affiliate partner receiving commission'),
('GUAYBO', 'Platform (Guaybo) receiving fees or commission'),
('BANK', 'Banking fees or charges'),
('REFERRER', 'User who referred new customers');

-- ================================================
-- PRODUCT_RESOURCE_TYPE
-- ================================================
-- Basado en ProductResourceType enum
INSERT INTO product_resource_type (key, description) VALUES
('SECTION', 'Organizational section containing multiple resources'),
('RESOURCE', 'Individual resource (video, document, audio, etc.)'),
('QUIZ', 'Interactive quiz with graded questions'),
('SURVEY', 'Survey for collecting user feedback or data');

-- ================================================
-- QUESTION_TYPE
-- ================================================
-- Basado en QuestionType enum de question.entity.ts
INSERT INTO question_type (key, description) VALUES
('MULTIPLE_CHOICE_SINGLE', 'Multiple choice question with single correct answer'),
('MULTIPLE_CHOICE_MULTIPLE', 'Multiple choice question allowing multiple selections'),
('TRUE_FALSE', 'True or false question'),
('OPEN_TEXT', 'Open-ended text response question'),
('RATING', 'Rating scale question (e.g., 1-5 stars)');

-- ================================================
-- APP_SETTINGS
-- ================================================
INSERT INTO app_settings (key, value, description, status_id, created_at, updated_at) 
VALUES (
    'TAX_CONFIG',
    '{ "name": "IVA", "rate": 16.00, "country": "VE" }',
    'Configuración de Impuesto al Valor Agregado (IVA)',
    (SELECT id FROM status WHERE name = 'ACTIVE'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ================================================
-- VERIFICACIÓN DE INSERTS
-- ================================================

-- Verificar que se insertaron correctamente
SELECT 'product_type' as table_name, COUNT(*) as total_records FROM product_type
UNION ALL
SELECT 'availability_type' as table_name, COUNT(*) as total_records FROM availability_type
UNION ALL
SELECT 'meeting_platform' as table_name, COUNT(*) as total_records FROM meeting_platform
UNION ALL
SELECT 'transaction_type' as table_name, COUNT(*) as total_records FROM transaction_type
UNION ALL
SELECT 'transaction_direction' as table_name, COUNT(*) as total_records FROM transaction_direction
UNION ALL
SELECT 'beneficiary_type' as table_name, COUNT(*) as total_records FROM beneficiary_type
UNION ALL
SELECT 'product_resource_type' as table_name, COUNT(*) as total_records FROM product_resource_type
UNION ALL
SELECT 'question_type' as table_name, COUNT(*) as total_records FROM question_type
ORDER BY table_name;