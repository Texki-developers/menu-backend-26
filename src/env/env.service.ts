import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ENVService {
    constructor(private config: ConfigService) {}

    get(key: 'MONGO_URI') {
        return this.config.get(key);
    }
}