import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1749059781261 implements MigrationInterface {
  name = 'Migration1749059781261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`client\` ADD \`type\` varchar(16) NOT NULL DEFAULT 'CLIENTE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`type\``);
  }
}
