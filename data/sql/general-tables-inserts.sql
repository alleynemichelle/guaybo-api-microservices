-- ================================================
-- INSERTS PARA TABLAS GENERALES
-- Basado en los enums y datos de ejemplo proporcionados
-- ================================================

-- ================================================
-- CURRENCY
-- ================================================
INSERT INTO currency (code, symbol, created_at, updated_at) VALUES
('USD', '$', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VES', 'Bs.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================
-- ROLE
-- ================================================
-- Basado en el enum Role y roles mencionados (OWNER, ADMIN, EDITOR, VIEWER)
INSERT INTO role (name, description, created_at, updated_at) VALUES
('OWNER', 'Owner with full administrative privileges', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ADMIN', 'Administrator with management privileges', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EDITOR', 'Editor with content creation and modification privileges', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEWER', 'Viewer with read-only access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('GUEST', 'Guest user with limited access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================
-- PAYMENT_METHOD
-- ================================================
-- Basado en PaymentMethod enum y payment-methods.constant.ts
-- Primero necesitamos obtener los IDs de las monedas
WITH currency_ids AS (
    SELECT id as usd_id FROM currency WHERE code = 'USD'
), currency_ids_ves AS (
    SELECT id as ves_id FROM currency WHERE code = 'VES'
)
INSERT INTO payment_method (key, icon, requires_coordination, automatic, currency_id, created_at, updated_at, status_id) 
SELECT 
    pm.key,
    pm.icon,
    pm.requires_coordination,
    pm.automatic,
    CASE 
        WHEN pm.currency = 'USD' THEN (SELECT usd_id FROM currency_ids)
        WHEN pm.currency = 'VES' THEN (SELECT ves_id FROM currency_ids_ves)
    END as currency_id,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL') as status_id
FROM (VALUES
    ('MOBILE_PAYMENT', 'phone', false, false, 'VES'),
    ('CASH', 'cash', true, false, 'USD'),
    ('ZELLE', 'zelle', false, false, 'USD'),
    ('BINANCE', 'binance', false, false, 'USD'),
    ('PAYPAL', 'paypal', false, false, 'USD'),
    ('ZINLI', 'zinli', false, false, 'USD'),
    ('AUTOMATIC_MOBILE_PAYMENT', 'mobile', false, true, 'VES')
) AS pm(key, icon, requires_coordination, automatic, currency);

-- ================================================
-- BILLING_PLAN
-- ================================================
-- Basado en el ejemplo de BASIC plan proporcionado
INSERT INTO billing_plan (record_id, key, description, features, created_at, updated_at, status_id) VALUES
(
    'd1221a11-307b-4c1b-b5a5-72d1bed61f0a',
    'BASIC',
    'Plan básico con comisión porcentual y fija por reserva',
    '["7.9% de comisión por reserva", "$0.44 fijos por reserva"]'::jsonb,
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-01-01T10:00:00Z'::timestamptz,
    (SELECT id FROM status WHERE name = 'ACTIVE')
);

-- ================================================
-- PLAN_BREAKDOWN
-- ================================================
-- Basado en el breakdown del plan BASIC
INSERT INTO plan_breakdown (billing_plan_id, key, type, amount) VALUES
(
    (SELECT id FROM billing_plan WHERE key = 'BASIC'),
    'PLAN_PERCENTAGE_COMMISSION',
    'PERCENTAGE',
    7.90
),
(
    (SELECT id FROM billing_plan WHERE key = 'BASIC'),
    'PLAN_FIXED_COMMISSION',
    'FIXED',
    0.44
);

-- ================================================
-- DISCOUNT
-- ================================================
-- Basado en los ejemplos de cupones proporcionados
INSERT INTO discount (
    record_id,
    owner_type,
    name, 
    description, 
    amount, 
    type, 
    scope, 
    status_id, 
    valid_from, 
    valid_until, 
    code, 
    duration_quantity, 
    duration_unit, 
    created_at, 
    updated_at
) VALUES
-- GUAYABITO2025
(
     500012392,
    'APP',
    'GUAYABITO2025',
    '25% de descuento en comisiones por el primer mes',
    2500,
    'PERCENTAGE',
    'TOTAL',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'DISCOUNT'),
    '2025-03-15T10:30:00.000Z'::timestamptz,
    '2025-04-15T10:30:00.000Z'::timestamptz,
    'GUAYABITO2025',
    1,
    'MM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- GUAYABITOSTOP
(
     500012393,
    'APP',
    'GUAYABITOSTOP',
    '80% de descuento en comisiones por ser embajador de Guaybo',
    8000,
    'PERCENTAGE',
    'TOTAL',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'DISCOUNT'),
    NULL, -- no tiene validFrom
    NULL, -- no tiene validUntil
    'GUAYABITOSTOP',
    2,
    'MM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- QUIEROVENDER
(
     500012394,
    'APP',
    'QUIEROVENDER',
    '50% de descuento en comisiones por el primer mes',
    5000,
    'PERCENTAGE',
    'TOTAL',
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'DISCOUNT'),
    '2025-06-01T10:30:00.000Z'::timestamptz,
    '2025-09-10T10:30:00.000Z'::timestamptz,
    'QUIEROVENDER',
    1,
    'MM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ================================================
-- PAYMENT_OPTION
-- ================================================
INSERT INTO payment_option (record_id, owner_type, user_id, payment_method_id, custom_attributes, status_id, created_at, updated_at) VALUES
(
    '28d23974-191e-4c1f-9455-05c7fa2576fd',
    'APP',
    NULL,
    (SELECT id FROM payment_method WHERE key = 'MOBILE_PAYMENT'),
    '{
      "bank": {
        "key": "BANCAMIGA",
        "name": "(0172) BANCAMIGA BANCO UNIVERSAL, C.A."
      },
      "nationalId": "V26473481",
      "phoneNumber": {
        "code": "58",
        "number": "4241702939"
      }
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-02-08 01:41:36.256+00',
    '2025-02-08 01:41:36.257+00'
),
(
    'a18ba64c-a810-48fd-adaa-e84591c78a4e',
    'APP',
    NULL,
    (SELECT id FROM payment_method WHERE key = 'CASH'),
    '{
      "description": "Te contactará el equipo interno de Guaybo para concretar el pago."
    }'::jsonb,
    (SELECT id FROM status WHERE name = 'ACTIVE' AND entity_type = 'GENERAL'),
    '2025-02-14 19:46:53.997+00',
    '2025-02-14 19:46:53.997+00'
);

-- ================================================
-- VERIFICACIÓN DE INSERTS
-- ================================================

-- Verificar que se insertaron correctamente
SELECT 'currency' as table_name, COUNT(*) as total_records FROM currency
UNION ALL
SELECT 'role' as table_name, COUNT(*) as total_records FROM role
UNION ALL
SELECT 'payment_method' as table_name, COUNT(*) as total_records FROM payment_method
UNION ALL
SELECT 'billing_plan' as table_name, COUNT(*) as total_records FROM billing_plan
UNION ALL
SELECT 'plan_breakdown' as table_name, COUNT(*) as total_records FROM plan_breakdown
UNION ALL
SELECT 'discount' as table_name, COUNT(*) as total_records FROM discount
UNION ALL
SELECT 'payment_option' as table_name, COUNT(*) as total_records FROM payment_option
ORDER BY table_name;

-- Verificar datos específicos
SELECT 'Currency details:' as info;
SELECT code, symbol FROM currency ORDER BY code;

SELECT 'Payment methods with currency:' as info;
SELECT pm.key, pm.icon, pm.requires_coordination, pm.automatic, c.code as currency
FROM payment_method pm
JOIN currency c ON pm.currency_id = c.id
ORDER BY pm.key;

SELECT 'Billing plan with breakdown:' as info;
SELECT bp.key, bp.description, pb.key as breakdown_key, pb.type, pb.amount
FROM billing_plan bp
JOIN plan_breakdown pb ON bp.id = pb.billing_plan_id
ORDER BY bp.key, pb.id;

SELECT 'Discounts:' as info;
SELECT code, amount, type, scope, valid_from, valid_until, duration
FROM discount
ORDER BY code;

SELECT 'Payment options:' as info;
SELECT po.record_id, po.owner_type, pm.key as payment_method
FROM payment_option po
JOIN payment_method pm ON po.payment_method_id = pm.id
ORDER BY po.id;