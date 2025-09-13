-- ================================================
-- VERIFICACIÓN COMPLETA: Host Yaquelín Moreno
-- ================================================

-- ================================================
-- 1. USUARIO BASE
-- ================================================
SELECT '=== 1. USUARIO BASE ===' as section;
SELECT 
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
    is_host,
    is_referrer,
    created_at,
    updated_at
FROM app_user 
WHERE record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9';

-- ================================================
-- 2. HOST PRINCIPAL
-- ================================================
SELECT '=== 2. HOST PRINCIPAL ===' as section;
SELECT 
    h.record_id,
    h.name,
    h.alias,
    h.email,
    h.collection_id,
    h.description,
    h.phone_code,
    h.phone_number,
    h.timezone,
    h.verified,
    h.rating,
    h.reviews,
    h.years_experience,
    h.key_features,
    bp.key as billing_plan,
    h.commission_payer,
    s1.name as status,
    s2.name as verification_status,
    h.created_at,
    h.updated_at
FROM host h
LEFT JOIN billing_plan bp ON h.billing_plan_id = bp.id
LEFT JOIN status s1 ON h.status_id = s1.id
LEFT JOIN status s2 ON h.verification_status_id = s2.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 3. RELACIÓN HOST-USUARIO
-- ================================================
SELECT '=== 3. RELACIÓN HOST-USUARIO ===' as section;
SELECT 
    h.name as host_name,
    h.record_id as host_record_id,
    u.full_name as user_name,
    u.record_id as user_record_id,
    r.name as role_name,
    s.name as status,
    hu.created_at,
    hu.updated_at
FROM host_user hu
JOIN host h ON hu.host_id = h.id
JOIN app_user u ON hu.user_id = u.id
JOIN role r ON hu.role_id = r.id
JOIN status s ON hu.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 4. DESCUENTOS DE FACTURACIÓN DEL HOST
-- ================================================
SELECT '=== 4. DESCUENTOS DE FACTURACIÓN DEL HOST ===' as section;
SELECT 
    h.name as host_name,
    d.code as discount_code,
    d.name as discount_name,
    d.amount as amount_cents,
    (d.amount / 100.0) as amount_percentage,
    d.type as discount_type,
    d.scope,
    s.name as status,
    hbd.valid_from,
    hbd.valid_until,
    hbd.created_at,
    hbd.updated_at
FROM host_billing_discount hbd
JOIN host h ON hbd.host_id = h.id
JOIN discount d ON hbd.discount_id = d.id
JOIN status s ON hbd.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 4a. REDES SOCIALES DEL HOST (Normalizadas)
-- ================================================
SELECT '=== 4a. REDES SOCIALES DEL HOST (Normalizadas) ===' as section;
SELECT 
    h.name as host_name,
    hsm.platform,
    hsm.username,
    s.name as status,
    hsm.created_at,
    hsm.updated_at
FROM host_social_media hsm
JOIN host h ON hsm.host_id = h.id
JOIN status s ON hsm.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 4b. ANALYTICS DEL HOST (Pixels y Trackers)
-- ================================================
SELECT '=== 4b. ANALYTICS DEL HOST (Pixels y Trackers) ===' as section;
SELECT 
    h.name as host_name,
    ha.provider,
    ha.tracker_id,
    ha.tracker_name,
    ha.configuration,
    s.name as status,
    ha.created_at,
    ha.updated_at
FROM host_analytics ha
JOIN host h ON ha.host_id = h.id
JOIN status s ON ha.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY ha.provider, ha.tracker_name;

-- ================================================
-- 5. MULTIMEDIA DEL HOST (Logo)
-- ================================================
SELECT '=== 5. MULTIMEDIA DEL HOST (Logo) ===' as section;
SELECT 
    m.record_id,
    m.type,
    m.source,
    m.filename,
    m.path,
    m.description,
    m.usage_type,
    m.order_index,
    s.name as status,
    m.created_at,
    m.updated_at
FROM multimedia m
JOIN host h ON m.host_id = h.id
JOIN status s ON m.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
  AND m.usage_type = 'profile';

-- ================================================
-- 6. MÉTODOS DE PAGO DEL USUARIO/HOST
-- ================================================
SELECT '=== 6. MÉTODOS DE PAGO DEL USUARIO/HOST ===' as section;
SELECT 
    u.full_name as user_name,
    po.record_id as payment_option_id,
    pm.key as payment_method_key,
    c.code as currency_code,
    po.custom_attributes,
    s.name as status,
    po.created_at,
    po.updated_at
