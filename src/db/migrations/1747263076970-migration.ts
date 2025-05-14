import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747263076970 implements MigrationInterface {
  name = 'Migration1747263076970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quote\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`quote\` DROP COLUMN \`isActive\``);
  }
}
