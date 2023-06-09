import { Request, Response } from 'express'
import { getManager } from 'typeorm'
import { connect } from '../database/index'
require('dotenv').config()

connect()
const manager = getManager()

export abstract class ItemBonusController {
  static async create (request: Request, response: Response) {
    try {
      const body = request.body
      const item = await manager
        .createQueryBuilder()
        .insert()
        .into('item_bonus')
        .values({
          title: body.title,
          value: body.value || null,
        })
        .returning('id')
        .execute()

      response.status(200).send({
        message: 'Item bônus cadastrado com sucesso!',
        itemId: item.raw[0].id,
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
      const itemId = request.params.id
      await manager
        .createQueryBuilder()
        .update('public.item_bonus')
        .set({
          title: body.title,
          value: body.value || null,
        })
        .where(`id = ${itemId}`)
        .execute()

      response.status(200).send({
        message: 'Item bônus editada com sucesso!',
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
      const itemId = request.params.id
      await manager.createQueryBuilder().delete().from('public.item_bonus').where(`id = ${itemId}`).execute()

      response.status(200).send({
        message: 'Item bônus excluído com sucesso!',
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
      const item = request.params.id

      if (item) {
        const items = await manager
          .createQueryBuilder()
          .select('*')
          .from('item_bonus', '')
          .where(`id = ${item}`)
          .getRawMany()

        return response.status(200).send(items)
      } else {
        return response.status(500).send({
          error: 'Houve um erro na aplicação',
          message: 'Erro ao buscar itens',
        })
      }
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async getAll (request: Request, response: Response) {
    try {
      const results = await manager.createQueryBuilder().select('*').from('item_bonus', '').getRawMany()

      return response.status(200).send(results)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  static async buy (request: Request, response: Response) {
    try {
      const body = request.body

      await manager
        .createQueryBuilder()
        .insert()
        .into('historic')
        .values({
          user_id: body.user_id,
          item_id: body.item_id,
        })
        .execute()

      response.status(200).send({
        message: 'Item bônus resgatado com sucesso!',
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }
}
