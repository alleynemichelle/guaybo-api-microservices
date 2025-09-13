-- ================================================
-- DROP ALL TABLES - Eliminar todas las tablas de la base de datos
-- IMPORTANTE: Este script elimina TODOS los datos permanentemente
-- ================================================

-- Deshabilitar Row Level Security antes de eliminar
ALTER TABLE IF EXISTS public.status DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_type DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.availability_type DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meeting_platform DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_type DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_direction DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.beneficiary_type DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_resource_type DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.question_type DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.currency DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_method DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discount DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.billing_plan DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_breakdown DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.host DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.multimedia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.host_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.host_social_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.host_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.host_billing_discount DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_date DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_plan DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_price DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_discount DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faq DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonial DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonial_multimedia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_multimedia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_booking_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_currency DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_post_booking_step DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_installment_program DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.co_producer DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_weekly_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_option DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_breakdown DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_payment DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_discount DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendee DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.installment DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_code DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_association DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.temporal_token DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.confirmation_code DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_resource DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.question DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.answer_option DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_answer DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_answer_option DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_session DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_identity DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bank_notification DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_split DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer DISABLE ROW LEVEL SECURITY;

-- ================================================
-- DROP TABLES en orden de dependencias (de hijas a padres)
-- ================================================

-- Tablas más dependientes primero
DROP TABLE IF EXISTS transaction_split CASCADE;
DROP TABLE IF EXISTS user_answer_option CASCADE;
DROP TABLE IF EXISTS user_answer CASCADE;
DROP TABLE IF EXISTS answer_option CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- Tablas de transacciones y pagos
DROP TABLE IF EXISTS transaction CASCADE;
DROP TABLE IF EXISTS bank_notification CASCADE;
DROP TABLE IF EXISTS installment CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS booking_discount CASCADE;
DROP TABLE IF EXISTS booking_item CASCADE;
DROP TABLE IF EXISTS attendee CASCADE;
DROP TABLE IF EXISTS booking CASCADE;
DROP TABLE IF EXISTS invoice_payment CASCADE;
DROP TABLE IF EXISTS invoice_item CASCADE;
DROP TABLE IF EXISTS invoice_breakdown CASCADE;
DROP TABLE IF EXISTS invoice CASCADE;

-- Tablas de productos y recursos
DROP TABLE IF EXISTS product_resource CASCADE;
DROP TABLE IF EXISTS product_multimedia CASCADE;
DROP TABLE IF EXISTS testimonial_multimedia CASCADE;
DROP TABLE IF EXISTS testimonial CASCADE;
DROP TABLE IF EXISTS faq CASCADE;
DROP TABLE IF EXISTS product_discount CASCADE;
DROP TABLE IF EXISTS product_price CASCADE;
DROP TABLE IF EXISTS product_plan CASCADE;
DROP TABLE IF EXISTS product_date CASCADE;
DROP TABLE IF EXISTS product_weekly_availability CASCADE;
DROP TABLE IF EXISTS co_producer CASCADE;
DROP TABLE IF EXISTS product_installment_program CASCADE;
DROP TABLE IF EXISTS product_post_booking_step CASCADE;
DROP TABLE IF EXISTS product_booking_settings CASCADE;
DROP TABLE IF EXISTS product_currency CASCADE;
DROP TABLE IF EXISTS product CASCADE;

-- Tablas de usuarios y hosts
DROP TABLE IF EXISTS kyc_identity CASCADE;
DROP TABLE IF EXISTS kyc_session CASCADE;
DROP TABLE IF EXISTS confirmation_code CASCADE;
DROP TABLE IF EXISTS temporal_token CASCADE;
DROP TABLE IF EXISTS referral_association CASCADE;
DROP TABLE IF EXISTS referral_code CASCADE;
DROP TABLE IF EXISTS payment_option CASCADE;
DROP TABLE IF EXISTS host_billing_discount CASCADE;
DROP TABLE IF EXISTS host_analytics CASCADE;
DROP TABLE IF EXISTS host_social_media CASCADE;
DROP TABLE IF EXISTS host_user CASCADE;
DROP TABLE IF EXISTS multimedia CASCADE;

-- Tablas principales
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS host CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- Tablas de configuración y lookup
DROP TABLE IF EXISTS plan_breakdown CASCADE;
DROP TABLE IF EXISTS billing_plan CASCADE;
DROP TABLE IF EXISTS discount CASCADE;
DROP TABLE IF EXISTS payment_method CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS currency CASCADE;

-- Tablas lookup (enums)
DROP TABLE IF EXISTS question_type CASCADE;
DROP TABLE IF EXISTS product_resource_type CASCADE;
DROP TABLE IF EXISTS beneficiary_type CASCADE;
DROP TABLE IF EXISTS transaction_direction CASCADE;
DROP TABLE IF EXISTS transaction_type CASCADE;
DROP TABLE IF EXISTS meeting_platform CASCADE;
DROP TABLE IF EXISTS availability_type CASCADE;
DROP TABLE IF EXISTS product_type CASCADE;

-- Tabla base (status)
DROP TABLE IF EXISTS status CASCADE;

-- ================================================
-- DROP ÍNDICES (si existen independientemente)
-- ================================================
DROP INDEX IF EXISTS idx_user_record_id;
DROP INDEX IF EXISTS idx_user_email;
DROP INDEX IF EXISTS idx_host_record_id;
DROP INDEX IF EXISTS idx_host_alias;
DROP INDEX IF EXISTS idx_product_record_id;
DROP INDEX IF EXISTS idx_product_alias;
DROP INDEX IF EXISTS idx_booking_record_id;
DROP INDEX IF EXISTS idx_transaction_record_id;
DROP INDEX IF EXISTS idx_bank_notification_record_id;

-- ================================================
-- VERIFICACIÓN - Mostrar tablas restantes
-- ================================================
SELECT 'Tablas restantes después del DROP:' as info;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%' 
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- ================================================
-- MENSAJE DE CONFIRMACIÓN
-- ================================================
SELECT '¡TODAS LAS TABLAS HAN SIDO ELIMINADAS!' as resultado,
       'Puedes ejecutar ahora el DDL para recrear la estructura' as siguiente_paso;