module.exports = {
    database: 'mongodb+srv://ilyaseen19:Rafail19@assets-reg-1.t8uk3.mongodb.net/Real-Estate?retryWrites=true&w=majority',
    server: {
      port: process.env.PORT || 8900,
    },
  
    //reduse expiry time
    jwt: {
      secret: 'djkfsnf63',
      expiresIn: '365d',
    },
  };
  