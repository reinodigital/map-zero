import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747758109471 implements MigrationInterface {
  name = 'Migration1747758109471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`account\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`accountId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD CONSTRAINT \`FK_00c205baf2d49315c18c0cf8f74\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP FOREIGN KEY \`FK_00c205baf2d49315c18c0cf8f74\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP COLUMN \`accountId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD \`account\` varchar(255) NULL`,
    );
  }
}
