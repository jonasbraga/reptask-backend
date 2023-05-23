import { Request, Response } from "express";
import {
  getManager
} from "typeorm";
import { connect } from "../database/index";
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
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async edit(request: Request, response: Response) {
    try {
      const body = request.body;
      const task_id = request.params.id;

      const updateQueries = []

      updateQueries.push(manager
        .createQueryBuilder()
        .update("public.tasks")
        .set({
          title: body.title,
          description: body.description ? body.description : null,
          deadline: body.deadline,
        })
        .where(`id = ${task_id}`)
        .execute());

      if (body.hasOwnProperty("score")) {
        updateQueries.push(manager
          .createQueryBuilder()
          .update("public.scores")
          .set({
            responsible_user: body.score.responsible_user,
            value: body.score.value,
            finished: body.score.finished,
          })
          .where(`task_id = ${task_id}`)
          .execute());
      }

      await Promise.all(updateQueries);

      response.status(200).send({
        message: "Tarefa editada com sucesso!",
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
      const task_id = request.params.id;
      await manager
        .createQueryBuilder()
        .delete()
        .from("public.scores")
        .where(`task_id = ${task_id}`)
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from("public.tasks")
        .where(`id = ${task_id}`)
        .execute();

      response.status(200).send({
        message: "Tarefa excluída com sucesso!",
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
      const option = Number(request.params.option);

      const taskQuery = manager
        .createQueryBuilder()
        .select("*")
        .from("tasks", "")
        .innerJoin("scores", "","tasks.id = scores.task_id");

      const user = Number(request.params.username);
      if(user){
        taskQuery.where(`scores.responsible_user = ${user}`);
      }

      switch (option) {
        // somente pendentes
        case 0:
          taskQuery.andWhere("scores.finished = false");
          break;

        // somente finalizadas
        case 1:
          taskQuery.andWhere("scores.finished = true");
          break;

        // todas as tarefas
        case 2:
        default:
          break;
      }
      const results = await taskQuery.getRawMany()
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
      const tasksQuery = manager
      .createQueryBuilder()
      .select("*")
      .from("tasks", "")
      .innerJoin("scores", "", 'tasks.id = scores.task_id');

      const user = Number(request.params.username);
      if(user){
        tasksQuery.where(`scores.responsible_user = ${user}`);
      }
      const results = await tasksQuery.getRawMany();

      return response.status(200).send(results);
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }
}
