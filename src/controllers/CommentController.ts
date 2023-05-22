import { Request, Response } from "express";
import {
  getManager
} from "typeorm";
import { connect } from "../database/index";
require("dotenv").config();

connect();
const manager = getManager();

export class CommentController {
  async create(request: Request, response: Response) {
    try {
      const body = request.body;

      const comment = await manager
        .createQueryBuilder()
        .insert()
        .into("public.comments")
        .values({
          task_id: body.task_id,
          user_id: body.user_id,
          comment: body.comment,
        })
        .execute();

      if (comment) {
        return response.status(200).send({
          message: "Comentário cadastrado com sucesso!",
        });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }

  async get(request: Request, response: Response){
    try {

        const task = request.params.task;

        if(task){
            const comments = await manager.createQueryBuilder()
            .select('*')
            .from('comments','')
            .where(`task_id = ${task}`)
            .getRawMany();

            return response.status(200).send(comments);
        } else {
            return response.status(500).send({
                error: "Houve um erro na aplicação",
                message: "Erro ao buscar comentários da tarefa",
              });
        }



    } catch (error) {
      console.error(error);
      return response.status(500).send({
        error: "Houve um erro na aplicação"
      });
    }
  }
}
