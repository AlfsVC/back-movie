-- AddColumn invitation_code
ALTER TABLE "users" ADD COLUMN "invitation_code" TEXT;

-- Generar valores únicos para los usuarios existentes
UPDATE "users" 
SET "invitation_code" = concat(substring(md5(random()::text), 1, 8), '_', id)
WHERE "invitation_code" IS NULL;


