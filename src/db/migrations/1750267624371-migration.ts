import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750267624371 implements MigrationInterface {
  name = 'Migration1750267624371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`activity\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`code\` varchar(32) NOT NULL,
      \`name\` varchar(255) NOT NULL,
      \`description\` text NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`client_activity\` (\`clientId\` int NOT NULL, \`activityId\` int NOT NULL, INDEX \`IDX_ea4447c91e160c087f8c436018\` (\`clientId\`), INDEX \`IDX_fd64736c13d8377fc0c23c604d\` (\`activityId\`), PRIMARY KEY (\`clientId\`, \`activityId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_activity\` ADD CONSTRAINT \`FK_ea4447c91e160c087f8c4360183\` FOREIGN KEY (\`clientId\`) REFERENCES \`client\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_activity\` ADD CONSTRAINT \`FK_fd64736c13d8377fc0c23c604db\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`client_activity\` DROP FOREIGN KEY \`FK_fd64736c13d8377fc0c23c604db\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_activity\` DROP FOREIGN KEY \`FK_ea4447c91e160c087f8c4360183\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fd64736c13d8377fc0c23c604d\` ON \`client_activity\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ea4447c91e160c087f8c436018\` ON \`client_activity\``,
    );
    await queryRunner.query(`DROP TABLE \`client_activity\``);
    await queryRunner.query(`DROP TABLE \`activity\``);
  }
}
