import { Request, Response } from "express";
import {
  getManager
} from "typeorm";
import { connect } from "../database/index";
require("dotenv").config();

connect();
const manager = getManager();

export class UserController {
  async create(request: Request, response: Response) {
    try {
      const body = request.body;
      const user = await manager
        .createQueryBuilder()
        .insert()
        .into("users")
        .values({
          name: body.name,
          email: body.email,
          nickname: body.nickname,
          password: body.password,
          // photo: body.photo ? body.photo : null,
          user_type: body.user_type,
          reps_id: body.reps_id
        })
        .returning("id")
        .execute();

      return response.status(200).send({
        message: "Usuário cadastrada com sucesso!",
        user_id: user.raw[0].id
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
          email: body.email,
          nickname: body.nickname,
          password: body.password,
          // photo: body.photo ? body.photo : null,
          user_type: body.user_type,
          reps_id: body.reps_id
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
      const user = Number(request.params.username);
      const option = Number(request.params.option);

      const userQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")
        .innerJoin("scores", "", "users.id = scores.user_id")
        .where(`scores.responsible_user = ${user}`);
      // No get de usuários não faria sentido retornas as tarefas relacionadas a ele?

      switch (option) {
        // somente pendentes
        case 0:
          userQuery.andWhere("scores.finished = false");
          break;

        // somente finalizadas
        case 1:
          userQuery.andWhere("scores.finished = true");
          break;
        // todas as tarefas
        case 2:
        default:
          break;
      }

      const results = await userQuery.getRawMany()
      return response.status(200).send(results);

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
