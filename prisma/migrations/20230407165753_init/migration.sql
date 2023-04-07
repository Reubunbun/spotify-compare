-- CreateTable
CREATE TABLE `User` (
    `email` VARCHAR(255) NOT NULL,
    `compareId` VARCHAR(255) NOT NULL,
    `refreshToken` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `User_compareId_key`(`compareId`),
    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
