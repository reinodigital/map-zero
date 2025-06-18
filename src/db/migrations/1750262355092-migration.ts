import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750262355092 implements MigrationInterface {
  name = 'Migration1750262355092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`type\` varchar(16) NOT NULL DEFAULT 'Producto'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`type\``);
  }
}
