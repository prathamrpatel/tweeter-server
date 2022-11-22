/*
  Warnings:

  - You are about to alter the column `body` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `VarChar(288)` to `VarChar(280)`.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "body" SET DATA TYPE VARCHAR(280);