FROM payment_option po
JOIN app_user u ON po.user_id = u.id
JOIN payment_method pm ON po.payment_method_id = pm.id
JOIN currency c ON pm.currency_id = c.id
JOIN status s ON po.status_id = s.id
WHERE u.record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'
ORDER BY pm.key;

-- ================================================
-- 7. CÓDIGO DE REFERIDO
-- ================================================
SELECT '=== 7. CÓDIGO DE REFERIDO ===' as section;
SELECT 
    u.full_name as referrer_name,
    rc.record_id,
    rc.code,
    rc.referral_rate,
    rc.duration_days,
    rc.window_days,
    s.name as status,
    rc.created_at,
    rc.updated_at
FROM referral_code rc
JOIN app_user u ON rc.referrer_id = u.id
JOIN status s ON rc.status_id = s.id
WHERE rc.code = 'MICHE2025';

-- ================================================
-- 8. PRODUCTOS DEL HOST
-- ================================================
SELECT '=== 8. PRODUCTOS DEL HOST ===' as section;
SELECT 
    p.record_id,
    p.name,
    p.alias,
    p.description,
    pt.key as product_type_key,
    s.name as status,
    p.is_free,
    p.timezone,
    p.total_resources,
    p.total_duration,
    p.total_size,
    p.total_sections,
    p.template,
    p.created_at,
    p.updated_at
FROM product p
JOIN host h ON p.host_id = h.id
JOIN product_type pt ON p.product_type = pt.id
JOIN status s ON p.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 9. PLANES Y PRECIOS DE PRODUCTOS
-- ================================================
SELECT '=== 9. PLANES Y PRECIOS DE PRODUCTOS ===' as section;
SELECT 
    p.name as product_name,
    pp.record_id as plan_record_id,
    pp.name as plan_name,
    pp.description as plan_description,
    pp.order_index,
    pp.min_capacity,
    pp.max_capacity,
    pr.amount as amount_cents,
    (pr.amount / 100.0) as amount_dollars,
    c.code as currency_code,
    pr.fare_type,
    pr.pricing_model,
    pp.created_at as plan_created_at,
    pr.created_at as price_created_at
FROM product_plan pp
JOIN product p ON pp.product_id = p.id
JOIN host h ON p.host_id = h.id
LEFT JOIN product_price pr ON pp.id = pr.product_plan_id
LEFT JOIN currency c ON pr.currency_id = c.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY p.name, pp.order_index;

-- ================================================
-- 10. CONFIGURACIONES DE RESERVA DE PRODUCTOS
-- ================================================
SELECT '=== 10. CONFIGURACIONES DE RESERVA DE PRODUCTOS ===' as section;
SELECT 
    p.name as product_name,
    pbs.record_id,
    pbs.booking_flow,
    s.name as default_payment_status,
    pbs.required_data,
    pbs.created_at,
    pbs.updated_at
FROM product_booking_settings pbs
JOIN product p ON pbs.product_id = p.id
JOIN host h ON p.host_id = h.id
LEFT JOIN status s ON pbs.default_payment_status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 11. MONEDAS DE PRODUCTOS
-- ================================================
SELECT '=== 11. MONEDAS DE PRODUCTOS ===' as section;
SELECT 
    p.name as product_name,
    c.code as currency_code,
    c.symbol as currency_symbol,
    pc.is_default,
    s.name as status,
    pc.created_at,
    pc.updated_at
FROM product_currency pc
JOIN product p ON pc.product_id = p.id
JOIN host h ON p.host_id = h.id
JOIN currency c ON pc.currency_id = c.id
JOIN status s ON pc.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY p.name, pc.is_default DESC;

-- ================================================
-- 12. PROGRAMAS DE CUOTAS DE PRODUCTOS
-- ================================================
SELECT '=== 12. PROGRAMAS DE CUOTAS DE PRODUCTOS ===' as section;
SELECT 
    p.name as product_name,
    pip.record_id,
    pip.installments_count,
    pip.frequency,
    pip.interest_fee_amount as interest_fee_cents,
    (pip.interest_fee_amount / 100.0) as interest_fee_dollars,
    pip.interest_fee_type,
    pip.conditions,
    s.name as status,
    pip.created_at,
    pip.updated_at
