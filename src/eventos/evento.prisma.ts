import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/db/prisma.provider';

@Injectable()
export class EventoPrisma {
    constructor(private prisma: PrismaProvider  ) {}
}
