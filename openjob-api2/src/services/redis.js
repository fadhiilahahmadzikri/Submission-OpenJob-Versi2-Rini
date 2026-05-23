const redis = require('redis');

require('dotenv').config();

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => {
  console.log('Redis Error:', err.message);
});

(async () => {
  try {

    await redisClient.connect();

    console.log('Redis connected');

  } catch (error) {

    console.log('Redis connection failed');
  }
})();

module.exports = redisClient;