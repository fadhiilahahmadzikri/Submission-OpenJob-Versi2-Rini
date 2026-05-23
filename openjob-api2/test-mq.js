const amqp = require('amqplib');
require('dotenv').config();

async function test() {
  try {
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`);
    console.log('Success');
    await connection.close();
  } catch (e) {
    console.error(e.message);
  }
}
test();