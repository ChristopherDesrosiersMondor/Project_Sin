import type { PrismaClient } from '@prisma/client';
import { prisma } from '$lib/server/prisma';

export class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
}