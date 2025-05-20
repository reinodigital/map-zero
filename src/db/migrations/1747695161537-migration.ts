import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747695161537 implements MigrationInterface {
  name = 'Migration1747695161537';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP COLUMN \`purchaseAccount\``,
    );
    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`saleAccount\``);
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`purchaseAccountId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`saleAccountId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`costPrice\` \`costPrice\` float NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`purchaseTaxRate\` \`purchaseTaxRate\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD CONSTRAINT \`FK_07c41928f0cde70570a283c4aaf\` FOREIGN KEY (\`purchaseAccountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`item\` DROP FOREIGN KEY \`FK_07c41928f0cde70570a283c4aaf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`purchaseTaxRate\` \`purchaseTaxRate\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` CHANGE \`costPrice\` \`costPrice\` float(12) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP COLUMN \`saleAccountId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP COLUMN \`purchaseAccountId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`saleAccount\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD \`purchaseAccount\` varchar(255) NOT NULL`,
    );
  }
}
