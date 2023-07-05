import { Request, Response } from 'express'
import { getManager } from 'typeorm'
import { connect } from '../database/index'
import { NotificationEmail } from '../Services/NotificationEmail'
require('dotenv').config()

connect()
const manager = getManager()

export abstract class CommentController {
  static async create (request: Request, response: Response) {
    try {
      const body = request.body

      const comment = await manager
        .createQueryBuilder()
        .insert()
        .into('public.comments')
        .values({
          task_id: body.task_id,
          user_id: body.user_id,
          comment: body.comment,
        })
        .execute()

      if (comment) {
        const user = await manager
          .createQueryBuilder()
          .select('*')
          .from('users', '')
          .innerJoin('scores', '', 'users.id = scores.responsible_user')
          .innerJoin('tasks', '', 'tasks.id = scores.task_id')
          .where(`scores.task_id = ${body.task_id}`)
          .execute()
        if (user) {
          console.log(user)
          await new NotificationEmail().sendEmail(
            user[0].email,
            'Novo comentário em sua atividade na RepTask!',
            'Olá ' + user[0].name + ' Um novo comentário foi publicado em sua atividade ' + user[0].title
          )
        }
        return response.status(200).send({
          message: 'Comentário cadastrado com sucesso!',
        })
      }
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async get (request: Request, response: Response) {
    try {
      const task = request.params.task

      if (!task) {
        return response.status(400).send({
          error: 'Houve um erro na aplicação',
          message: 'Erro ao buscar comentários da tarefa',
        })
      }

      const comments = await manager
        .createQueryBuilder()
        .select('*')
        .from('comments', '')
        .where(`task_id = ${task}`)
        .innerJoin('users', '', 'users.id = comments.user_id')
        .getRawMany()

      return response.status(200).send(comments)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }
}
