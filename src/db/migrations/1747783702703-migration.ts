import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747783702703 implements MigrationInterface {
  name = 'Migration1747783702703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`salePrice\` \`salePrice\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`salePrice\` \`salePrice\` float(12) NOT NULL`,
    );
  }
}
