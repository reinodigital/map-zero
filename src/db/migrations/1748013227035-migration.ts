import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1748013227035 implements MigrationInterface {
  name = 'Migration1748013227035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`costPrice\``);
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`costPrice\` decimal(10,2) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`salePrice\``);
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`salePrice\` decimal(10,2) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`quote_item\` DROP COLUMN \`price\``);
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`price\` decimal(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`discount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`discount\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`amount\` decimal(10,2) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`quote\` DROP COLUMN \`total\``);
    await queryRunner.query(
      `ALTER TABLE \`quote\` ADD \`total\` decimal(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`quote\` DROP COLUMN \`total\``);
    await queryRunner.query(
      `ALTER TABLE \`quote\` ADD \`total\` float(12) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`amount\` float(12) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`discount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`discount\` float(12) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`ALTER TABLE \`quote_item\` DROP COLUMN \`price\``);
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`price\` float(12) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`salePrice\``);
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`salePrice\` float(12) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`costPrice\``);
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`costPrice\` float(12) NULL`,
    );
  }
}
