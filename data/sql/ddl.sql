-- ================================================
-- Tabla STATUS (global o específica por entity_type)
-- ================================================
CREATE TABLE status (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,       -- ej: 'ACTIVE', 'INACTIVE', 'PENDING'
    description VARCHAR(255),                -- explicación breve
    entity_type VARCHAR(100) NOT NULL,       -- ej: 'host', 'multimedia', 'booking'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Lookup tables (para reemplazar enums como VARCHAR)
-- ================================================

CREATE TABLE product_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'EVENT', 'COURSE', 'DIGITAL_PRODUCT'
    description VARCHAR(255)
);

CREATE TABLE availability_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'CLIENT_AGREEMENT', 'DEFINED_RANGE'
    description VARCHAR(255)
);

CREATE TABLE meeting_platform (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'ZOOM', 'MEET', 'TEAMS'
    description VARCHAR(255)
);

CREATE TABLE transaction_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'SALE', 'COMMISSION', 'AFFILIATE_COMMISSION', 'WITHDRAWAL', 'FEE'
    description VARCHAR(255)
);

CREATE TABLE transaction_direction (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(10) NOT NULL UNIQUE,   -- 'IN', 'OUT'
    description VARCHAR(255)
);

CREATE TABLE beneficiary_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'HOST', 'CO_PRODUCER', 'AFFILIATE', 'GUAYBO', 'BANK'
    description VARCHAR(255)
);

CREATE TABLE product_resource_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'SECTION', 'RESOURCE', 'QUIZ', 'SURVEY'
    description VARCHAR(255)
);

CREATE TABLE question_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,   -- 'MULTIPLE_CHOICE_SINGLE', 'TRUE_FALSE', 'OPEN_TEXT', etc.
    description VARCHAR(255)
);


