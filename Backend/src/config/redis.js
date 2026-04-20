const { createClient } = require('redis');



const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-11275.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 11275
    }
});

module.exports= redisClient;