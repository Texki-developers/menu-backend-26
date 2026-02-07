import { Module } from "@nestjs/common";
import { ENVService } from "./env.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [],
    providers: [ENVService],
    exports: [ENVService]
})
export class ENVModule {}