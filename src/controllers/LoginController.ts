import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getManager } from "typeorm";
import { connect } from "../database/index";
import bcrypt from "bcrypt";
require("dotenv").config();

connect();
const manager = getManager();

export class LoginController {
  async login(request: Request, response: Response) {
    try {
      // Obter email e senha do corpo da solicitação
      const { email, password } = request.body;

      // Verificar se o usuário existe
      const userQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")
        // .innerJoin("scores", "", "users.id = scores.responsible_user")
        .where(`email = '${email}'`);

      const user = await userQuery.getRawOne();
      if (!user) {
        return response.status(401).json({ message: "Credenciais inválidas" });
      }

      // Comparar as senhas
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          return response
            .status(401)
            .json({ message: "Credenciais inválidas" });
        }

        // Gerar token JWT
        const token = jwt.sign({ userId: user.id }, "secret", {
          expiresIn: "1h",
        });

        // Retornar o token como resposta
        return response.json({ token });
      });
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação",
      });
    }
  }
}
