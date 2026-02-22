import { NestFactory } from "@nestjs/core";
import { MigrationsModule } from "./migrations.module";
import { AddCitySlugMigration } from "./add-city-slug.migration";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule);

  const migration = app.get(AddCitySlugMigration);

  await migration.run();

  await app.close();
  process.exit(0);
}

bootstrap();