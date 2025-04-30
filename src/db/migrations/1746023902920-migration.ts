import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746023902920 implements MigrationInterface {
  name = 'Migration1746023902920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`client_contact\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(64) NOT NULL,
        \`lastName\` varchar(255) NULL,
        \`email\` varchar(255) NULL,
        \`mobile\` varchar(255) NULL,
        \`clientId\` int NOT NULL,
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_contact\`
      ADD CONSTRAINT \`FK_0805e711d71fb2fb4e3f82519a8\`
      FOREIGN KEY (\`clientId\`)
      REFERENCES \`client\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`client_contact\` DROP FOREIGN KEY \`FK_0805e711d71fb2fb4e3f82519a8\``,
    );
    await queryRunner.query(`DROP TABLE \`client_contact\``);
  }
}
