-- AlterTable
ALTER TABLE `order` ADD COLUMN `shippingAddressLine1` VARCHAR(191) NULL,
    ADD COLUMN `shippingAddressLine2` VARCHAR(191) NULL,
    ADD COLUMN `shippingCity` VARCHAR(191) NULL,
    ADD COLUMN `shippingCountry` VARCHAR(191) NULL,
    ADD COLUMN `shippingName` VARCHAR(191) NULL,
    ADD COLUMN `shippingPhone` VARCHAR(191) NULL,
    ADD COLUMN `shippingPostalCode` VARCHAR(191) NULL,
    ADD COLUMN `shippingState` VARCHAR(191) NULL;
