/*
  Warnings:

  - The values [ADMIN,USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO', 'ENCARGADO_RRHH');
ALTER TABLE "users" ALTER COLUMN "user_rol" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "user_rol" TYPE "Role_new" USING ("user_rol"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "user_rol" SET DEFAULT 'ENCARGADO_CASINO';
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "user_rol" SET DEFAULT 'ENCARGADO_CASINO';
