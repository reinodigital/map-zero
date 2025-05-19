import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747428046754 implements MigrationInterface {
  name = 'Migration1747428046754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account_type\` ADD \`category\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account_type\` DROP COLUMN \`category\``,
    );
  }
}
