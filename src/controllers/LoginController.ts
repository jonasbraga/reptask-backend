import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getManager } from 'typeorm'
import { connect } from '../database/index'
import bcrypt from 'bcrypt'
require('dotenv').config()

connect()
const manager = getManager()

export class LoginController {
  async login (request: Request, response: Response) {
    try {
      // Obter email e senha do corpo da solicitação
      const { email, password } = request.body

      // Verificar se o usuário existe
      const userQuery = manager
        .createQueryBuilder()
        .select(
          'users.*, reps.name as rep_name, SUM(CASE WHEN scores.finished = true THEN scores.value ELSE 0 END) as punctuation, SUM(CASE WHEN scores.finished = true THEN 1 ELSE 0 END) as finished_tasks'
        )
        .from('users', '')
        .innerJoin('scores', '', 'users.id = scores.responsible_user')
        .leftJoin('tasks', '', 'tasks.id = scores.task_id')
        .leftJoin('reps', '', 'reps.id = users.reps_id')
        .where(`email = '${email}'`)
        .groupBy('users.id')
        .addGroupBy('reps.name')

      const user = await userQuery.getRawOne()
      if (!user) {
        return response.status(401).json({ message: 'Credenciais inválidas' })
      }

      // Comparar as senhas
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          return response.status(401).json({ message: 'Credenciais inválidas' })
        }

        // Gerar token JWT
        const token = jwt.sign({ userId: user.id }, 'secret', {
          expiresIn: '1h',
        })

        // Retornar o token como resposta
        return response.json({ token, user })
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }

  async changePassword (request: Request, response: Response) {
    try {
      // Obter email, senha antiga e nova senha do corpo da solicitação
      const { oldPassword, newPassword } = request.body
      const userId = request.params.id

      // Verificar se o usuário existe
      const userQuery = manager.createQueryBuilder().select('*').from('users', '').where(`id = '${userId}'`)

      const user = await userQuery.getRawOne()
      if (!user) {
        return response.status(401).json({ message: 'Credenciais inválidas1' })
      }

      // Comparar as senhas
      bcrypt.compare(oldPassword, user.password, async (err, result) => {
        if (err || !result) {
          return response.status(401).json({ message: 'Credenciais inválidas2' })
        }

        // Gerar o hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Atualizar a senha no banco de dados
        const updateQuery = manager
          .createQueryBuilder()
          .update('users')
          .set({ password: hashedPassword })
          .where(`id = '${userId}'`)

        await updateQuery.execute()

        return response.status(200).json({ message: 'Senha alterada com sucesso' })
      })
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro na aplicação',
      })
    }
  }
}
