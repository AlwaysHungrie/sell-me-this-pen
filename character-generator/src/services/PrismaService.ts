import { PrismaClient } from '@prisma/client'
import { Character, S3CharacterData, Transaction } from '../types'

export class PrismaService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async connect(): Promise<void> {
    await this.prisma.$connect()
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }

  async saveCharacter(s3Data: S3CharacterData): Promise<Character> {
    const savedCharacter = await this.prisma.character.create({
      data: {
        s3Data: s3Data,
      },
    })

    return {
      id: savedCharacter.id,
      s3Data: savedCharacter.s3Data as S3CharacterData,
      createdAt: savedCharacter.createdAt,
      updatedAt: savedCharacter.updatedAt,
    }
  }

  async getRandomCharacter(): Promise<Character | null> {
    const count = await this.prisma.character.count()
    if (count === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * count)
    const savedCharacter = await this.prisma.character.findMany({
      skip: randomIndex,
      take: 1,
    })

    if (savedCharacter.length === 0) {
      return null
    }

    const character = savedCharacter[0]

    return {
      id: character.id,
      s3Data: character.s3Data as S3CharacterData,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }
  }

  async getAllCharacters(): Promise<Character[]> {
    const characters = await this.prisma.character.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return characters.map((character) => ({
      id: character.id,
      s3Data: character.s3Data as S3CharacterData,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }))
  }

  async getCharacterById(id: string): Promise<Character | null> {
    const character = await this.prisma.character.findUnique({
      where: { id },
    })

    if (!character) {
      return null
    }

    return {
      id: character.id,
      s3Data: character.s3Data as S3CharacterData,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }
  }

  // save transaction
  async saveTransaction(transactionHash: string): Promise<void> {
    await this.prisma.transaction.create({
      data: {
        transactionHash: transactionHash,
      },
    })
  }

  // get transaction by hash
  async getTransactionByHash(
    transactionHash: string
  ): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { transactionHash: transactionHash },
    })

    if (!transaction) {
      return null
    }

    return {
      id: transaction.id,
      transactionHash: transaction.transactionHash,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }
  }
}
