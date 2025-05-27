import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperAdminMigration1748374843355 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // insert super_admin user by default
    await queryRunner.query(
      `INSERT INTO auth (name, email, password, mobile, roles)
        VALUES ("Reino Digital", "admin@reinodigitalcr.com", "$2b$10$Tb6HeYzoFTiMDZG2UD4O7.gQcfsFsLr8pp52x4a2sMTRZ9IlW8MWC", "54474824", "SUPER_ADMIN,ADMIN");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
