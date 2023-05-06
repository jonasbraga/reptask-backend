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

export class TaskController {
  async create(request: Request, response: Response) {
    try {
      const body = request.body;

      const task = await manager
        .createQueryBuilder()
        .insert()
        .into("tasks")
        .values({
          title: body.title,
          description: body.description ? body.description : null,
          deadline: body.deadline,
        })
        .returning("id")
        .execute();

      if (body.hasOwnProperty("score")) {
        await manager
          .createQueryBuilder()
          .insert()
          .into("public.scores")
          .values({
            task_id: task.raw[0].id,
            responsible_user: body.score.responsible_user,
            value: body.score.value,
            finished: body.score.finished,
          })
          .execute();
      }

      response.status(200).send({
        message: "Tarefa cadastrada com sucesso!",
      });
    } catch (error) {
      return response.status(400).send({
        error: "Houve um erro na aplicação",
        message: error,
      });
    }
  }

  async edit(request: Request, response: Response) {
    try {
      const body = request.body;
      const task_id = request.params.id;

      await manager
        .createQueryBuilder()
        .update("public.tasks")
        .set({
          title: body.title,
          description: body.description ? body.description : null,
          deadline: body.deadline,
        })
        .where(`id = ${task_id}`)
        .execute();

      if (body.hasOwnProperty("score")) {
        await manager
          .createQueryBuilder()
          .update("public.scores")
          .set({
            responsible_user: body.score.responsible_user,
            task_id: task_id,
            value: body.score.value,
            finished: body.score.finished,
          })
          .execute();
      }

      response.status(200).send({
        message: "Tarefa editado com sucesso!",
      });
    } catch (error) {
      return response.status(400).send({
        error: "Houve um erro na aplicação",
        message: error,
      });
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const task_id = request.params.id;
      await manager
        .createQueryBuilder()
        .delete()
        .from("public.tasks")
        .where(`id = ${task_id}`)
        .execute();

      response.status(200).send({
        message: "Tarefa excluído com sucesso!",
      });
    } catch (error) {
      return response.status(400).send({
        error: "Houve um erro na aplicação",
        message: error,
      });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const user = Number(req.params.username);
      const option = Number(req.params.option);

      const taskQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("tasks", "")
        .innerJoin("scores", "","tasks.id = scores.task_id")
        .where(`scores.responsible_user = ${user}`);

      switch (option) {
        // somente pendentes
        case 0:
          taskQuery.andWhere("scores.finished = false");
          return res.status(200).send(await taskQuery.getRawMany());
        // break;

        // somente finalizadas
        case 1:
          taskQuery.andWhere("scores.finished = true");
          return res.status(200).send(await taskQuery.getRawMany());

        // todas as tarefas
        case 2:
        default:
          return res.status(200).send(await taskQuery.getRawMany());
          // break;
      }
    } catch (error) {
      console.log("error");
      console.log(error);
      return res.status(400).send({
        error: "Houve um erro na aplicação",
        message: error,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      
      const tasksQuery = await manager
      .createQueryBuilder()
      .select("*")
      .from("tasks", "")
      .innerJoin("scores", "", 'tasks.id = scores.task_id');
      const user = Number(req.params.username);
      if(user){
        tasksQuery.where(`scores.responsible_user = ${user}`);
        return res.status(200).send(tasksQuery.getRawMany());
      } else {
        return res.status(200).send(tasksQuery.getRawMany());
      }
    } catch (error) {
      console.log("error");
      console.log(error);
      return res.status(400).send({
        error: "Houve um erro na aplicação",
        message: error,
      });
    }
  }
}
