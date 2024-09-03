import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export class CommonEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @UpdateDateColumn()
    updateAt: Date;

    @CreateDateColumn()
    createAt: Date;

}