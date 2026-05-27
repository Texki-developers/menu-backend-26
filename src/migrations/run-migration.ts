import { NestFactory } from "@nestjs/core";
import { MigrationsModule } from "./migrations.module";
import { DropProductBranchIdMigration } from "./drop-product-branch-id.migration";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule);

  const migration = app.get(DropProductBranchIdMigration);

  await migration.run();

  await app.close();
  process.exit(0);
}

bootstrap();
