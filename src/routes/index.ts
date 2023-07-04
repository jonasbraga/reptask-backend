import { Router } from 'express'
import { connect } from '../database/index'
import { TaskController } from '../controllers/TaskController'
import { CommentController } from '../controllers/CommentController'
import { LoginController } from '../controllers/LoginController'
import { UserController } from '../controllers/UserController'
import jwt from 'jsonwebtoken'
import { ItemBonusController } from '../controllers/ItemBonusController'

connect()
const routes = Router()

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Extrair o token do Bearer token

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' })
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autenticação inválido' })
    }
    req.body.userId = decoded.userId
    next()
  })
}

/// //////////// AUTENTICAÇÃO
routes.post('/login', LoginController.login)
routes.post('/change-password/:id', LoginController.changePassword)
/// ////////////////////////////////////////////////////////////////////

// CRUD COMMENTS
routes.route('/comments').post(authenticateToken, CommentController.create)
routes.route('/comments/:task').get(authenticateToken, CommentController.get)

/// //////////// CRUD TASKS
routes.route('/tasks-all/:rep/:username?').get(authenticateToken, TaskController.getAll)
routes.route('/tasks/:option/:rep/:username?').get(authenticateToken, TaskController.get)
routes.route('/tasks').post(authenticateToken, TaskController.create)
routes.route('/tasks/:id').delete(authenticateToken, TaskController.delete)
routes.route('/tasks/:id').patch(authenticateToken, TaskController.edit)
/// ////////////////////////////////////////////////////////////////////

/// //////////// CRUD USERS
routes.route('/users-all').get(authenticateToken, UserController.getAll)
routes.route('/users-by-rep/:rep').get(authenticateToken, UserController.getByRep)
routes.route('/users/:username').get(authenticateToken, UserController.get)
routes.route('/users').post(authenticateToken, UserController.create)
routes.route('/users/:id').delete(authenticateToken, UserController.delete)
routes.route('/users/:id').patch(authenticateToken, UserController.edit)
/// ////////////////////////////////////////////////////////////////////

/// //////////// CRUD BONUS
routes.route('/items-all').get(authenticateToken, ItemBonusController.getAll)
routes.route('/items/:id').get(authenticateToken, ItemBonusController.get)
routes.route('/items').post(authenticateToken, ItemBonusController.create)
routes.route('/items/:id').delete(authenticateToken, ItemBonusController.delete)
routes.route('/items/:id').patch(authenticateToken, ItemBonusController.edit)
/// ////////////////////////////////////////////////////////////////////

export { routes }
