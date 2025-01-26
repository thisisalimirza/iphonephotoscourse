/*
  Warnings:

  - Made the column `duration` on table `Lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DEFAULT '';
