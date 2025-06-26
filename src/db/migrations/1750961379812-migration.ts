import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750961379812 implements MigrationInterface {
  name = 'Migration1750961379812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`purchase_order\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`status\` varchar(32) NOT NULL DEFAULT 'borrador',
      \`purchaseOrderNumber\` varchar(32) NOT NULL DEFAULT 'OC-',
      \`total\` decimal(10,2) NOT NULL,
      \`initDate\` timestamp NULL,
      \`expireDate\` timestamp NULL,
      \`currency\` varchar(16) NOT NULL,
      \`terms\` varchar(255) NULL,
      \`isActive\` tinyint NOT NULL DEFAULT 1,
      \`clientId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`purchase_order_item\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`description\` varchar(255) NULL,
      \`quantity\` int NOT NULL,
      \`price\` decimal(10,2) NOT NULL,
      \`discount\` int NOT NULL DEFAULT '0',
      \`taxRate\` varchar(255) NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`accountId\` int NOT NULL,
      \`itemId\` int NOT NULL,
      \`sellerUid\` int NULL,
      \`purchaseOrderId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order\` ADD CONSTRAINT \`FK_348da7c0f3b8433c54c1a5f5621\` FOREIGN KEY (\`clientId\`) REFERENCES \`client\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` ADD CONSTRAINT \`FK_c6d3869e78658bd535a7b7dc626\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` ADD CONSTRAINT \`FK_0c7a3c55c8dc03b7ed6bba4f369\` FOREIGN KEY (\`itemId\`) REFERENCES \`item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` ADD CONSTRAINT \`FK_2e90ffc7942416fd7d15e22c021\` FOREIGN KEY (\`sellerUid\`) REFERENCES \`auth\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` ADD CONSTRAINT \`FK_13ef910b84865fed2a2799dea55\` FOREIGN KEY (\`purchaseOrderId\`) REFERENCES \`purchase_order\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` DROP FOREIGN KEY \`FK_13ef910b84865fed2a2799dea55\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` DROP FOREIGN KEY \`FK_2e90ffc7942416fd7d15e22c021\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` DROP FOREIGN KEY \`FK_0c7a3c55c8dc03b7ed6bba4f369\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order_item\` DROP FOREIGN KEY \`FK_c6d3869e78658bd535a7b7dc626\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_order\` DROP FOREIGN KEY \`FK_348da7c0f3b8433c54c1a5f5621\``,
    );
    await queryRunner.query(`DROP TABLE \`purchase_order_item\``);
    await queryRunner.query(`DROP TABLE \`purchase_order\``);
  }
}
