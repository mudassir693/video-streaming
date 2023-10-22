import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { compareHash, createHash } from "src/config/helpers/bcrypt.helper";
import { DatabaseService } from "src/database/database.service";
import { LoginRequest, SignUpRequest } from "./dto/requets.dto";
import { user } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private _dbService: DatabaseService){}

    async Signup(data: SignUpRequest): Promise<{success: boolean}>{
        const user: user = await this._dbService.user.findFirst({where:{email: data.email}})
        if(user){
            throw new BadRequestException('User already exist')
        }

        const hashedPassword = createHash(data.password)
        await this._dbService.user.create({data:{
            name: data.name,
            email: data.email,
            password: hashedPassword
        }})

        return {
            success: true
        }
    }

    async Login(data: LoginRequest){
        let user: user = await this._dbService.user.findUnique({where: {email: data.email}})
        if(!user){
            throw new NotFoundException('No record found with this email.')
        }
        let isPasswordMath = compareHash(data.password, user.password)
        if(!isPasswordMath){
            return new BadRequestException("Invalid password.")
        }

        
        return user
    }
}