-- ================================================
-- Tabla APP_SETTINGS (Configuraciones globales)
-- ================================================
CREATE TABLE app_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,       -- ej: 'TAX_CONFIG', 'API_KEYS'
    value JSONB,                            -- valor de la configuración
    description VARCHAR(255),
    status_id BIGINT REFERENCES status(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Tabla CURRENCY
-- ================================================
CREATE TABLE currency (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,   -- 'USD', 'VES', 'EUR'
    symbol VARCHAR(10) NOT NULL,        -- '$', 'Bs.', '€'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- Tabla ROLE
-- ================================================
CREATE TABLE role (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,       -- Ej: 'owner', 'admin', 'editor', 'viewer'
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Tabla PAYMENT_METHOD
-- ================================================

CREATE TABLE payment_method (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,     -- Ej: 'MOBILE_PAYMENT', 'PAYPAL', 'ZELLE'
    icon VARCHAR(50),
    requires_coordination BOOLEAN DEFAULT FALSE,
    automatic BOOLEAN DEFAULT FALSE,
    currency_id BIGINT NOT NULL REFERENCES currency(id),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id)
);

CREATE TABLE discount (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    owner_type VARCHAR(50) NOT NULL DEFAULT 'APP', -- 'APP', 'HOST'

    amount BIGINT NOT NULL,        -- monto del descuento en céntimos
    type VARCHAR(50) NOT NULL,            -- 'PERCENTAGE', 'FIXED'
    scope VARCHAR(50) NOT NULL,           -- 'TOTAL', 'ITEM'

    status_id BIGINT REFERENCES status(id),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,

    code VARCHAR(100),          -- código opcional (ej: SUMMER2025)
    max_capacity INT,           -- límite de usos totales

    duration JSONB,             -- { "quantity": 1, "unit": "MM" }
    conditions JSONB,           -- condiciones adicionales dinámicas

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE billing_plan (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    key VARCHAR(100) NOT NULL UNIQUE,   -- 'BASIC', 'PREMIUM', 'ENTERPRISE'
    description VARCHAR(1000),          

    features JSONB,  
    status_id BIGINT REFERENCES status(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE plan_breakdown (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    billing_plan_id BIGINT NOT NULL REFERENCES billing_plan(id) ON DELETE CASCADE,

    key VARCHAR(100) NOT NULL,   -- 'PLAN_PERCENTAGE_COMMISSION', 'PLAN_FIXED_COMMISSION'
    type VARCHAR(50) NOT NULL,   -- 'PERCENTAGE', 'FIXED', 'SUBSCRIPTION'
    amount BIGINT NOT NULL       -- monto en céntimos
);

-- ================================================
-- Tabla HOST
-- ================================================
CREATE TABLE host (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    billing_plan_id BIGINT NOT NULL REFERENCES billing_plan(id),
    commission_payer VARCHAR(50) NOT NULL DEFAULT 'HOST',
    
    name VARCHAR(255) NOT NULL,
    alias VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,

    collection_id VARCHAR(255),
    description VARCHAR(1000),
    
    phone_code VARCHAR(10),
    phone_number VARCHAR(20),
    timezone VARCHAR(100),

    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(5,0),
    reviews INT,
    years_experience INT,

    -- Redes sociales y analytics ahora normalizadas en tablas separadas

    -- Tags como JSONB
    tags JSONB,   -- [ { "caption": "...", "description": "...", "icon": "..." }, ... ]

    -- Estados
    status_id BIGINT REFERENCES status(id),
    verification_status_id BIGINT REFERENCES status(id),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Tabla USER
-- ================================================
CREATE TABLE app_user (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    instagram_account VARCHAR(255),
    federated BOOLEAN DEFAULT FALSE,
    registered BOOLEAN DEFAULT FALSE,
    verified_email BOOLEAN DEFAULT FALSE,

    phone_code VARCHAR(10),
    phone_number VARCHAR(20),

    timezone VARCHAR(100),
    last_access TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    default_language VARCHAR(20) DEFAULT 'ES',

    -- Estado
    status_id BIGINT REFERENCES status(id),

    is_host BOOLEAN DEFAULT FALSE,
    is_referrer BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Tabla MULTIMEDIA
-- ================================================
CREATE TABLE multimedia (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    -- Propietario: host o user
    host_id BIGINT REFERENCES host(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT chk_multimedia_owner CHECK (
        (host_id IS NOT NULL AND user_id IS NULL)
        OR (host_id IS NULL AND user_id IS NOT NULL)
    ),

    type VARCHAR(50) NOT NULL,    -- 'image', 'video'
    source VARCHAR(50) NOT NULL,  -- 'upload', 'youtube', 'drive', 'bunny'
    filename VARCHAR(500),
    path VARCHAR(1000),
    description VARCHAR(1000),
    usage_type VARCHAR(50),  -- 'profile', 'banner', 'preview', 'thumbnail'
    order_index INT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    status_id BIGINT REFERENCES status(id)
);





-- ================================================
-- Tabla HOST_SOCIAL_MEDIA (Redes sociales normalizadas)
-- ================================================
CREATE TABLE host_social_media (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL,     -- 'INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', etc.
    username VARCHAR(255),              -- @username o handle
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status_id BIGINT REFERENCES status(id),
    
    UNIQUE(host_id, platform, username)
);

-- ================================================
-- Tabla HOST_ANALYTICS (Pixels y trackers normalizados)
-- ================================================
CREATE TABLE host_analytics (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    
    provider VARCHAR(50) NOT NULL,      -- 'META_PIXEL', 'GOOGLE_ANALYTICS', 'GOOGLE_TAG_MANAGER', 'TIKTOK_PIXEL', etc.
    tracker_id VARCHAR(255) NOT NULL,   -- ID del pixel/tracker
    tracker_name VARCHAR(255),          -- Nombre descriptivo del tracker
    configuration JSONB,                -- Configuración específica del tracker
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status_id BIGINT REFERENCES status(id),
    
    UNIQUE(host_id, provider, tracker_id)
);

-- ================================================
-- Relación N:M entre USER y HOST con ROLE
-- ================================================
CREATE TABLE host_user (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES role(id) ON DELETE RESTRICT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    status_id BIGINT REFERENCES status(id),

    -- Garantiza que un usuario no se repita dentro del mismo host
    UNIQUE(host_id, user_id)
);

-- ================================================
-- Tabla CUSTOMER (relación usuario-host con info adicional)
-- ================================================
CREATE TABLE customer (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    total_bookings INTEGER DEFAULT 0,
    tags JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(host_id, user_id)
);


-- ================================================
-- Tabla HOST_BILLING_DISCOUNT
-- ================================================
CREATE TABLE host_billing_discount (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    discount_id BIGINT NOT NULL REFERENCES discount(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    UNIQUE(host_id, discount_id)
);



CREATE TABLE product (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,

    name VARCHAR(500) NOT NULL,
    alias VARCHAR(500) NOT NULL,
    description VARCHAR(300),
    description_section JSONB, -- [{title, content}]

    product_type BIGINT NOT NULL REFERENCES product_type(id) ON DELETE RESTRICT,
    status_id BIGINT REFERENCES status(id), -- 'PUBLISHED', 'DRAFT', etc.

    is_free BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(100),
    main_date TIMESTAMPTZ,
    min_capacity INT DEFAULT 0,
    max_capacity INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    total_resources INT DEFAULT 0,
    total_duration INT DEFAULT 0,   -- en minutos
    total_size BIGINT DEFAULT 0,    -- en bytes
    total_sections INT DEFAULT 0,
    availability_type BIGINT REFERENCES availability_type(id) ON DELETE SET NULL,
    meeting_platform BIGINT REFERENCES meeting_platform(id) ON DELETE SET NULL,     -- 'ZOOM', 'MEET', 'TEAMS'
    meeting_url VARCHAR(1000),
    meeting_instructions TEXT,

    terms_and_conditions JSONB, -- { "updated_at": "2025-01-01T00:00:00Z", "content": "By using this service, you agree to the following terms..." }
    duration JSONB,             -- { "quantity": 1, "unit": "MM" }
    template JSONB,         -- estructura de secciones


    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_date (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id BIGINT NOT NULL UNIQUE,  -- antes era UUID

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    initial_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    timezone VARCHAR(100),

    status_id BIGINT REFERENCES status(id),
    total_bookings INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE product_plan (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id BIGINT NOT NULL UNIQUE, 

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT,
    total_bookings INT DEFAULT 0,
    min_capacity INT DEFAULT 0,
    max_capacity INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_price (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_plan_id BIGINT NOT NULL REFERENCES product_plan(id) ON DELETE CASCADE,

    amount BIGINT NOT NULL,        -- precio en céntimos
    currency_id BIGINT NOT NULL REFERENCES currency(id), 
    fare_type VARCHAR(50),     -- GENERAL, VIP, etc.
    pricing_model VARCHAR(50), -- PER_PERSON, PER_GROUP, etc.

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_discount (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    discount_id BIGINT NOT NULL REFERENCES discount(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, discount_id),
    type VARCHAR(50) NOT NULL,  -- 'DISCOUNT', 'COUPON'
    status_id BIGINT REFERENCES status(id)
);


CREATE TABLE faq (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE testimonial (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    comment TEXT NOT NULL,
    user_name VARCHAR(255),

    order_index INT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE testimonial_multimedia (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testimonial_id BIGINT NOT NULL REFERENCES testimonial(id) ON DELETE CASCADE,
    multimedia_id BIGINT NOT NULL REFERENCES multimedia(id) ON DELETE CASCADE,
    order_index INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_multimedia (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    multimedia_id BIGINT NOT NULL REFERENCES multimedia(id) ON DELETE CASCADE,
    order_index INT,
    usage_type VARCHAR(50), -- 'gallery', 'banner', 'preview'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Tabla PRODUCT_BOOKING_SETTINGS
-- ================================================
CREATE TABLE product_booking_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    booking_flow VARCHAR(50) NOT NULL,         -- 'APP_BOOKING', etc.
    default_payment_status_id BIGINT REFERENCES status(id),        -- 'PAID', 'PENDING', etc.

    required_data TEXT[] NOT NULL,             -- ['email', 'firstName', 'lastName']

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- Tabla PRODUCT_CURRENCY (relación N:M)
-- ================================================
CREATE TABLE product_currency (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    currency_id BIGINT NOT NULL REFERENCES currency(id) ON DELETE RESTRICT,
    
    is_default BOOLEAN DEFAULT FALSE,  -- indica si es la moneda por defecto del producto
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id),
    
    UNIQUE(product_id, currency_id)
);

-- ================================================
-- Tabla PRODUCT_POST_BOOKING_STEP
-- ================================================

CREATE TABLE product_post_booking_step (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id BIGINT NOT NULL UNIQUE,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL,       -- 'TEXT', 'FORM', 'WHATSAPP_GROUP', 'TELEGRAM_CHANNEL', 'DISCORD_CHANNEL', 'ZOOM', 'GOOGLE_MEETS', 'MICROSOFT_TEAMS', 'LINK', 'CUSTOM', 'MEETING_INVITATION'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    conditions JSONB,                -- reglas adicionales para aplicar
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_meeting_invitation BOOLEAN DEFAULT FALSE,
    custom_attributes JSONB,         -- { url: {...}, etc. }

    order_index INT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE product_installment_program(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    initial_payment_amount BIGINT,        -- monto inicial en céntimos

    installments_count INT NOT NULL, 
    payment_deadline_days_before_event INT,
    payment_deadline_days_after_event INT,

    frequency VARCHAR(50) NOT NULL,  -- 'MONTHLY', 'WEEKLY', 'EVERY_TWO_WEEKS'

    interest_fee_amount BIGINT,           -- comisión de interés en céntimos
    interest_fee_type VARCHAR(50),  -- 'FIXED', 'PERCENTAGE'

    conditions JSONB,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id)
);

CREATE TABLE co_producer (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,   -- dueño principal del producto
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE, -- coproductor (usuario humano)

    -- Porcentaje de ingresos (0–100)
    revenue_share DECIMAL(5,2) NOT NULL CHECK (revenue_share >= 0 AND revenue_share <= 100),

    -- Vigencia (NULL = indefinido)
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,

    -- Estado (ej. PENDING, ACCEPTED, REMOVED)
    status_id BIGINT REFERENCES status(id),

    -- Rol del coproductor en el producto
    role_id BIGINT NOT NULL REFERENCES role(id) ON DELETE RESTRICT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(product_id, user_id) -- evita duplicados
);


CREATE TABLE product_weekly_availability (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE payment_option (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    owner_type VARCHAR(50) NOT NULL, -- 'APP', 'USER'
    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,

    payment_method_id BIGINT NOT NULL REFERENCES payment_method(id) ON DELETE RESTRICT,
    custom_attributes JSONB,              -- { "bank": "...", "nationalId": "...", "phoneNumber": {...} }
    status_id BIGINT REFERENCES status(id),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT chk_payment_option_owner CHECK (
        (owner_type = 'USER' AND user_id IS NOT NULL) OR
        (owner_type = 'APP' AND user_id IS NULL)
    )
);

-- Tabla de relación many-to-many entre host y payment_option
CREATE TABLE host_payment_option (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    payment_option_id BIGINT NOT NULL REFERENCES payment_option(id) ON DELETE CASCADE,
    
    status_id BIGINT REFERENCES status(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(host_id, payment_option_id)
);


CREATE TABLE invoice (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id BIGINT NOT NULL UNIQUE,

    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    status_id BIGINT REFERENCES status(id) NOT NULL, -- ej: 'PENDING', 'PAID', 'OVERDUE'

    start_billing_date TIMESTAMPTZ NOT NULL,
    closing_billing_date TIMESTAMPTZ NOT NULL,

    subtotal BIGINT NOT NULL,              -- subtotal en céntimos
    paid_commissions BIGINT DEFAULT 0,     -- comisiones pagadas en céntimos
    total BIGINT,                          -- total facturado en céntimos
    billing_total BIGINT NOT NULL,         -- lo que el host debe pagar a Guaybo en céntimos

    delayed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE invoice_breakdown (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,

    key VARCHAR(100) NOT NULL,     -- 'PLAN_PERCENTAGE_COMMISSION', 'PLAN_FIXED_COMMISSION'
    type VARCHAR(50) NOT NULL,     -- 'PERCENTAGE', 'FIXED'
    amount BIGINT NOT NULL,        -- valor definido en céntimos
    calculated_amount BIGINT,      -- valor aplicado al subtotal en céntimos
    order_index INT
);

CREATE TABLE invoice_item (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL, -- 'DISCOUNT', 'INTEREST'
    description VARCHAR(255),
    amount BIGINT NOT NULL         -- monto en céntimos
);


CREATE TABLE invoice_payment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,

    payment_method_id BIGINT NOT NULL REFERENCES payment_method(id) ON DELETE CASCADE,
    reference_code VARCHAR(100),
    receipt VARCHAR(1000),
    amount BIGINT NOT NULL,        -- monto en céntimos
    payment_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE booking (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id BIGINT NOT NULL UNIQUE,
    invoice_id BIGINT NOT NULL REFERENCES invoice(id) ON DELETE SET NULL,

 --  product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    host_id BIGINT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
    buyer_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL, -- buyer

    -- plan_id BIGINT REFERENCES product_plan(id) ON DELETE SET NULL,
    -- date_id BIGINT REFERENCES product_date(id) ON DELETE SET NULL,

    ticket_number VARCHAR(100),
    payment_mode VARCHAR(50),              -- 'UPFRONT', 'INSTALLMENTS'
    booking_status_id BIGINT REFERENCES status(id) ON DELETE SET NULL,   -- 'RECEIVED', 'CONFIRMED', 'CANCELLED'
    payment_status_id BIGINT REFERENCES status(id) ON DELETE SET NULL,            -- 'PENDING', 'CONFIRMED'
    payment_method_id BIGINT REFERENCES payment_method(id) ON DELETE SET NULL,
    timezone VARCHAR(100),

    -- total_attendees INT,
    is_test BOOLEAN DEFAULT FALSE,
    free_access BOOLEAN DEFAULT FALSE,

    -- App Fee directo
    app_fee_amount BIGINT,         -- comisión de app en céntimos
    app_fee_commission_payer VARCHAR(50), -- 'HOST' o 'CUSTOMER'

    -- Conversión (ejemplo: de USD a VES)
    conversion_currency VARCHAR(10),       -- 'VES'
    exchange_rate NUMERIC(18,6),           -- tasa de cambio
    amount_usd BIGINT,                     -- total en céntimos USD
    amount_converted BIGINT,               -- total convertido en céntimos (ej: en céntimos VES)

    -- Totales
    subtotal BIGINT,                       -- subtotal en céntimos
    total BIGINT,                          -- total en céntimos
    discounted_amount BIGINT,              -- monto descontado en céntimos
    remaining_amount BIGINT,               -- monto restante en céntimos
    total_installments INT,
    installments_interest_fee BIGINT,      -- comisión de cuotas en céntimos
    installments_program_applied BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE booking_item (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES product_plan(id) ON DELETE SET NULL,
    date_id BIGINT REFERENCES product_date(id) ON DELETE SET NULL,
    discount_id BIGINT REFERENCES discount(id) ON DELETE SET NULL,
    fare_type VARCHAR(50),           -- 'GENERAL', 'VIP', etc.
    price BIGINT NOT NULL,                 -- precio base en céntimos
    final_price BIGINT NOT NULL,           -- precio después de descuento en céntimos
    quantity INT NOT NULL,
    total_amount BIGINT NOT NULL           -- total en céntimos
);

CREATE TABLE booking_discount (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    discount_id BIGINT REFERENCES discount(id),
    amount BIGINT NOT NULL                 -- monto en céntimos
);

CREATE TABLE attendee (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE payment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    booking_id BIGINT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,

    amount BIGINT NOT NULL,                -- monto en céntimos
    payment_option_id BIGINT NOT NULL REFERENCES payment_option(id) ON DELETE CASCADE,
   
    payment_date TIMESTAMPTZ DEFAULT now(),
    payment_receipt VARCHAR(1000),  
    payment_status_id BIGINT REFERENCES status(id) ON DELETE CASCADE,
    reference_code VARCHAR(100),

    exchange_rate NUMERIC(18,6),           -- tasa de cambio
    amount_converted BIGINT,               -- total convertido en céntimos (ej: en céntimos VES)

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE installment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    booking_id BIGINT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    
    installment_number INT NOT NULL,
    amount BIGINT NOT NULL,                -- monto en céntimos
    due_date TIMESTAMPTZ NOT NULL,
    payment_id BIGINT REFERENCES payment(id) ON DELETE SET NULL,
    payment_status_id BIGINT REFERENCES status(id) ON DELETE SET NULL, -- 'PENDING', 'PAID'

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE referral_code (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    referrer_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE, -- el que invita
    code VARCHAR(50) NOT NULL UNIQUE,  -- el código de referido

    referral_rate DECIMAL(5,2) NOT NULL CHECK (referral_rate >= 1 AND referral_rate <= 100), -- % comisión
    duration_days INT,     -- duración de la relación (ej: 90 días)
    cap_minor BIGINT,                      -- límite máximo de comisiones acumuladas en céntimos
    window_days INT,       -- tiempo en días en que se puede activar la comisión

    status_id BIGINT REFERENCES status(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referral_association (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    referrer_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE, -- el que invita
    referred_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE, -- el que es referido

    utm_source VARCHAR(255),
    referral_code_id BIGINT REFERENCES referral_code(id),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE temporal_token (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,

    token_type VARCHAR(50) NOT NULL,        -- 'COMPLETE_REGISTRATION', 'LOGIN_REDIRECT', 'PASSWORD_RESET'
    redirect_url VARCHAR(1000),

    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE confirmation_code (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,               -- código corto (ej: 6 dígitos o string aleatorio)
    code_type VARCHAR(50) NOT NULL,          -- 'EMAIL_VERIFICATION', 'LOGIN', 'TWO_FACTOR', etc.
    status_id BIGINT REFERENCES status(id) NOT NULL,        -- 'ACTIVE', 'USED', 'EXPIRED'

    ttl INT NOT NULL,          
    redirect_type VARCHAR(50),   --     ADMIN_REDIRECT or CLIENT_REDIRECT     
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);



CREATE TABLE product_resource (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES product_resource(id) ON DELETE CASCADE, -- para jerarquía (secciones → lecciones → recursos)

    type VARCHAR(50) NOT NULL,         -- 'SECTION', 'RESOURCE', 'QUIZ', 'SURVEY'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,

    multimedia_id BIGINT REFERENCES multimedia(id) ON DELETE SET NULL,
    thumbnail_id BIGINT REFERENCES multimedia(id) ON DELETE SET NULL,

    file_id VARCHAR(255),              -- id en storage externo
    processing_status_id BIGINT REFERENCES status(id),     -- 'TRANSCODING', 'READY'
    encode_progress INT CHECK (encode_progress >= 0 AND encode_progress <= 100),
    size DECIMAL(10,2),                -- MB
    duration DECIMAL(10,2),                         -- minutos

    preview BOOLEAN DEFAULT FALSE,
    downloadable BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    total_views INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id)
);


CREATE TABLE question (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    product_resource_id BIGINT NOT NULL REFERENCES product_resource(id) ON DELETE CASCADE,

    text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,   -- 'MULTIPLE_CHOICE_SINGLE', 'MULTIPLE_CHOICE_MULTIPLE', 'TRUE_FALSE', 'OPEN_TEXT', 'RATING'
    order_index INT NOT NULL,

    explanation TEXT,          -- explicación de la respuesta correcta (opcional)
    rating_scale INT,          -- escala para rating (ej: 1-5)
    min_rating_label VARCHAR(255),
    max_rating_label VARCHAR(255),
    is_required BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id)
);


CREATE TABLE answer_option (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    question_id BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE,

    text TEXT NOT NULL,
    order_index INT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status_id BIGINT REFERENCES status(id)
);


CREATE TABLE user_answer (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    question_id BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,

    -- tipos de respuestas posibles
    answer_text TEXT, 
    rating_value INT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(question_id, user_id)
);

CREATE TABLE user_answer_option (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_answer_id BIGINT NOT NULL REFERENCES user_answer(id) ON DELETE CASCADE,
    answer_option_id BIGINT NOT NULL REFERENCES answer_option(id) ON DELETE CASCADE,
    UNIQUE(user_answer_id, answer_option_id)
);


CREATE TABLE kyc_session (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,

    session_id UUID NOT NULL,               -- ID de sesión en el proveedor externo
    session_number INT NOT NULL,            -- número secuencial de la sesión
    session_token VARCHAR(255) NOT NULL,    -- token de sesión del proveedor
    vendor_data VARCHAR(255),               -- datos específicos del vendor

    metadata JSONB,                         -- datos adicionales dinámicos (userType, accountId, etc.)
    status_id BIGINT REFERENCES status(id) NOT NULL,            -- 'NOT_STARTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED'
    workflow_id UUID NOT NULL,              -- ID de flujo del proveedor

    callback_url VARCHAR(1000) NOT NULL,    -- callback a tu sistema
    verification_url VARCHAR(1000) NOT NULL,-- URL para redirigir al usuario al vendor KYC

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE kyc_identity (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
 
    -- Persona natural / jurídica
    person_type VARCHAR(50) NOT NULL DEFAULT 'NATURAL', 
    -- NATURAL, LEGAL_ENTITY (empresa), COMPANY, etc.

    -- Datos básicos
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(500),
    gender VARCHAR(20),
    age INT,
    date_of_birth DATE,
    marital_status VARCHAR(50),
    nationality VARCHAR(100),
    place_of_birth VARCHAR(255),

    -- Documento
    document_number VARCHAR(100) NOT NULL,
    document_type VARCHAR(100),      -- cédula, pasaporte, rif, etc.
    issuing_state VARCHAR(10),       -- ej: VEN
    issuing_state_name VARCHAR(255), -- ej: Venezuela
    date_of_issue DATE,
    expiration_date DATE,

    -- Archivos multimedia asociados
    portrait_image TEXT,       -- selfie o retrato
    front_image TEXT,
    back_image TEXT,
    front_video TEXT,
    back_video TEXT,
    full_front_image TEXT,
    full_back_image TEXT,

    -- Dirección
    address TEXT,
    formatted_address TEXT,
    parsed_address TEXT,

    -- Extra
    extra_fields JSONB,  -- valores dinámicos
    extra_files JSONB,   -- links u objetos

    -- Estado
    session_id UUID,     -- vinculado a sesión de KYC
    status_id BIGINT REFERENCES status(id) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);



-- ================================================
-- Tabla de notificaciones bancarias (Pago Móvil)
-- ================================================
CREATE TABLE bank_notification (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    -- Identificador interno
    identifier VARCHAR(255) NOT NULL,

    -- Fuente de la notificación (ej: 'MB_NOTIFICA')
    source VARCHAR(50) NOT NULL,
    currency_id BIGINT NOT NULL REFERENCES currency(id),   -- 'USD', 'VES', etc.

    -- Datos específicos de MBNotifica
    merchant_id VARCHAR(20) NOT NULL,         -- Cédula o RIF del comercio
    merchant_phone VARCHAR(15) NOT NULL,      -- Teléfono del comercio
    issuer_phone VARCHAR(15) NOT NULL,        -- Teléfono emisor
    description VARCHAR(100),                 -- Motivo del pago (opcional)
    issuing_bank VARCHAR(10) NOT NULL,        -- Código banco emisor
    amount BIGINT NOT NULL,                    -- Monto del pago en céntimos
    timestamp TIMESTAMPTZ NOT NULL,           -- Fecha/hora ISO
    reference VARCHAR(50) NOT NULL,           -- Referencia interbancaria
    network_code VARCHAR(2) NOT NULL,         -- Código red (2 caracteres)

    -- Payload original (auditoría)
    original_payload JSONB NOT NULL,

    -- Estado y trazabilidad
    status_id BIGINT REFERENCES status(id),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE transaction (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    record_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    -- Relación con booking/pago
    booking_id BIGINT REFERENCES booking(id) ON DELETE SET NULL,
    payment_id BIGINT REFERENCES payment(id) ON DELETE SET NULL,

    -- Origen/destino del dinero
    host_id BIGINT REFERENCES host(id),     -- si aplica

    -- Monto principal
    amount BIGINT NOT NULL,                -- USD en céntimos
    exchange_rate NUMERIC(18,6) NOT NULL,  -- tasa de cambio
    amount_converted BIGINT NOT NULL,      -- VES en céntimos

    -- Clasificación de la transacción
    type_id BIGINT NOT NULL REFERENCES transaction_type(id) ON DELETE RESTRICT,    -- 'SALE', 'COMMISSION', 'AFFILIATE_COMMISSION', 'WITHDRAWAL', 'FEE'
    direction VARCHAR(10) NOT NULL,         -- 'IN' (entrada), 'OUT' (salida)

    -- Estado
    status_id BIGINT REFERENCES status(id) NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'

    -- Conciliación bancaria
    reference VARCHAR(100),                 -- referencia bancaria (ej: pago móvil, zelle, etc.)
    bank_notification_id BIGINT REFERENCES bank_notification(id) ON DELETE SET NULL,

    -- Metadata
    description VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE transaction_split (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transaction(id) ON DELETE CASCADE,

    -- Beneficiario
    beneficiary_type VARCHAR(50) NOT NULL,   -- 'HOST', 'CO_PRODUCER', 'AFFILIATE', 'GUAYBO', 'BANK'
    beneficiary_id BIGINT,                   -- si aplica (ej: host_id, user_id)
    
    -- Valores del split
    amount BIGINT NOT NULL,                -- monto en céntimos
    exchange_rate NUMERIC(18,6) NOT NULL,  -- tasa de cambio
    amount_converted BIGINT NOT NULL,      -- monto convertido en céntimos
    share DECIMAL(5,2),                 -- si aplica, ej: 7.90%
    
    -- Estado del split
    status_id BIGINT REFERENCES status(id) NOT NULL,   -- 'PENDING', 'PAID', 'FAILED'

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Índices comunes
CREATE INDEX idx_user_record_id ON app_user(record_id);
CREATE INDEX idx_user_email ON app_user(email);

CREATE INDEX idx_host_record_id ON host(record_id);
CREATE INDEX idx_host_alias ON host(alias);

CREATE INDEX idx_product_record_id ON product(record_id);
CREATE INDEX idx_product_alias ON product(alias);
CREATE INDEX idx_booking_record_id ON booking(record_id);
CREATE INDEX idx_transaction_record_id ON transaction(record_id);
CREATE INDEX idx_bank_notification_record_id ON bank_notification(record_id);

-- ================================================
-- ENABLE ROW LEVEL SECURITY para todas las tablas
-- ================================================

ALTER TABLE public.status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_platform ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_direction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_resource_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_method ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_billing_discount ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_discount ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonial_multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_post_booking_step ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_installment_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_producer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_weekly_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_payment_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_discount ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_association ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporal_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmation_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answer_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_split ENABLE ROW LEVEL SECURITY;
