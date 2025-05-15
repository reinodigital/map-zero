import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747347973085 implements MigrationInterface {
  name = 'Migration1747347973085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\` DROP COLUMN \`isActive\``);
  }
}
