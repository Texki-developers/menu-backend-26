import { NestFactory } from "@nestjs/core";
import { MigrationsModule } from "./migrations.module";
import { NormalizeBranchOrganizationIdMigration } from "./normalize-branch-organization-id.migration";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule);

  const migration = app.get(NormalizeBranchOrganizationIdMigration);

  await migration.run();

  await app.close();
  process.exit(0);
}

bootstrap();