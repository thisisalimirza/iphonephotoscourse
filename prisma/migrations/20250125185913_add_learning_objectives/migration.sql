-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[];
