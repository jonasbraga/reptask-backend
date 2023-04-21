import { Router } from "express";
import { connect } from "../database/index";
// import { Controller } from "../controllers/Controller";
// import { AuthController } from "../controllers/AuthController";


connect();
const routes = Router();

/////////////// AUTENTICAÇÃO
// routes.route("/login").post(new AuthController().login);
///////////////////////////////////////////////////////////////////////

/////////////// CRUD EXAMPLE
// routes.route("/example").get(new Controller().get);
// routes.route("/example").post(new Controller().create);
// routes.route('/example').delete(new Controller().delete);
// routes.route('/example').patch(new Controller().edit);
///////////////////////////////////////////////////////////////////////


export { routes };
