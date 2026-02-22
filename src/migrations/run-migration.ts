import { NestFactory } from "@nestjs/core";
import { MigrationsModule } from "./migrations.module";
import { UpdateStatusMigration } from "./update-status.migration";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule);

  const migration = app.get(UpdateStatusMigration);

  await migration.run();

  await app.close();
  process.exit(0);
}

bootstrap();