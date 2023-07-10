import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { getManager } from 'typeorm'
import { connect } from '../database/index'
require('dotenv').config()

connect()
const manager = getManager()

const ADMIN_TYPE = 1

export abstract class AdminController {
  // Cria um novo admin em uma nova republica
  static async create (request: Request, response: Response) {
    try {
      if (request.headers.authorization !== process.env.ADMIN_TOKEN) {
        return response.status(403).json({
          message: 'Token de autenticação inválido',
        })
      }

      const { rep, admin } = request.body

      const repResult = await manager
        .createQueryBuilder()
        .insert()
        .into('reps')
        .values({
          name: rep.name,
          code: rep.code,
        })
        .returning('id')
        .execute()

      const hashedPassword = await bcrypt.hash(admin.password, 10)
      const adminResult = await manager
        .createQueryBuilder()
        .insert()
        .into('users')
        .values({
          name: admin.name,
          email: admin.email,
          nickname: admin.nickname,
          password: hashedPassword,
          user_type: ADMIN_TYPE,
          reps_id: repResult.raw[0].id,
        })
        .returning('id')
        .execute()

      response.status(201).send({
        message: 'Admin cadastrado com sucesso!',
        admin_id: adminResult.raw[0].id,
        reps_id: repResult.raw[0].id,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }
}
