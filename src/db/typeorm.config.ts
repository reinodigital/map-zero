import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mariadb',
  host: 'mariadb', // Put here the mysql alias container when using Docker
  port: 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity{ .ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