FROM product_installment_program pip
JOIN product p ON pip.product_id = p.id
JOIN host h ON p.host_id = h.id
JOIN status s ON pip.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- 13. DESCUENTOS DE PRODUCTOS
-- ================================================
SELECT '=== 13. DESCUENTOS DE PRODUCTOS ===' as section;
SELECT 
    p.name as product_name,
    d.record_id as discount_record_id,
    d.name as discount_name,
    d.code as discount_code,
    d.amount as amount_cents,
    (d.amount / 100.0) as amount_percentage,
    d.type as discount_type,
    d.scope,
    pd.type as product_discount_type,
    d.max_capacity,
    d.conditions,
    s1.name as discount_status,
    s2.name as product_discount_status,
    d.created_at as discount_created_at,
    pd.created_at as product_discount_created_at
FROM product_discount pd
JOIN product p ON pd.product_id = p.id
JOIN host h ON p.host_id = h.id
JOIN discount d ON pd.discount_id = d.id
LEFT JOIN status s1 ON d.status_id = s1.id
LEFT JOIN status s2 ON pd.status_id = s2.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY p.name, d.name;

-- ================================================
-- 14. PASOS POST-RESERVA DE PRODUCTOS
-- ================================================
SELECT '=== 14. PASOS POST-RESERVA DE PRODUCTOS ===' as section;
SELECT 
    p.name as product_name,
    ppbs.record_id,
    ppbs.type,
    ppbs.title,
    ppbs.description,
    ppbs.conditions,
    ppbs.is_mandatory,
    ppbs.custom_attributes,
    ppbs.order_index,
    ppbs.created_at,
    ppbs.updated_at
FROM product_post_booking_step ppbs
JOIN product p ON ppbs.product_id = p.id
JOIN host h ON p.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY p.name, ppbs.order_index;

-- ================================================
-- 15. MULTIMEDIA DE PRODUCTOS (Galería)
-- ================================================
SELECT '=== 15. MULTIMEDIA DE PRODUCTOS (Galería) ===' as section;
SELECT 
    p.name as product_name,
    m.record_id as multimedia_record_id,
    m.type,
    m.source,
    m.filename,
    m.path,
    m.description,
    m.usage_type,
    pm.order_index as product_multimedia_order,
    pm.usage_type as product_multimedia_usage,
    s.name as status,
    m.created_at,
    m.updated_at
FROM product_multimedia pm
JOIN product p ON pm.product_id = p.id
JOIN host h ON p.host_id = h.id
JOIN multimedia m ON pm.multimedia_id = m.id
JOIN status s ON m.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY p.name, pm.order_index;

-- ================================================
-- 16. RECURSOS DE PRODUCTOS (Secciones y Recursos)
-- ================================================
SELECT '=== 16. RECURSOS DE PRODUCTOS (Secciones y Recursos) ===' as section;
SELECT 
    p.name as product_name,
    pr.record_id,
    pr.type,
    pr.title,
    pr.description,
    pr.long_description,
    pr.order_index,
    pr.preview,
    pr.size,
    pr.duration,
    CASE 
        WHEN pr.parent_id IS NOT NULL THEN parent_pr.title 
        ELSE 'Sin padre (Raíz)'
    END as parent_section,
    pr.file_id,
    pr.encode_progress,
    ps.name as processing_status,
    s.name as status,
    -- Información del multimedia principal
    m.filename as multimedia_filename,
    m.path as multimedia_url,
    m.source as multimedia_source,
    m.type as multimedia_type,
    -- Información del thumbnail
    t.filename as thumbnail_filename,
    t.path as thumbnail_url,
    pr.created_at,
    pr.updated_at
FROM product_resource pr
JOIN product p ON pr.product_id = p.id
JOIN host h ON p.host_id = h.id
LEFT JOIN product_resource parent_pr ON pr.parent_id = parent_pr.id
LEFT JOIN multimedia m ON pr.multimedia_id = m.id
LEFT JOIN multimedia t ON pr.thumbnail_id = t.id
LEFT JOIN status ps ON pr.processing_status_id = ps.id
LEFT JOIN status s ON pr.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
ORDER BY p.name, pr.order_index;

