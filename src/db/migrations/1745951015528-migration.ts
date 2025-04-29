import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745951015528 implements MigrationInterface {
  name = 'Migration1745951015528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cabys_list\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(32) NOT NULL,
        \`description\` text NOT NULL,
        \`tax\` int NOT NULL,
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`cabys_list\``);
  }
}
