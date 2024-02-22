/*
  Warnings:

  - Added the required column `picture` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "picture" TEXT NOT NULL;
