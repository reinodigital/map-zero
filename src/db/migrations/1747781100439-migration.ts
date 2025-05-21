import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747781100439 implements MigrationInterface {
  name = 'Migration1747781100439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP FOREIGN KEY \`FK_e3815b2062b75e7d6382e1ca4af\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`saleTaxRate\` \`saleTaxRate\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`saleAccountId\` \`saleAccountId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD CONSTRAINT \`FK_e3815b2062b75e7d6382e1ca4af\` FOREIGN KEY (\`saleAccountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP FOREIGN KEY \`FK_e3815b2062b75e7d6382e1ca4af\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`saleAccountId\` \`saleAccountId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`saleTaxRate\` \`saleTaxRate\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD CONSTRAINT \`FK_e3815b2062b75e7d6382e1ca4af\` FOREIGN KEY (\`saleAccountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
