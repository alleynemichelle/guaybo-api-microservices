-- ================================================
-- INSERTS PARA HOST: Yaquelín Moreno y usuario asociado
-- ================================================

-- ================================================
-- 1. INSERT USER (app_user) - Host Owner
-- ================================================
INSERT INTO app_user (
    record_id,
    first_name,
    last_name,
    full_name,
    email,
    federated,
    registered,
    verified_email,
    phone_code,
    phone_number,
    timezone,
    default_language,
    status_id,
    is_host,
    is_referrer,
    created_at,
    updated_at
) VALUES (
    '8402b9fb-2de7-4ea4-a795-535cc5070bc9',
    'michelle',
    'alleyne',
    'michelle alleyne',
    'alleynemichelle123+arcilla@gmail.com',
    false,
    true,
    true,
    '+58',
    '4121234567',
    'America/Caracas',
    'ES',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    true,
    true,
    '2025-01-20T14:15:59.012Z'::timestamptz,
    '2025-01-20T14:15:59.012Z'::timestamptz
);

-- ================================================
-- 1a. INSERT USER (app_user) - Customer
-- ================================================
INSERT INTO app_user (
    record_id,
    first_name,
    last_name,
    full_name,
    email,
    federated,
    registered,
    verified_email,
    phone_code,
    phone_number,
    timezone,
    default_language,
    status_id,
    is_host,
    is_referrer,
    created_at,
    updated_at
) VALUES (
    '0378e988-6721-4373-b4c8-0c0eee9ca4e1',
    'Johan',
    'Gabriel',
    'Johan Gabriel',
    'stephaniecruzcastelli+1@gmail.com',
    false,
    true,
    true,
    '+58',
    '4241702939',
    'America/Caracas',
    'ES',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    false,
    false,
    '2025-03-25T13:54:09.412Z'::timestamptz,
    '2025-03-25T13:54:09.412Z'::timestamptz
);

-- ================================================
-- 2. INSERT HOST
-- ================================================
INSERT INTO host (
    record_id,
    billing_plan_id,
    commission_payer,
    name,
    alias,
    email,
    collection_id,
    description,
    phone_code,
    phone_number,
    timezone,
    verified,
    rating,
    reviews,
    years_experience,
    tags,
    status_id,
    verification_status_id,
    created_at,
    updated_at
) VALUES (
    '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    (SELECT id FROM billing_plan WHERE key = 'BASIC'),
    'HOST',
    'Yaquelín Moreno',
    'yaquelin-moreno',
    'alleynemichelle123+arcilla@gmail.com',
    '88f23365-0886-42e4-8205-43453d8fbb80',
    '¡Hola! Soy Yaquelín y soy una apasionada del arte y las manualidades. Desde los 8 años he estado explorando y perfeccionando mi habilidad artística, encontrando en la arcilla creativa una forma única de expresión. En mis cursos de arcilla creativa, aprenderás a transformar la arcilla en increíbles piezas de arte. Con más de 20 años de experiencia, te guiaré a través de técnicas y trucos que harán que tu creatividad florezca. Mis clases están diseñadas para todas las edades y niveles de habilidad, asegurándote una experiencia enriquecedora y divertida.',
    '58',
    '4141221422',
    'America/Caracas',
    true,
    5,
    0,
    20,
    '[
        {
            "description": "Soy artista desde los 8 años",
            "icon": "paint-brush"
        },
        {
            "description": "Las manualidades son mi forma de expresar",
            "icon": "paint-bucket"
        }
    ]'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    (SELECT id FROM status WHERE name = 'APPROVED' AND entity_type = 'KYC'),
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz
);

-- ================================================
-- 2a. INSERT HOST_SOCIAL_MEDIA (Redes sociales normalizadas)
-- ================================================
INSERT INTO host_social_media (
    host_id,
    platform,
    username,
    status_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'INSTAGRAM',
    'michialleb',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz
);

