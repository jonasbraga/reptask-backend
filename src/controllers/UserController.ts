import { connect } from "../database/index";
import { Request, Response } from "express";
import {
  getConnectionManager,
  getManager,
  getConnection,
  InsertResult,
} from "typeorm";
require("dotenv").config();

connect();
const manager = getManager();

export class UserController {
  async create(request: Request, response: Response) {
    try {
      console.log(request);
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

      response.status(200).send({
        message: "Usuário cadastrada com sucesso!",
      });
    } catch (error) {
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async get(request: Request, response: Response) {
    try {
      const user = Number(request.params.username);
      const option = Number(request.params.option);

      const taskQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")
        .innerJoin("scores", "", "users.id = scores.user_id")
        .where(`scores.responsible_user = ${user}`);

      switch (option) {
        // somente pendentes
        case 0:
          taskQuery.andWhere("scores.finished = false");
          return response.status(200).send(await taskQuery.getRawMany());
        // break;

        // somente finalizadas
        case 1:
          taskQuery.andWhere("scores.finished = true");
          return response.status(200).send(await taskQuery.getRawMany());

        // todas as tarefas
        case 2:
        default:
          return response.status(200).send(await taskQuery.getRawMany());
        // break;
      }
    } catch (error) {
      console.log("error");
      console.log(error);
      console.log(error);
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

      var results = await usersQuery.getRawMany();
      console.log(results);
      return response.status(200).send(results);

    } catch (error) {
      console.log("error");
      console.log(error);
      console.log(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }
}
