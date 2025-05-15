import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747344038734 implements MigrationInterface {
  name = 'Migration1747344038734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`account_type\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      UNIQUE INDEX \`IDX_483ecf8146297b917c11a19fa6\` (\`name\`),
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`account\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`code\` varchar(16) NOT NULL,
      \`name\` varchar(255) NOT NULL,
      \`description\` varchar(255) NULL,
      \`tax\` varchar(16) NULL,
      \`accountTypeId\` int NOT NULL,
      UNIQUE INDEX \`IDX_4a3f3a286a3d055274192578e8\` (\`code\`),
      UNIQUE INDEX \`IDX_414d4052f22837655ff312168c\` (\`name\`),
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account\`
      ADD CONSTRAINT \`FK_fd32bacb5c272e0899262f02086\`
      FOREIGN KEY (\`accountTypeId\`)
      REFERENCES \`account_type\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account\` DROP FOREIGN KEY \`FK_fd32bacb5c272e0899262f02086\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_414d4052f22837655ff312168c\` ON \`account\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4a3f3a286a3d055274192578e8\` ON \`account\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_type\` DROP INDEX \`IDX_483ecf8146297b917c11a19fa6\``,
    );
    await queryRunner.query(`DROP TABLE \`account\``);
    await queryRunner.query(`DROP TABLE \`account_type\``);
  }
}
