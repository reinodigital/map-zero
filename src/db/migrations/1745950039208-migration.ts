import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745950039208 implements MigrationInterface {
  name = 'Migration1745950039208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`territory_district\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(84) NOT NULL,
        \`code\` int NOT NULL,
        \`cantonId\` int NULL,
        UNIQUE INDEX \`IDX_5e4f892bd2d24f2eaf8d20cace\` (\`code\`),
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`territory_canton\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(84) NOT NULL,
        \`code\` int NOT NULL,
        \`provinceId\` int NULL,
        UNIQUE INDEX \`IDX_24a192c1b7d14146971aab75db\` (\`code\`),
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`territory_province\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(84) NOT NULL,
        \`code\` int NOT NULL,
        UNIQUE INDEX \`IDX_b7f059724c7e8ba7edac415b23\` (\`name\`),
        UNIQUE INDEX \`IDX_da23c4d9d373842f08185b9a0a\` (\`code\`),
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`territory_district\`
      ADD CONSTRAINT \`FK_6cc6c8e736034633e1e3fe30142\`
      FOREIGN KEY (\`cantonId\`)
      REFERENCES \`territory_canton\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`territory_canton\`
      ADD CONSTRAINT \`FK_8b025580b6723e9a45f29003909\`
      FOREIGN KEY (\`provinceId\`)
      REFERENCES \`territory_province\`(\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`territory_canton\` DROP FOREIGN KEY \`FK_8b025580b6723e9a45f29003909\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`territory_district\` DROP FOREIGN KEY \`FK_6cc6c8e736034633e1e3fe30142\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_da23c4d9d373842f08185b9a0a\` ON \`territory_province\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b7f059724c7e8ba7edac415b23\` ON \`territory_province\``,
    );
    await queryRunner.query(`DROP TABLE \`territory_province\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_24a192c1b7d14146971aab75db\` ON \`territory_canton\``,
    );
    await queryRunner.query(`DROP TABLE \`territory_canton\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5e4f892bd2d24f2eaf8d20cace\` ON \`territory_district\``,
    );
    await queryRunner.query(`DROP TABLE \`territory_district\``);
  }
}
