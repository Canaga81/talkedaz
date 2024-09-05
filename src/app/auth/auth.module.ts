import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import config from "src/config";

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})

export class AuthModule {

}