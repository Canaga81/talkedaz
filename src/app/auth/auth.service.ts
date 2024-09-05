import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserRole } from "src/shared/enum/user.enum";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "./dto/login-user.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { ForgetPasswordDto } from "./dto/forget-password.dto";

import config from "src/config";

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as datefns from 'date-fns';
import { ResetPaswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) {}

    async logIn(params: LoginUserDto) {
        
        let user = await this.userService.findOne([{userName: params.userName}, {email: params.userName}])
        if(!user) throw new HttpException('Login or Password is wrong', HttpStatus.BAD_REQUEST);

        let checkPassword = await bcrypt.compare(params.password, user.password);
        if(!checkPassword) throw new HttpException('Login or Password is wrong', HttpStatus.BAD_REQUEST);

        let payload = {
            userId: user.id
        }

        let token = this.jwtService.sign(payload)

        return {
            token,
            user
        }

    }

    async register(params: RegisterUserDto) {

        let user = await this.userService.create({...params, roles: [UserRole.USER]});
        try {
            let mailerResult = await this.mailerService.sendMail({
                to: user.email,
                subject: 'Welcome to TalkedAz',
                template: 'welcome',
                context: {
                    fullName: user.fullName,
                }
            });
        } catch (err) {
            console.log('Email Send Error', err);
            
        }
        return user;

    }

    async forgetPassword(params: ForgetPasswordDto) {
        
        let user = await this.userService.findOne( { email: params.email } );
        if(!user) throw new NotFoundException()
        
        let activationToken = crypto.randomBytes(12).toString('hex');
        let activationExpire = datefns.addMinutes(new Date(), 30);

        await this.userService.update( user.id, { activationToken, activationExpire } );

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Forget Password',
            template: 'forget_password',
            context: {
                fullName: user.fullName,
                url: `${config.appUrl}/auth/forget_password?token=${activationToken}&email=${user.email}`,
            }
        })

        return {
            status: true,
            message: 'Activation email has been sent. Please check yox mailbox',
        }

    }

    async resetPassword(params: ResetPaswordDto) {
        
        let user = await this.userService.findOne( { email: params.email } );
        if(!user) throw new NotFoundException();

        if(user.activationToken != params.token) throw new HttpException('Token is wrong', 400);
        if(user.activationExpire < new Date()) throw new HttpException('activation token is expired', 400);
        
        if(params.password != params.repeatPassword) throw new HttpException('password is not same as repeat password', 400)
        
        let password = await bcrypt.hash(params.password, 10)
        await this.userService.update(user.id, {
            password,
            activationToken: null,
            activationExpire: null,
        })

        return {
            status: true,
            message: 'Your password is successfully updated',
        }

    }

}