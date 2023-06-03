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
      const userId = Number(request.params.username);
      // const option = Number(request.params.option);

      const userQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("users", "")
        // .innerJoin("scores", "", "users.id = scores.responsible_user")
        .where(`id = ${userId}`);

      const user = await userQuery.getRawOne();
      console.log(user['reps_id']);
      const userPointsQuery = manager
        .createQueryBuilder()
        .select("SUM(value), count(*)")
        .from("scores", "")
        .andWhere(`responsible_user = ${user['id']}`);

      const userPoints = await userPointsQuery.getRawOne();

      user['userPoints'] = userPoints['sum'] ? userPoints['sum'].toString() : 0;
      user['userDoneTasks'] = userPoints['count'] ? userPoints['count'].toString() : 0;


      const repQuery = manager
        .createQueryBuilder()
        .select("name")
        .from("reps", "")
        // .innerJoin("scores", "", "users.id = scores.user_id");
        .where(`id = ${user['reps_id']}`);

      const rep = await repQuery.getRawOne();
      console.log(rep['name']);

      user['reps_id'] = rep['name'];
      return response.status(200).send(user);
      // break;
      // }
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
