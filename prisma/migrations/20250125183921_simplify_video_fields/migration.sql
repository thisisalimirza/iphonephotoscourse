/*
  Warnings:

  - You are about to drop the column `videoAssetId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoPlaybackId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoStatus` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "videoAssetId",
DROP COLUMN "videoPlaybackId",
DROP COLUMN "videoStatus";
