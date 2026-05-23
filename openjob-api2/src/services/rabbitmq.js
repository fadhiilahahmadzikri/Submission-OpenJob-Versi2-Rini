require('dotenv').config();

const amqp = require('amqplib');

const connectRabbitMQ = async () => {

  try {

    const connection = await amqp.connect(
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
    );

    const channel = await connection.createChannel();

    console.log('RabbitMQ connected');

    return channel;

  } catch (error) {

    console.log(
      'RabbitMQ Error:',
      error.message
    );

    throw error;
  }
};

module.exports = connectRabbitMQ;