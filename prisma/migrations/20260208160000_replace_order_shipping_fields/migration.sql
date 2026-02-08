-- AlterTable
ALTER TABLE `order`
    CHANGE COLUMN `shippingAddressLine1` `shippingStreet` VARCHAR(191) NULL,
    CHANGE COLUMN `shippingAddressLine2` `shippingHouse` VARCHAR(191) NULL,
    CHANGE COLUMN `shippingCity` `shippingCityProvince` VARCHAR(191) NULL,
    CHANGE COLUMN `shippingState` `shippingDistrict` VARCHAR(191) NULL,
    DROP COLUMN `shippingPostalCode`,
    DROP COLUMN `shippingCountry`;