-- ================================================
-- 17. JERARQUÍA DE RECURSOS (Vista en árbol)
-- ================================================
SELECT '=== 17. JERARQUÍA DE RECURSOS (Vista en árbol) ===' as section;
WITH RECURSIVE resource_hierarchy AS (
    -- Secciones principales (sin padre)
    SELECT 
        pr.id,
        pr.record_id,
        pr.type,
        pr.title,
        pr.order_index,
        0 as level,
        CAST(pr.title AS TEXT) as hierarchy_path,
        p.name as product_name
    FROM product_resource pr
    JOIN product p ON pr.product_id = p.id
    JOIN host h ON p.host_id = h.id
    WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
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
        CAST(rh.hierarchy_path || ' > ' || pr.title AS TEXT),
        rh.product_name
    FROM product_resource pr
    JOIN resource_hierarchy rh ON pr.parent_id = rh.id
)
SELECT 
    product_name,
    REPEAT('  ', level) || title as indented_title,
    type,
    order_index,
    record_id,
    level
FROM resource_hierarchy
ORDER BY product_name, hierarchy_path, order_index;

-- ================================================
-- 18. MULTIMEDIA DE RECURSOS (Archivos y Thumbnails)
-- ================================================
SELECT '=== 18. MULTIMEDIA DE RECURSOS (Archivos y Thumbnails) ===' as section;
SELECT 
    p.name as product_name,
    pr.title as resource_title,
    pr.type as resource_type,
    m.record_id as multimedia_record_id,
    m.type as multimedia_type,
    m.source,
    m.filename,
    m.path,
    m.description,
    m.usage_type,
    m.order_index,
    s.name as status,
    CASE 
        WHEN pr.multimedia_id = m.id THEN 'Principal'
        WHEN pr.thumbnail_id = m.id THEN 'Thumbnail'
        ELSE 'Otro'
    END as relationship_type,
    m.created_at,
    m.updated_at
FROM multimedia m
JOIN host h ON m.host_id = h.id
LEFT JOIN product_resource pr ON (pr.multimedia_id = m.id OR pr.thumbnail_id = m.id)
LEFT JOIN product p ON pr.product_id = p.id
LEFT JOIN status s ON m.status_id = s.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'
  AND m.usage_type IN ('resource', 'thumbnail')
ORDER BY p.name, pr.title, relationship_type;

-- ================================================
-- 19. RESUMEN ESTADÍSTICO DEL HOST
-- ================================================
SELECT '=== 19. RESUMEN ESTADÍSTICO DEL HOST ===' as section;
SELECT 
    'Total Productos' as metric,
    COUNT(*) as value
FROM product p
JOIN host h ON p.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'

UNION ALL

SELECT 
    'Total Planes de Producto' as metric,
    COUNT(*) as value
FROM product_plan pp
JOIN product p ON pp.product_id = p.id
JOIN host h ON p.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'

UNION ALL

SELECT 
    'Total Recursos' as metric,
    COUNT(*) as value
FROM product_resource pr
JOIN product p ON pr.product_id = p.id
JOIN host h ON p.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'

UNION ALL

SELECT 
    'Total Multimedia' as metric,
    COUNT(*) as value
FROM multimedia m
JOIN host h ON m.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'

UNION ALL

SELECT 
    'Total Métodos de Pago' as metric,
    COUNT(*) as value
FROM payment_option po
JOIN app_user u ON po.user_id = u.id
WHERE u.record_id = '8402b9fb-2de7-4ea4-a795-535cc5070bc9'

UNION ALL

SELECT 
    'Total Descuentos de Producto' as metric,
    COUNT(*) as value
FROM product_discount pd
JOIN product p ON pd.product_id = p.id
JOIN host h ON p.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'

UNION ALL

SELECT 
    'Total Redes Sociales' as metric,
    COUNT(*) as value
FROM host_social_media hsm
JOIN host h ON hsm.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a'

UNION ALL

SELECT 
    'Total Analytics/Trackers' as metric,
    COUNT(*) as value
FROM host_analytics ha
JOIN host h ON ha.host_id = h.id
WHERE h.record_id = '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a';

-- ================================================
-- FIN DE VERIFICACIÓN
-- ================================================
SELECT '=== VERIFICACIÓN COMPLETA FINALIZADA ===' as final_message;