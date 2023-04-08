/*
  Warnings:

  - Added the required column `displayHandle` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageURL` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `displayHandle` VARCHAR(255) NOT NULL,
    ADD COLUMN `imageURL` VARCHAR(255) NOT NULL;
