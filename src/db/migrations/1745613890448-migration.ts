import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745613890448 implements MigrationInterface {
  name = 'Migration1745613890448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`client\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`createdAt\` timestamp NOT NULL,
        \`email\` varchar(64) NOT NULL,
        \`mobile\` varchar(16) NOT NULL,
        \`identity\` varchar(32) NOT NULL,
        \`identityType\` varchar(16) NOT NULL DEFAULT '02',
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`currency\` varchar(16) NOT NULL DEFAULT 'USD',
        \`notes\` varchar(255) NULL,
        \`defaultSeller\` varchar(255) NULL,
        UNIQUE INDEX \`IDX_6436cc6b79593760b9ef921ef1\` (\`email\`),
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auth\` (
        \`uid\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`mobile\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`token\` varchar(128) NULL,
        \`roles\` text NOT NULL DEFAULT 'SELLER',
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        UNIQUE INDEX \`IDX_b54f616411ef3824f6a5c06ea4\` (\`email\`),
        UNIQUE INDEX \`IDX_ae5557876aeb89d642fe50a9e7\` (\`mobile\`),
        PRIMARY KEY (\`uid\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ae5557876aeb89d642fe50a9e7\` ON \`auth\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b54f616411ef3824f6a5c06ea4\` ON \`auth\``,
    );
    await queryRunner.query(`DROP TABLE \`auth\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6436cc6b79593760b9ef921ef1\` ON \`client\``,
    );
    await queryRunner.query(`DROP TABLE \`client\``);
  }
}