-- ================================================
-- 2b. INSERT HOST_ANALYTICS (Pixels y trackers)
-- ================================================
INSERT INTO host_analytics (
    host_id,
    record_id,
    provider,
    tracker_id,
    tracker_name,
    configuration,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Meta Pixel principal
(
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    '82956fb1-6ccd-4748-9ed9-0839909e78c2',
    'META_PIXEL',
    '1234567890123452',
    'Meta Pixel Principal',
    '{
        "events": ["PageView", "Purchase", "Lead", "CompleteRegistration"],
        "custom_events": ["ProductView", "AddToCart"],
        "test_mode": false
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz
),
-- Google Analytics 4
(
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    '82956fb1-6ccd-4748-9ed9-0839909e78c2',
    'GOOGLE_ANALYTICS',
    'G-XXXXXXXXXX',
    'Google Analytics 4 Principal',
    '{
        "enhanced_ecommerce": true,
        "custom_dimensions": ["user_type", "host_category"],
        "conversion_tracking": true
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz
),
-- TikTok Pixel (ejemplo de múltiples del mismo tipo)
(
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'TIKTOK_PIXEL',
    'C4A7B2C3D4E5F6G7H8I9J0K1L2M3N4O5',
    'TikTok Pixel Campaigns',
    '{
        "events": ["PageView", "CompletePayment", "SubmitForm"],
        "test_mode": false,
        "advanced_matching": true
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz
);

-- ================================================
-- 3. INSERT HOST_USER RELATION (OWNER role)
-- ================================================
INSERT INTO host_user (
    host_id,
    user_id,
    role_id,
    status_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    (SELECT id FROM app_user WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'),
    (SELECT id FROM role WHERE name = 'OWNER'),
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-01-20T14:15:59.012Z'::timestamptz,
    '2025-01-20T14:15:59.012Z'::timestamptz
);

-- ================================================
-- 3a. INSERT CUSTOMER (relación usuario-host con info adicional)
-- ================================================
INSERT INTO customer (
    record_id,
    host_id,
    user_id,
    total_bookings,
    tags,
    created_at,
    updated_at
) VALUES (
    '364de153-87af-47c9-8ac5-3062b1b84d28',
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    (SELECT id FROM app_user WHERE record_id = '0378e988-6721-4373-b4c8-0c0eee9ca4e1'),
    1,
    '{"source": "web", "notes": "Primer cliente", "interests": ["manualidades"]}'::jsonb,
    '2025-03-25T13:54:09.412Z'::timestamptz,
    '2025-03-25T13:54:09.412Z'::timestamptz
);

-- ================================================
-- 4. INSERT HOST_BILLING_DISCOUNT (descuento QUIEROVENDER)
-- ================================================
INSERT INTO host_billing_discount (
    host_id,
    discount_id,
    status_id,
    valid_from,
    valid_until,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    (SELECT id FROM discount WHERE code = 'QUIEROVENDER'),
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-08-29T16:32:41.886Z'::timestamptz,
    '2025-09-29T16:32:41.886Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz,
    '2025-08-29T16:32:41.886Z'::timestamptz
);

-- ================================================
-- 5. INSERT MULTIMEDIA (logo del host)
-- ================================================
INSERT INTO multimedia (
    record_id,
    host_id,
    type,
    source,
    filename,
    path,
    description,
    usage_type,
    order_index,
    status_id,
    created_at,
    updated_at
) VALUES (
    '82956fb1-6ccd-4748-9ed9-0839909e78c2',
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'image',
    'app',
    'WhatsApp Image 2025-08-27 at 10.49.09.jpeg',
    'public/hosts/26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a/WhatsApp Image 2025-08-27 at 10.49.09.jpeg',
    'Logo del host Yaquelín Moreno',
    'profile',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ================================================
-- 6. INSERT PAYMENT_OPTION (método de pago del usuario - Binance)
-- ================================================
INSERT INTO payment_option (
    record_id,
    user_id,
    payment_method_id,
    owner_type,
    custom_attributes,
    status_id,
    created_at,
    updated_at
) VALUES (
    '023e2a5a-39f3-453f-b965-a588a74180f2',
    (SELECT id FROM app_user WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'),
    (SELECT id FROM payment_method WHERE key = 'BINANCE'),
    'USER',
    '{
        "description": {
            "required": false,
            "type": "string",
            "value": "Comprobante"
        },
        "email": {
            "primary": true,
            "required": true,
            "type": "EMAIL",
            "value": "somoshomi.vzla@gmail.com"
        }
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-22T16:19:55.716Z'::timestamptz,
    '2025-04-22T16:19:55.772Z'::timestamptz
);

-- ================================================
-- 7. INSERT PAYMENT_OPTION (Pago Móvil VES)
-- ================================================
INSERT INTO payment_option (
    record_id,
    user_id,
    payment_method_id,
    owner_type,
    custom_attributes,
    status_id,
    created_at,
    updated_at
) VALUES (
    'e37bf564-b0bb-4222-b84f-099306e5a56f',
    (SELECT id FROM app_user WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'),
    (SELECT id FROM payment_method WHERE key = 'MOBILE_PAYMENT'),
    'USER',
    '{
        "bank": {
            "primary": true,
            "required": true,
            "type": "BANK",
            "value": "100%_BANCO"
        },
        "description": {
            "required": false,
            "type": "string"
        },
        "name": {
            "required": false,
            "type": "string"
        },
        "nationalId": {
            "primary": true,
            "required": true,
            "type": "string",
            "value": "26473481"
        },
        "phoneNumber": {
            "primary": true,
            "required": true,
            "type": "PHONE_NUMBER",
            "value": {
                "code": "58",
                "number": "4241702939"
            }
        }
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-03-06T15:36:34.566Z'::timestamptz,
    '2025-03-06T15:36:34.566Z'::timestamptz
);

-- ================================================
-- 8. INSERT HOST_PAYMENT_OPTION (asociar opciones de pago al host)
-- ================================================
INSERT INTO host_payment_option (
    record_id,
    host_id,
    payment_option_id,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Asociar Binance al host
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    (SELECT id FROM payment_option WHERE record_id = '023e2a5a-39f3-453f-b965-a588a74180f2'),
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-22T16:19:55.716Z'::timestamptz,
    '2025-04-22T16:19:55.772Z'::timestamptz
),
-- Asociar Pago Móvil al host
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    (SELECT id FROM payment_option WHERE record_id = 'e37bf564-b0bb-4222-b84f-099306e5a56f'),
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-03-06T15:36:34.566Z'::timestamptz,
    '2025-03-06T15:36:34.566Z'::timestamptz
);

-- ================================================
-- 9. INSERT PRODUCT (100 mockups de canva para redes sociales)
-- ================================================
INSERT INTO product (
    record_id,
    host_id,
    name,
    alias,
    description,
    product_type,
    status_id,
    is_free,
    timezone,
    total_resources,
    total_duration,
    total_size,
    total_sections,
    template,
    created_at,
    updated_at
) VALUES (
    '65a48ca6-d50d-4003-bedb-b4fd44c91040',
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    '100 mockups de canva para redes sociales',
    '100-mockups-de-canva-para-redes-sociales',
    '100 mockups para tus redes sociales',
    (SELECT id FROM product_type WHERE key = 'DIGITAL_PRODUCT'),
    (SELECT id FROM status WHERE name = 'PUBLISHED' AND entity_type = 'PRODUCT'),
    false,
    'America/Caracas',
    4,
    10,
    940954,
    2,
    '{
        "key": "EVENT",
        "sections": {
            "description": {"order": 2},
            "faqs": {"order": 4},
            "hero": {"order": 1},
            "plans": {"order": 3},
            "testimonials": {"order": 5}
        }
    }'::jsonb,
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 10. INSERT PRODUCT_PLAN (Sesión Individual)
-- ================================================
INSERT INTO product_plan (
    record_id,
    product_id,
    name,
    description,
    order_index,
    min_capacity,
    max_capacity,
    created_at,
    updated_at
) VALUES (
    5283728236,
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    'Sesión Individual',
    'Una hora de coaching personalizado',
    1,
    0,
    0,
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 11. INSERT PRODUCT_PRICE
-- ================================================
INSERT INTO product_price (
    product_plan_id,
    amount,
    currency_id,
    fare_type,
    pricing_model,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM product_plan WHERE record_id = 5283728236),
    3000,  -- $30.00 en céntimos
    (SELECT id FROM currency WHERE code = 'USD'),
    'GENERAL',
    'PER_PERSON',
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 12. INSERT PRODUCT_BOOKING_SETTINGS
-- ================================================
INSERT INTO product_booking_settings (
    record_id,
    product_id,
    booking_flow,
    default_payment_status_id,
    required_data,
    created_at,
    updated_at
) VALUES (
    'ce491011-e4e6-473b-ada0-b2193e15c007',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    'APP_BOOKING',
    (SELECT id FROM status WHERE name = 'PENDING' AND entity_type = 'GENERAL'),
    ARRAY['email', 'firstName', 'lastName', 'phoneNumber'],
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 13. INSERT PRODUCT_CURRENCY (monedas del producto)
-- ================================================
INSERT INTO product_currency (
    product_id,
    currency_id,
    is_default,
    status_id,
    created_at,
    updated_at
) VALUES 
-- USD como moneda por defecto
(
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM currency WHERE code = 'USD'),
    true,  -- es la moneda por defecto
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
),
-- VES como moneda adicional
(
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM currency WHERE code = 'VES'),
    false,  -- no es la moneda por defecto
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);
-- ================================================
-- 14. INSERT PRODUCT_INSTALLMENT_PROGRAM
-- ================================================
INSERT INTO product_installment_program (
    record_id,
    product_id,
    installments_count,
    frequency,
    interest_fee_amount,
    interest_fee_type,
    conditions,
    status_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    2,
    'EVERY_TWO_WEEKS',
    300,  -- $3.00 en céntimos
    'FIXED',
    '[]'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 15. INSERT DISCOUNT (Promocion - 10%)
-- ================================================
INSERT INTO discount (
    record_id,
    name,
    description,
    amount,
    type,
    scope,
    status_id,
    conditions,
    created_at,
    updated_at
) VALUES (
    '9994447198',
    'Promocion',
    'Promocion',
    1000,  -- 10.00% en céntimos (10.00 * 100)
    'PERCENTAGE',
    'ITEM',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'DISCOUNT'),
    '[{"attribute": "currency", "operator": "EQUALS", "value": ["USD"]}]'::jsonb,
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 16. INSERT DISCOUNT (CODIGO100 - 30%)
-- ================================================
INSERT INTO discount (
    record_id,
    name,
    description,
    amount,
    type,
    scope,
    code,
    max_capacity,
    status_id,
    created_at,
    updated_at
) VALUES (
    '9994445800',
    'CODIGO100',
    'descripcion del CODIGO100 ',
    3000,  -- 30.00% en céntimos (30.00 * 100)
    'PERCENTAGE',
    'TOTAL',
    'CODIGO100',
    12,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'DISCOUNT'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 17. INSERT PRODUCT_DISCOUNT (asociaciones)
-- ================================================
INSERT INTO product_discount (
    product_id,
    discount_id,
    type,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Descuento Promocion
(
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM discount WHERE record_id = '9994447198'),
    'DISCOUNT',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
),
-- Código de descuento CODIGO100
(
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM discount WHERE record_id = '9994445800'),
    'COUPON',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 18. INSERT PRODUCT_POST_BOOKING_STEP (WhatsApp)
-- ================================================
INSERT INTO product_post_booking_step (
    record_id,
    product_id,
    type,
    title,
    description,
    conditions,
    is_mandatory,
    custom_attributes,
    order_index,
    created_at,
    updated_at
) VALUES (
    '296258767',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    'WHATSAPP_GROUP',
    'enlace de whatsapp',
    'descripcion enlace de whatsapp',
    '[]'::jsonb,
    true,
    '{"url": {"required": true, "type": "string", "value": "https://wa.link"}}'::jsonb,
    1,
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 19. INSERT MULTIMEDIA (imagen principal del producto)
-- ================================================
INSERT INTO multimedia (
    record_id,
    host_id,
    type,
    source,
    filename,
    path,
    description,
    usage_type,
    order_index,
    status_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'image',
    'app',
    'arcilla-1.png',
    'public/hosts/26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a/products/5aeb1d88-2e04-4c41-8d96-32bf516117b3/arcilla-1.png',
    'Imagen principal del producto mockups',
    'gallery',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 20. INSERT PRODUCT_MULTIMEDIA (asociar imagen al producto)
-- ================================================
INSERT INTO product_multimedia (
    product_id,
    multimedia_id,
    order_index,
    usage_type,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM multimedia WHERE path = 'public/hosts/26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a/products/5aeb1d88-2e04-4c41-8d96-32bf516117b3/arcilla-1.png'),
    1,
    'gallery',
    '2025-04-15T21:26:50.502Z'::timestamptz,
    '2025-06-04T18:08:34.349Z'::timestamptz
);

-- ================================================
-- 21. INSERT PRODUCT_RESOURCES
-- ================================================

-- Primero insertamos las secciones (sin parent_id)
INSERT INTO product_resource (
    record_id,
    product_id,
    parent_id,
    type,
    title,
    description,
    order_index,
    preview,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Section 1
(
    'f2f4557b-44a7-46d7-b3da-adf2c88be491',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    NULL,
    'SECTION',
    'section 1',
    'section 1',
    3,
    false,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:07:31.490Z'::timestamptz,
    '2025-06-04T18:07:31.490Z'::timestamptz
),
-- Section 2
(
    '302e7310-a3ac-42d7-8275-35e95ae0fd4d',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    NULL,
    'SECTION',
    'section 2',
    NULL,
    4,
    false,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:08:08.449Z'::timestamptz,
    '2025-06-04T18:08:08.449Z'::timestamptz
);

-- Luego insertamos los recursos con sus parent_id correspondientes
INSERT INTO product_resource (
    record_id,
    product_id,
    parent_id,
    type,
    title,
    description,
    long_description,
    file_id,
    processing_status_id,
    encode_progress,
    size,
    duration,
    preview,
    order_index,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Recurso 1: Imagen en section 1
(
    '8679f47e-4e53-48ae-b8cf-e0a6d7113772',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM product_resource WHERE record_id = 'f2f4557b-44a7-46d7-b3da-adf2c88be491'),
    'RESOURCE',
    'ChatGPT Image 1 jun 2025, 09_19_40 p.m..png',
    'una imagen',
    NULL,
    NULL,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    NULL,
    1.42,
    10,
    false,
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:07:57.068Z'::timestamptz,
    '2025-06-04T18:07:57.068Z'::timestamptz
),
-- Recurso 2: PDF sin parent (independiente)
(
    'cec191bc-702a-4144-8cce-6c04ad7ce206',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    NULL,
    'RESOURCE',
    'Guía descargable - Psicología del Trader',
    'Documento en PDF que explica cómo gestionar las emociones al operar y desarrollar una mentalidad ganadora.',
    NULL,
    NULL,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    NULL,
    1.8,
    0,
    false,
    2,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-05-28T16:16:19.746Z'::timestamptz,
    '2025-05-28T16:16:19.746Z'::timestamptz
),
-- Recurso 3: Libro PDF en section 2
(
    'ed3042fd-5071-42a5-a91f-80cf323e7431',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    (SELECT id FROM product_resource WHERE record_id = '302e7310-a3ac-42d7-8275-35e95ae0fd4d'),
    'RESOURCE',
    'Libro El club de las 5 am.pdf',
    'el club',
    NULL,
    NULL,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    NULL,
    3.46,
    0,
    false,
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:08:34.250Z'::timestamptz,
    '2025-06-04T18:08:34.250Z'::timestamptz
),
-- Recurso 4: PDF con preview habilitado
(
    'f0715a08-d2a3-4858-a56a-cb76c8dd9941',
    (SELECT id FROM product WHERE record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'),
    NULL,
    'RESOURCE',
    'Guía descargable - Psicología del Trader',
    'Documento en PDF que explica cómo gestionar las emociones al operar y desarrollar una mentalidad ganadora.',
    NULL,
    '3352cd7f-f1e4-475a-97f4-6ad98069059e',
    (SELECT id FROM status WHERE name = 'FINISHED' AND entity_type = 'RESOURCE_PROCESSING'),
    100,
    940947,
    0,
    true,
    2,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-05-28T17:04:54.074Z'::timestamptz,
    '2025-05-28T17:04:54.074Z'::timestamptz
);

-- ================================================
-- 22. INSERT MULTIMEDIA para recursos principales
-- ================================================
INSERT INTO multimedia (
    record_id,
    host_id,
    type,
    source,
    filename,
    path,
    description,
    usage_type,
    order_index,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Recurso 1: Imagen ChatGPT
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'image',
    'bunny_storage',
    'chatgpt-image-1-jun-2025-09_19_40-p.m..png',
    'https://dev-guaybo-pull-zone.b-cdn.net/private/88f23365-0886-42e4-8205-43453d8fbb80/chatgpt-image-1-jun-2025-09_19_40-p.m..png',
    'ChatGPT Image 1 jun 2025, 09_19_40 p.m..png',
    'resource',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:07:57.068Z'::timestamptz,
    '2025-06-04T18:07:57.068Z'::timestamptz
),
-- Recurso 2: PDF Psicología del Trader (primera versión)
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'document',
    'bunny_storage',
    'Plan_Clase_26003.pdf',
    'https://dev-guaybo-pull-zone.b-cdn.net/private/host_1/Plan_Clase_26003.pdf',
    'Guía descargable - Psicología del Trader',
    'resource',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-05-28T16:16:19.746Z'::timestamptz,
    '2025-05-28T16:16:19.746Z'::timestamptz
),
-- Recurso 3: Libro El club de las 5 am
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'document',
    'bunny_storage',
    'libro-el-club-de-las-5-am.pdf',
    'https://dev-guaybo-pull-zone.b-cdn.net/private/88f23365-0886-42e4-8205-43453d8fbb80/libro-el-club-de-las-5-am.pdf',
    'Libro El club de las 5 am.pdf',
    'resource',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:08:34.250Z'::timestamptz,
    '2025-06-04T18:08:34.250Z'::timestamptz
),
-- Recurso 4: PDF con preview (Bunny Stream)
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'document',
    'bunny_stream',
    'Plan_Clase_26003.pdf',
    'https://vz-1941f908-f99.b-cdn.net/3352cd7f-f1e4-475a-97f4-6ad98069059e',
    'Guía descargable - Psicología del Trader (con preview)',
    'resource',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-05-28T17:04:54.074Z'::timestamptz,
    '2025-05-28T17:04:54.074Z'::timestamptz
);

-- ================================================
-- 23. INSERT MULTIMEDIA para thumbnails de recursos
-- ================================================
INSERT INTO multimedia (
    record_id,
    host_id,
    type,
    source,
    filename,
    path,
    description,
    usage_type,
    order_index,
    status_id,
    created_at,
    updated_at
) VALUES 
-- Thumbnail para section 1
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'image',
    'app',
    'ebook-layout-example-with-vibrant-visuals.webp',
    'public/88f23365-0886-42e4-8205-43453d8fbb80/ebook-layout-example-with-vibrant-visuals.webp',
    'Thumbnail para section 1',
    'thumbnail',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-06-04T18:07:31.490Z'::timestamptz,
    '2025-06-04T18:07:31.490Z'::timestamptz
),
-- Thumbnail para recursos PDF (compartido)
(
    gen_random_uuid(),
    (SELECT id FROM host WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'),
    'image',
    'bunny_storage',
    'foto.jpeg',
    'https://dev-guaybo-pull-zone.b-cdn.net/public/host_1/foto.jpeg',
    'Thumbnail para recursos PDF',
    'thumbnail',
    1,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-05-28T16:16:19.746Z'::timestamptz,
    '2025-05-28T16:16:19.746Z'::timestamptz
);

-- ================================================
-- 24. UPDATE PRODUCT_RESOURCE con multimedia_id y thumbnail_id
-- ================================================

-- Asignar multimedia_id a recursos principales
UPDATE product_resource 
SET multimedia_id = (
    SELECT id FROM multimedia 
    WHERE filename = 'chatgpt-image-1-jun-2025-09_19_40-p.m..png' AND usage_type = 'resource'
)
WHERE record_id = '8679f47e-4e53-48ae-b8cf-e0a6d7113772';

UPDATE product_resource 
SET multimedia_id = (
    SELECT id FROM multimedia 
    WHERE filename = 'Plan_Clase_26003.pdf' AND usage_type = 'resource' AND source = 'bunny_storage'
)
WHERE record_id = 'cec191bc-702a-4144-8cce-6c04ad7ce206';

UPDATE product_resource 
SET multimedia_id = (
    SELECT id FROM multimedia 
    WHERE filename = 'libro-el-club-de-las-5-am.pdf' AND usage_type = 'resource'
)
WHERE record_id = 'ed3042fd-5071-42a5-a91f-80cf323e7431';

UPDATE product_resource 
SET multimedia_id = (
    SELECT id FROM multimedia 
    WHERE filename = 'Plan_Clase_26003.pdf' AND usage_type = 'resource' AND source = 'bunny_stream'
)
WHERE record_id = 'f0715a08-d2a3-4858-a56a-cb76c8dd9941';

-- Asignar thumbnail_id a secciones y recursos
UPDATE product_resource 
SET thumbnail_id = (
    SELECT id FROM multimedia 
    WHERE path = 'public/88f23365-0886-42e4-8205-43453d8fbb80/ebook-layout-example-with-vibrant-visuals.webp'
)
WHERE record_id = 'f2f4557b-44a7-46d7-b3da-adf2c88be491';

UPDATE product_resource 
SET thumbnail_id = (
    SELECT id FROM multimedia 
    WHERE path = 'https://dev-guaybo-pull-zone.b-cdn.net/public/host_1/foto.jpeg'
)
WHERE record_id IN ('cec191bc-702a-4144-8cce-6c04ad7ce206', 'f0715a08-d2a3-4858-a56a-cb76c8dd9941');

-- ================================================
-- 25. INSERT REFERRAL_CODE
-- ================================================
INSERT INTO referral_code (
    record_id,
    referrer_id,
    code,
    referral_rate,
    duration_days,
    window_days,
    status_id,
    created_at,
    updated_at
) VALUES (
    '542bee9c-868f-4dc2-b515-127f3d3bf010',
    (SELECT id FROM app_user WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'),
    'MICHE2025',
    10.00, -- Asumiendo un 10% de comisión por referidos (no especificado en los datos)
    365,
    365,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-08-17T00:52:18.915Z'::timestamptz,
    '2025-08-17T00:52:18.915Z'::timestamptz
);

-- ================================================
-- 26. INSERT NEW REFERRED USER
-- ================================================
INSERT INTO app_user (
    record_id,
    first_name,
    last_name,
    full_name,
    email,
    federated,
    registered,
    verified_email,
    phone_code,
    phone_number,
    timezone,
    default_language,
    status_id,
    is_host,
    is_referrer,
    created_at,
    updated_at
) VALUES (
    'fd443e69-b16d-4a6f-be44-8f1d7c204e63',
    'Ana',
    'Referida',
    'Ana Referida',
    'alleynemichelle123+referida@gmail.com',
    false,
    true,
    true,
    '+58',
    '4129876543',
    'America/Caracas',
    'ES',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    false,
    false,
    '2025-08-17T20:37:57.115Z'::timestamptz,
    '2025-08-17T20:37:57.115Z'::timestamptz
);

-- ================================================
-- 27. INSERT REFERRAL_ASSOCIATION
-- ================================================
INSERT INTO referral_association (
    referrer_id,
    referred_id,
    utm_source,
    referral_code_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM app_user WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'), 
    (SELECT id FROM app_user WHERE email = 'alleynemichelle123+referida@gmail.com'), 
    'facebook',
    (SELECT id FROM referral_code WHERE code = 'MICHE2025'),
    '2025-08-17T20:37:57.115Z'::timestamptz,
    '2025-08-17T20:37:57.115Z'::timestamptz
);

-- ================================================
-- VERIFICACIÓN DE INSERTS
-- ================================================

-- Verificar usuarios insertados
SELECT 'Usuario Host insertado:' as info;
SELECT record_id, first_name, last_name, email, is_host, is_referrer 
FROM app_user 
WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9';

SELECT 'Usuario Customer insertado:' as info;
SELECT record_id, first_name, last_name, email, is_host, is_referrer 
FROM app_user 
WHERE record_id = '0378e988-6721-4373-b4c8-0c0eee9ca4e1';

-- Verificar host insertado
SELECT 'Host insertado:' as info;
SELECT record_id, name, alias, email, verified, rating, years_experience
FROM host 
WHERE record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- Verificar relación host-user
SELECT 'Relación host-user:' as info;
SELECT h.name as host_name, u.full_name as user_name, r.name as role_name
FROM host_user hu
JOIN host h ON hu.host_id = h.id
JOIN app_user u ON hu.user_id = u.id
JOIN role r ON hu.role_id = r.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- Verificar customer insertado
SELECT 'Customer insertado:' as info;
SELECT 
    c.record_id,
    h.name as host_name,
    u.full_name as customer_name,
    u.email as customer_email,
    u.phone_code,
    u.phone_number,
    c.total_bookings,
    c.tags,
    c.created_at
FROM customer c
JOIN host h ON c.host_id = h.id
JOIN app_user u ON c.user_id = u.id
WHERE c.record_id = '364de153-87af-47c9-8ac5-3062b1b84d28';

-- Verificar descuento aplicado al host
SELECT 'Descuento del host:' as info;
SELECT h.name as host_name, d.code, d.amount, d.type, hbd.valid_from, hbd.valid_until
FROM host_billing_discount hbd
JOIN host h ON hbd.host_id = h.id
JOIN discount d ON hbd.discount_id = d.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- Verificar código de referido
SELECT 'Código de referido:' as info;
SELECT u.full_name as referrer_name, rc.code, rc.referral_rate, rc.duration_days
FROM referral_code rc
JOIN app_user u ON rc.referrer_id = u.id
WHERE rc.code = 'MICHE2025';

-- Verificar métodos de pago del usuario
SELECT 'Métodos de pago del usuario:' as info;
SELECT 
    u.full_name as user_name,
    pm.key as payment_method, 
    po.record_id,
    po.custom_attributes
FROM payment_option po
JOIN app_user u ON po.user_id = u.id
JOIN payment_method pm ON po.payment_method_id = pm.id
WHERE u.record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'
ORDER BY pm.key;

-- Verificar asociaciones de métodos de pago con el host
SELECT 'Métodos de pago asociados al host:' as info;
SELECT 
    h.name as host_name,
    u.full_name as user_name,
    pm.key as payment_method,
    po.record_id as payment_option_id,
    hpo.record_id as host_payment_option_id,
    hpo.created_at as associated_at
FROM host_payment_option hpo
JOIN host h ON hpo.host_id = h.id
JOIN payment_option po ON hpo.payment_option_id = po.id
JOIN app_user u ON po.user_id = u.id
JOIN payment_method pm ON po.payment_method_id = pm.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY pm.key;

-- Verificar producto insertado
SELECT 'Producto insertado:' as info;
SELECT 
    p.record_id,
    p.name,
    p.alias,
    pt.key as product_type,
    s.name as status,
    p.is_free,
    p.total_resources,
    p.total_duration,
    p.total_sections
FROM product p
JOIN product_type pt ON p.product_type = pt.id
JOIN status s ON p.status_id = s.id
WHERE p.record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040';

-- Verificar plan y precio del producto
SELECT 'Plan y precio del producto:' as info;
SELECT 
    pp.name as plan_name,
    pp.description,
    pr.amount as amount_cents,
    (pr.amount / 100.0) as amount_dollars,
    c.code as currency,
    pr.fare_type,
    pr.pricing_model
FROM product_plan pp
JOIN product_price pr ON pp.id = pr.product_plan_id
JOIN currency c ON pr.currency_id = c.id
WHERE pp.record_id = 5283728236;

-- Verificar descuentos del producto
SELECT 'Descuentos del producto:' as info;
SELECT 
    d.name,
    d.code,
    d.amount as amount_cents,
    (d.amount / 100.0) as amount_percentage,
    d.type,
    d.scope,
    pd.type as discount_type,
    d.max_capacity
FROM product_discount pd
JOIN discount d ON pd.discount_id = d.id
JOIN product p ON pd.product_id = p.id
WHERE p.record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'
ORDER BY d.name;

-- Verificar monedas del producto
SELECT 'Monedas del producto:' as info;
SELECT 
    p.name as product_name,
    c.code as currency_code,
    c.symbol as currency_symbol,
    pc.is_default
FROM product_currency pc
JOIN product p ON pc.product_id = p.id
JOIN currency c ON pc.currency_id = c.id
WHERE p.record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'
ORDER BY pc.is_default DESC;

-- Verificar recursos del producto con multimedia
SELECT 'Recursos del producto con multimedia:' as info;
SELECT 
    pr.record_id,
    pr.type,
    pr.title,
    pr.description,
    pr.order_index,
    pr.preview,
    pr.size,
    pr.duration,
    CASE 
        WHEN pr.parent_id IS NOT NULL THEN parent_pr.title 
        ELSE 'Sin padre'
    END as parent_section,
    pr.file_id,
    pr.encode_progress,
    -- Información del multimedia principal
    m.filename as multimedia_filename,
    m.path as multimedia_url,
    m.source as multimedia_source,
    m.type as multimedia_type,
    -- Información del thumbnail
    t.filename as thumbnail_filename,
    t.path as thumbnail_url
FROM product_resource pr
LEFT JOIN product_resource parent_pr ON pr.parent_id = parent_pr.id
LEFT JOIN multimedia m ON pr.multimedia_id = m.id
LEFT JOIN multimedia t ON pr.thumbnail_id = t.id
JOIN product p ON pr.product_id = p.id
WHERE p.record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'
ORDER BY pr.order_index;

-- Verificar jerarquía de recursos (secciones y sus recursos)
SELECT 'Jerarquía de recursos:' as info;
WITH RECURSIVE resource_hierarchy AS (
    -- Secciones principales (sin padre)
    SELECT 
        pr.id,
        pr.record_id,
        pr.type,
        pr.title,
        pr.order_index,
        0 as level,
        CAST(pr.title AS TEXT) as hierarchy_path
    FROM product_resource pr
    JOIN product p ON pr.product_id = p.id
    WHERE p.record_id = '65a48ca6-d50d-4003-bedb-b4fd44c91040'
      AND pr.parent_id IS NULL
    
    UNION ALL
    
    -- Recursos hijos
    SELECT 
        pr.id,
        pr.record_id,
        pr.type,
        pr.title,
        pr.order_index,
        rh.level + 1,
        CAST(rh.hierarchy_path || ' > ' || pr.title AS TEXT)
    FROM product_resource pr
    JOIN resource_hierarchy rh ON pr.parent_id = rh.id
)
SELECT 
    REPEAT('  ', level) || title as indented_title,
    type,
    order_index,
    record_id
FROM resource_hierarchy
ORDER BY hierarchy_path, order_index;