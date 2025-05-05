import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746052616127 implements MigrationInterface {
  name = 'Migration1746052616127';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`item\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`costPrice\` float NOT NULL,
      \`purchaseAccount\` varchar(255) NOT NULL,
      \`purchaseTaxRate\` varchar(255) NOT NULL,
      \`purchaseDescription\` text NULL,
      \`salePrice\` float NOT NULL,
      \`saleAccount\` varchar(255) NOT NULL,
      \`saleTaxRate\` varchar(255) NOT NULL,
      \`saleDescription\` text NULL,
      \`createdAt\` timestamp NOT NULL,
      \`cabysId\` int NOT NULL,
      UNIQUE INDEX \`IDX_c6ae12601fed4e2ee5019544dd\` (\`name\`),
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\`
      ADD CONSTRAINT \`FK_b8c5ecfd0f91c8d3839be72f4ba\`
      FOREIGN KEY (\`cabysId\`)
      REFERENCES \`cabys_list\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP FOREIGN KEY \`FK_b8c5ecfd0f91c8d3839be72f4ba\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c6ae12601fed4e2ee5019544dd\` ON \`item\``,
    );
    await queryRunner.query(`DROP TABLE \`item\``);
  }
}
