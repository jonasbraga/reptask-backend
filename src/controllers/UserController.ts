import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { getManager } from 'typeorm'
import { connect } from '../database/index'
import { NotificationEmail } from '../Services/NotificationEmail'
require('dotenv').config()

connect()
const manager = getManager()

export abstract class UserController {
  static async create (request: Request, response: Response) {
    try {
      const body = request.body

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(body.password, 10)

      const user = await manager
        .createQueryBuilder()
        .insert()
        .into('users')
        .values({
          name: body.name,
          email: body.email,
          nickname: body.nickname,
          password: hashedPassword, // Salvar a senha criptografada
          // photo: body.photo ? body.photo : null,
          user_type: body.user_type,
          reps_id: body.reps_id,
        })
        .returning('id')
        .execute()
      if (user) {
        await new NotificationEmail().sendEmail(
          body.email,
          'Criação de conta na RepTask',
          'Olá ' + body.name + ' bem vindo a repTask! sua conta foi criado com sucesso'
        )
      }
      response.status(201).send({
        message: 'Usuário cadastrado com sucesso!',
        user_id: user.raw[0].id,
      })
    } catch {
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async edit (request: Request, response: Response) {
    try {
      const body = request.body
      const userId = request.params.id

      await manager
        .createQueryBuilder()
        .update('public.users')
        .set({
          name: body.name,
          // email: body.email,
          nickname: body.nickname,
          // Password will be updated in another route
          // password: body.password,
          photo: body.photo || null,
          // user_type: body.user_type,
          // reps_id: body.reps_id
        })
        .where(`id = ${userId}`)
        .execute()

      response.status(200).send({
        message: 'Usuário editado com sucesso!',
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async delete (request: Request, response: Response) {
    try {
      const userId = request.params.id

      await manager.createQueryBuilder().delete().from('public.scores').where(`responsible_user = ${userId}`).execute()

      await manager.createQueryBuilder().delete().from('public.users').where(`id = ${userId}`).execute()

      response.status(200).send({
        message: 'Usuário excluído com sucesso!',
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async get (request: Request, response: Response) {
    try {
      const userId = Number(request.params.username)

      const userQuery = manager.createQueryBuilder().select('*').from('users', '').where(`id = ${userId}`)

      const user = await userQuery.getRawOne()
      const userPointsQuery = manager
        .createQueryBuilder()
        .select('SUM(value)')
        .from('scores', '')
        .andWhere(`responsible_user = ${user.id}`)

      const userPoints = await userPointsQuery.getRawOne()

      const repQuery = manager.createQueryBuilder().select('name').from('reps', '').where(`id = ${user.reps_id}`)

      const rep = await repQuery.getRawOne()

      user.reps_name = rep.name
      user.userPoints = userPoints.sum ? userPoints.sum.toString() : 0
      return response.status(200).send(user)
    } catch {
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async getByRep (request: Request, response: Response) {
    try {
      const repId = Number(request.params.rep)

      const userQuery = manager
        .createQueryBuilder()
        .select(
          'users.*, reps.name as rep_name, SUM(CASE WHEN scores.finished = true THEN 1 ELSE 0 END) as finished_tasks'
        )
        .from('users', '')
        .leftJoin('scores', '', 'users.id = scores.responsible_user')
        .leftJoin('tasks', '', 'tasks.id = scores.task_id')
        .leftJoin('reps', '', 'reps.id = users.reps_id')
        .where(`reps_id = ${repId}`)
        .groupBy('users.id')
        .addGroupBy('reps.name')

      const user = await userQuery.getRawMany()

      return response.status(200).send(user)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async getAll (request: Request, response: Response) {
    try {
      const usersQuery = manager.createQueryBuilder().select('*').from('users', '')

      const results = await usersQuery.getRawMany()
      return response.status(200).send(results)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }
}
