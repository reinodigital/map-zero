import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747176100233 implements MigrationInterface {
  name = 'Migration1747176100233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`sellerUid\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD CONSTRAINT \`FK_332913a511f11f7c403a6c83636\` FOREIGN KEY (\`sellerUid\`) REFERENCES \`auth\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP FOREIGN KEY \`FK_332913a511f11f7c403a6c83636\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`sellerUid\``,
    );
  }
}
