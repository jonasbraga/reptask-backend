import { Response } from 'express'
import { connect } from '../database/index'
require('dotenv').config()
require('dotenv').config()

connect()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  segure: true,
  auth: {
    user: 'reptaskapp@gmail.com',
    pass: 'qwpmaeriqfffjgdr',
  },
})

export class NotificationEmail {
  async sendEmail (email: string, subject: string, text: string, response?: Response) {
    try {
      const mailOptions = {
        from: 'reptaskapp@gmail.com',
        to: email,
        subject,
        text,
      }
      const result = await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro no enviado do email',
      })
    }
  }
}

export class RequestEmailNewRep {
  async sendEmail (email: string, subject: string, text: string, response?: Response) {
    try {
      const mailOptions = {
        from: email,
        to: 'reptaskapp@gmail.com',
        subject,
        text,
      }
      const result = await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error(error)
      return response.status(500).send({
        error: 'Houve um erro no enviado do email',
      })
    }
  }
}
