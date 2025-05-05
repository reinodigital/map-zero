import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746477647447 implements MigrationInterface {
  name = 'Migration1746477647447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`quote\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`status\` varchar(32) NOT NULL DEFAULT 'draft',
      \`quoteNumber\` varchar(32) NOT NULL,
      \`initDate\` timestamp NULL,
      \`expireDate\` timestamp NULL,
      \`currency\` varchar(16) NOT NULL,
      \`terms\` varchar(255) NULL,
      \`clientId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`quote_item\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`description\` varchar(255) NULL,
      \`quantity\` int NOT NULL,
      \`price\` float NOT NULL,
      \`discount\` float NOT NULL DEFAULT '0',
      \`account\` varchar(255) NULL,
      \`taxRate\` varchar(255) NULL,
      \`amount\` float NOT NULL,
      \`itemId\` int NOT NULL,
      \`quoteId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tracking\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`action\` varchar(32) NOT NULL DEFAULT 'creado',
      \`executedAt\` timestamp NOT NULL,
      \`executedBy\` varchar(64) NULL,
      \`detail\` varchar(255) NOT NULL,
      \`refEntity\` varchar(255) NOT NULL,
      \`refEntityId\` int NOT NULL,
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote\` ADD CONSTRAINT \`FK_8b8c48876f6fdcf3e143c41596b\` FOREIGN KEY (\`clientId\`) REFERENCES \`client\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD CONSTRAINT \`FK_fd106f44149514df1df5cb62a07\` FOREIGN KEY (\`itemId\`) REFERENCES \`item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` ADD CONSTRAINT \`FK_6296266787152fd91f74cb9d1d1\` FOREIGN KEY (\`quoteId\`) REFERENCES \`quote\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP FOREIGN KEY \`FK_6296266787152fd91f74cb9d1d1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote_item\` DROP FOREIGN KEY \`FK_fd106f44149514df1df5cb62a07\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quote\` DROP FOREIGN KEY \`FK_8b8c48876f6fdcf3e143c41596b\``,
    );
    await queryRunner.query(`DROP TABLE \`tracking\``);
    await queryRunner.query(`DROP TABLE \`quote_item\``);
    await queryRunner.query(`DROP TABLE \`quote\``);
  }
}
