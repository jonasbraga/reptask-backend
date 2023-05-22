import { Router } from "express";
import { connect } from "../database/index";
import { TaskController } from "../controllers/TaskController";
import { CommentController } from "../controllers/CommentController";
// import { AuthController } from "../controllers/AuthController";


connect();
const routes = Router();

/////////////// AUTENTICAÇÃO
// routes.route("/login").post(new AuthController().login);
///////////////////////////////////////////////////////////////////////

// CRUD COMMENTS
routes.route('/comments').post(new CommentController().create);
routes.route('/comments/:task').get(new CommentController().get);

/////////////// CRUD TASKS
routes.route("/tasks-all/:username").get(new TaskController().getAll);
routes.route("/tasks/:username/:option").get(new TaskController().get);
routes.route("/tasks").post(new TaskController().create);
routes.route('/tasks/:id').delete(new TaskController().delete);
routes.route('/tasks/:id').patch(new TaskController().edit);
///////////////////////////////////////////////////////////////////////


export { routes };
