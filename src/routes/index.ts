import { Router } from "express";
import { connect } from "../database/index";
import { TaskController } from "../controllers/TaskController";
import { CommentController } from "../controllers/CommentController";
import { LoginController } from "../controllers/LoginController";
import { UserController } from "../controllers/UserController";
import jwt from 'jsonwebtoken';
import { ItemBonusController } from "../controllers/ItemBonusController";


connect();
const routes = Router();

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrair o token do Bearer token

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autenticação inválido' });
    }
    req.body.userId = decoded.userId;
    next();
  });
};


/////////////// AUTENTICAÇÃO
routes.post("/login", new LoginController().login);
routes.post("/change-password/:id", new LoginController().changePassword);
///////////////////////////////////////////////////////////////////////

// CRUD COMMENTS
routes.route('/comments').post(authenticateToken, new CommentController().create);
routes.route('/comments/:task').get(authenticateToken, new CommentController().get);

/////////////// CRUD TASKS
routes.route("/tasks-all/:username?").get(authenticateToken, new TaskController().getAll);
routes.route("/tasks/:option/:username?").get(authenticateToken, new TaskController().get);
routes.route("/tasks").post(authenticateToken, new TaskController().create);
routes.route('/tasks/:id').delete(authenticateToken, new TaskController().delete);
routes.route('/tasks/:id').patch(authenticateToken, new TaskController().edit);
///////////////////////////////////////////////////////////////////////

/////////////// CRUD USERS
routes.route("/users-all").get(authenticateToken, new UserController().getAll);
routes.route("/users-by-rep/:rep").get(authenticateToken, new UserController().getByRep);
routes.route("/users/:username").get(authenticateToken, new UserController().get);
routes.route("/users").post(authenticateToken, new UserController().create);
routes.route('/users/:id').delete(authenticateToken, new UserController().delete);
routes.route('/users/:id').patch(authenticateToken, new UserController().edit);
///////////////////////////////////////////////////////////////////////

/////////////// CRUD BONUS
routes.route("/items-all").get(authenticateToken, new ItemBonusController().getAll);
routes.route("/items/:id").get(authenticateToken, new ItemBonusController().get);
routes.route("/items").post(authenticateToken, new ItemBonusController().create);
routes.route('/items/:id').delete(authenticateToken, new ItemBonusController().delete);
routes.route('/items/:id').patch(authenticateToken, new ItemBonusController().edit);
///////////////////////////////////////////////////////////////////////


export { routes };
