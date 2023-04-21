import { connect } from "../database/index";
import { Request, Response } from "express";
import { getConnectionManager, getManager, getConnection } from "typeorm";
require("dotenv").config();
import moment from "moment-timezone";

connect();
const manager = getManager();

export class ExampleController {
  async create(request: Request, response: Response) {
    try {
      const body = request.body;
      await manager
        .createQueryBuilder()
        .insert()
        .into("public.example")
        .values({
          body,
        })
        .execute();

        response.status(200).send({
            message: 'Example cadastrado com sucesso!'
        })
    } catch (error) {
      return response.status(400).send({
        error: "Houve um erro na aplicação",
        message: error,
      });
    }
  }

  async edit(request: Request, response: Response){
    try {
        const body = request.body;
        await manager
          .createQueryBuilder()
          .update('public.example')
          .set({
            body,
          })
          .execute();
  
          response.status(200).send({
              message: 'Example editado com sucesso!'
          })
      } catch (error) {
        return response.status(400).send({
          error: "Houve um erro na aplicação",
          message: error,
        });
      }
  }

  async delete(request: Request, response: Response){
    try {
        const id = request.params.id;
        await manager
          .createQueryBuilder()
          .delete()
          .from('public.example')
          .where(`id = ${id}`)
          .execute();
  
          response.status(200).send({
              message: 'Example excluído com sucesso!'
          })
      } catch (error) {
        return response.status(400).send({
          error: "Houve um erro na aplicação",
          message: error,
        });
      }
  }

  async get(response: Response){
    try {
        const example = await manager
          .createQueryBuilder()
          .select('*')
          .from('public.example','Example')
          .getRawMany();
  
          response.status(200).send(example);
      } catch (error) {
        return response.status(400).send({
          error: "Houve um erro na aplicação",
          message: error,
        });
      }
  }

}
