require('dotenv').config();

const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const pool = require('../services/database');

const startConsumer = async () => {

  try {

    // rabbitmq connection
    const connection = await amqp.connect(
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
    );

    const channel = await connection.createChannel();

    const queueName = 'application:created';

    await channel.assertQueue(queueName);

    console.log('RabbitMQ connected');
    console.log('Waiting for messages...');

    // nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,

      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // consume message
    channel.consume(queueName, async (message) => {

      if (message !== null) {

        try {

          const data = JSON.parse(
            message.content.toString()
          );

          const { application_id } = data;

          console.log(
            'Processing application:',
            application_id
          );

          // get application data
          const result = await pool.query(
            `
            SELECT
              applications.id,
              applications.created_at,

              applicant.name AS applicant_name,
              applicant.email AS applicant_email,

              owner.email AS owner_email,

              jobs.title AS job_title,

              companies.name AS company_name

            FROM applications

            JOIN users applicant
              ON applications.user_id = applicant.id

            JOIN jobs
              ON applications.job_id = jobs.id

            JOIN companies
              ON jobs.company_id = companies.id

            JOIN users owner
              ON companies.owner_id = owner.id

            WHERE applications.id = $1
            `,
            [application_id]
          );

          if (!result.rows.length) {

            console.log(
              'Application not found'
            );

            channel.ack(message);

            return;
          }

          const application =
            result.rows[0];

          // send email
          await transporter.sendMail({

            from: process.env.MAIL_USER,

            to: application.owner_email,

            subject: 'New Job Application',

            text: `
New application received

Applicant Name:
${application.applicant_name}

Applicant Email:
${application.applicant_email}

Job Title:
${application.job_title}

Company:
${application.company_name}

Application Date:
${application.created_at}
            `,
          });

          console.log(
            'Email sent successfully'
          );

          // acknowledge message
          channel.ack(message);

        } catch (error) {

          console.log(
            'Consumer processing error:',
            error.message
          );

          channel.ack(message);
        }
      }
    });

  } catch (error) {

    console.log(
      'RabbitMQ connection error:',
      error.message
    );
  }
};

startConsumer();