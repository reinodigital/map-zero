import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1749493655536 implements MigrationInterface {
  name = 'Migration1749493655536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`invoice_item\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`description\` varchar(255) NULL,
      \`quantity\` int NOT NULL,
      \`price\` decimal(10,2) NOT NULL,
      \`discount\` int NOT NULL DEFAULT '0',
      \`taxRate\` varchar(255) NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`accountId\` int NOT NULL,
      \`itemId\` int NOT NULL,
      \`invoiceId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invoice\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`status\` varchar(32) NOT NULL DEFAULT 'borrador',
      \`invoiceNumber\` varchar(32) NOT NULL DEFAULT 'FA-',
      \`reference\` varchar(64) NULL,
      \`total\` decimal(10,2) NOT NULL,
      \`initDate\` timestamp NULL,
      \`expireDate\` timestamp NULL,
      \`currency\` varchar(16) NOT NULL,
      \`isActive\` tinyint NOT NULL DEFAULT 1,
      \`clientId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\`
      ADD CONSTRAINT \`FK_640c4ff22ce284e456c889b514e\`
      FOREIGN KEY (\`accountId\`)
      REFERENCES \`account\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\`
      ADD CONSTRAINT \`FK_5cb01bdc22384044d77f791d3d0\`
      FOREIGN KEY (\`itemId\`)
      REFERENCES \`item\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\`
      ADD CONSTRAINT \`FK_553d5aac210d22fdca5c8d48ead\`
      FOREIGN KEY (\`invoiceId\`)
      REFERENCES \`invoice\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\`
      ADD CONSTRAINT \`FK_f18e9b95fe80b1f554d1cb6c23b\`
      FOREIGN KEY (\`clientId\`)
      REFERENCES \`client\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_f18e9b95fe80b1f554d1cb6c23b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\` DROP FOREIGN KEY \`FK_553d5aac210d22fdca5c8d48ead\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\` DROP FOREIGN KEY \`FK_5cb01bdc22384044d77f791d3d0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\` DROP FOREIGN KEY \`FK_640c4ff22ce284e456c889b514e\``,
    );
    await queryRunner.query(`DROP TABLE \`invoice\``);
    await queryRunner.query(`DROP TABLE \`invoice_item\``);
  }
}
