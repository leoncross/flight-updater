const server = require('./server/index.js');

server.set('port', process.env.PORT || 8080);

server.listen(server.get('port'), () => {
  console.log(`Express app available at localhost:${server.get('port')}`);
});
