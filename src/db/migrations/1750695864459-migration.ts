import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750695864459 implements MigrationInterface {
  name = 'Migration1750695864459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`receptorActivities\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`emisorActivities\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` DROP COLUMN \`emisorActivities\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` DROP COLUMN \`receptorActivities\``,
    );
  }
}
