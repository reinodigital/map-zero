import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745959192492 implements MigrationInterface {
  name = 'Migration1745959192492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`client_address\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`provinceName\` varchar(64) NOT NULL,
        \`provinceCode\` varchar(16) NOT NULL,
        \`cantonName\` varchar(64) NOT NULL,
        \`cantonCode\` varchar(16) NOT NULL,
        \`districtName\` varchar(64) NOT NULL,
        \`districtCode\` varchar(16) NOT NULL,
        \`exactAddress\` text NULL,
        \`clientId\` int NOT NULL,
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_address\`
      ADD CONSTRAINT \`FK_f7713b7642f8ad9a8549326c6d0\`
      FOREIGN KEY (\`clientId\`)
      REFERENCES \`client\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`client_address\` DROP FOREIGN KEY \`FK_f7713b7642f8ad9a8549326c6d0\``,
    );
    await queryRunner.query(`DROP TABLE \`client_address\``);
  }
}
