import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getManager,
} from "typeorm";
import { connect } from "../database/index";
require("dotenv").config();

connect();
const manager = getManager();

export class UserController {
    async create(request: Request, response: Response) {
      try {
        const body = request.body;

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await manager
          .createQueryBuilder()
          .insert()
          .into("users")
          .values({
            name: body.name,
            email: body.email,
            nickname: body.nickname,
            password: hashedPassword, // Salvar a senha criptografada
            // photo: body.photo ? body.photo : null,
            user_type: body.user_type,
            reps_id: body.reps_id
          })
          .returning("id")
          .execute();

          response.status(201).send({
            message: "Usuário cadastrado com sucesso!",
            user_id: user.raw[0].id,
          });
        } catch (error) {
          console.error(error);
          return response.status(500).send({
            error: "Houve um erro na aplicação"
          });
        }
    }

  async edit(request: Request, response: Response) {
    try {
      const body = request.body;
      const user_id = request.params.id;

      await manager
        .createQueryBuilder()
        .update("public.users")
        .set({
          name: body.name,
          // email: body.email,
          nickname: body.nickname,
          // Password will be updated in another route
          // password: body.password,
          photo: body.photo ? body.photo : null,
          // user_type: body.user_type,
          // reps_id: body.reps_id
        })
        .where(`id = ${user_id}`)
        .execute();

      response.status(200).send({
        message: "Usuário editado com sucesso!",
      });
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const user_id = request.params.id;

      await manager
        .createQueryBuilder()
        .delete()
        .from("public.scores")
        .where(`responsible_user = ${user_id}`)
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from("public.users")
        .where(`id = ${user_id}`)
        .execute();

      response.status(200).send({
        message: "Usuário excluído com sucesso!",
      });
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async get(request: Request, response: Response) {
    try {
      const userId = Number(request.params.username);

      const userQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")
        .where(`id = ${userId}`);

      const user = await userQuery.getRawOne();
      const userPointsQuery = manager
        .createQueryBuilder()
        .select("SUM(value)")
        .from("scores", "")
        .andWhere(`responsible_user = ${user['id']}`);

      const userPoints = await userPointsQuery.getRawOne();

      const repQuery = manager
        .createQueryBuilder()
        .select("name")
        .from("reps", "")
        .where(`id = ${user['reps_id']}`);

      const rep = await repQuery.getRawOne();

      user['reps_name'] = rep['name'];
      user['userPoints'] = userPoints['sum'] ? userPoints['sum'].toString() : 0;
      return response.status(200).send(user);
    } catch (error) {
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async getByRep(request: Request, response: Response) {
    try {
      const repId = Number(request.params.rep);

      const userQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")
        .where(`reps_id = ${repId}`);

      const user = await userQuery.getRawMany();

      return response.status(200).send(user);
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async getAll(request: Request, response: Response) {
    try {
      const usersQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")

      const results = await usersQuery.getRawMany();
      return response.status(200).send(results);
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }
}