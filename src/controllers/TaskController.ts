import { Request, Response } from 'express'
import { UpdateResult, getManager } from 'typeorm'
import { connect } from '../database/index'
import { NotificationEmail } from '../Services/NotificationEmail'
require('dotenv').config()

connect()
const manager = getManager()

export abstract class TaskController {
  static async create (request: Request, response: Response) {
    try {
      const body = request.body

      const task = await manager
        .createQueryBuilder()
        .insert()
        .into('tasks')
        .values({
          title: body.title,
          description: body.description || null,
          deadline: body.deadline,
        })
        .returning('id')
        .execute()

      if (body.hasOwnProperty('score')) {
        await manager
          .createQueryBuilder()
          .insert()
          .into('public.scores')
          .values({
            task_id: task.raw[0].id,
            responsible_user: body.score.responsible_user,
            value: body.score.value,
            finished: body.score.finished,
          })
          .execute()
        const user = await manager
          .createQueryBuilder()
          .select('*')
          .from('users', '')
          .where(`users.id = ${body.score.responsible_user}`)
          .execute()
        if (user) {
          await new NotificationEmail().sendEmail(
            user[0].email,
            'Nova tarefa cadastrada na RepTask!',
            'Olá ' + user[0].name + ', a tarefa ' + body.title + ' foi cadastrada em sua república e atribuida a você'
          )
        }
      }

      response.status(200).send({
        message: 'Tarefa cadastrada com sucesso!',
        taskId: task.raw[0].id,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async edit (request: Request, response: Response) {
    try {
      const body = request.body
      const taskId = request.params.id

      const updateQueries: Promise<UpdateResult>[] = []

      updateQueries.push(
        manager
          .createQueryBuilder()
          .update('public.tasks')
          .set({
            title: body.title,
            description: body.description || null,
            deadline: body.deadline,
          })
          .where(`id = ${taskId}`)
          .execute()
      )

      if (body.hasOwnProperty('score')) {
        updateQueries.push(
          manager
            .createQueryBuilder()
            .update('public.scores')
            .set({
              responsible_user: body.score.responsible_user,
              value: body.score.value,
              finished: body.score.finished,
            })
            .where(`task_id = ${taskId}`)
            .execute()
        )
      }

      await Promise.all(updateQueries).then(async () => {
        const user = await manager
          .createQueryBuilder()
          .select('*')
          .from('users', '')
          .where(`users.id = ${body.score.responsible_user}`)
          .execute()
        if (user) {
          await new NotificationEmail().sendEmail(
            user[0].email,
            'Atualização em sua tarefa na RepTask!',
            'Olá ' +
              user[0].name +
              ', a tarefa ' +
              body.title +
              ', atribuída a você, teve atualizações. Entre em sua república e confira'
          )
        }
      })

      return response.status(200).send({
        message: 'Tarefa editada com sucesso!',
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
      const taskId = request.params.id
      await manager.createQueryBuilder().delete().from('public.scores').where(`task_id = ${taskId}`).execute()
      await manager.createQueryBuilder().delete().from('public.tasks').where(`id = ${taskId}`).execute()

      response.status(200).send({
        message: 'Tarefa excluída com sucesso!',
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
      const option = Number(request.params.option)
      const repId = Number(request.params.rep)

      const taskQuery = manager
        .createQueryBuilder()
        .select('*')
        .from('tasks', '')
        .innerJoin('scores', '', 'tasks.id = scores.task_id')
        .innerJoin('users', '', 'scores.responsible_user = users.id')
        .where(`users.reps_id = ${repId}`)

      const user = Number(request.params.username)
      if (user) {
        taskQuery.where(`scores.responsible_user = ${user}`)
      }
      switch (option) {
        // somente pendentes
        case 0: {
          taskQuery.andWhere('scores.finished = false')
          break
        }

        // somente finalizadas
        case 1: {
          taskQuery.andWhere('scores.finished = true')
          break
        }

        // todas as tarefas
        default: {
          break
        }
      }
      const results = await taskQuery.getRawMany()
      return response.status(200).send(results)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async getAll (request: Request, response: Response) {
    try {
      const repId = Number(request.params.rep)
      const tasksQuery = manager
        .createQueryBuilder()
        .select('*')
        .from('tasks', '')
        .innerJoin('scores', '', 'tasks.id = scores.task_id')
        .innerJoin('users', '', 'scores.responsible_user = users.id')
        .where(`users.reps_id = ${repId}`)

      const user = Number(request.params.username)
      if (user) {
        tasksQuery.where(`scores.responsible_user = ${user}`)
      }
      const results = await tasksQuery.getRawMany()

      return response.status(200).send(results)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static validateCreateEntries (body: any) {
    if (!('title' in body)) throw new Error('Campo title é obrigatório')
    if (!('deadline' in body)) throw new Error('Campo deadline é obrigatório')
    if (!('responsible_user' in body.score)) throw new Error('Campo score.responsible_user é obrigatório')
    if (!('value' in body.score)) throw new Error('Campo score.value é obrigatório')
    if (!('finished' in body.score)) throw new Error('Campo score.finished é obrigatório')
  }

  static validateEditEntries (body: any, params: any) {
    if (!('id' in params)) throw new Error('Campo task_id é obrigatório')
    if (!('title' in body)) throw new Error('Campo title é obrigatório')
    if (!('deadline' in body)) throw new Error('Campo deadline é obrigatório')
    if (!('responsible_user' in body.score)) throw new Error('Campo score.responsible_user é obrigatório')
    if (!('value' in body.score)) throw new Error('Campo score.value é obrigatório')
    if (!('finished' in body.score)) throw new Error('Campo score.finished é obrigatório')
  }

  static validateDeleteEntries (params: any) {
    if (!('id' in params)) throw new Error('Campo task_id é obrigatório')
  }

  static validateGetEntries (params: any) {
    if (!('option' in params)) throw new Error('Campo option é obrigatório')
  }

  static validateGetAllEntries (params: any) {
    if (!('username' in params)) throw new Error('Campo username é obrigatório')
  }
}
