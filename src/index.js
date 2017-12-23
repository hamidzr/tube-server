const express = require('express'),
  fse = require('fs-extra'),
  bodyParser = require('body-parser'),
  path = require('path'),
  { exec } = require('child-process-promise'),
  app = express(),
  http = require('http').Server(app),
  debug = require('debug'),
  io = require('socket.io')(http),
  yt = require('./youtube')

const port = process.env.PORT || 5000,
  logger = {
    log: debug('tube:server:log'),
    error: debug('tube:server:error'),
  };

// parse post body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ensure crucial dirs exist
fse.ensureDir('public/media');

// serve static files in public dir
app.use(express.static(path.join(__dirname,'../public')))

// listen for socket connections
// io.on('connection', function(socket) {
//   logger.log('a user connected');
//   socket.on('submission', function(msg) {
//     logger.log(msg);
//   })
//   socket.on('disconnect', function(){
//     logger.log('user disconnected');
//   });
// })

app.get('/ytdl/:id', function(req, res) {
  let quality = req.query.quality || 'mq';
  yt.dl({name: `test-${new Date().getTime()}`, id: req.params.id}, 'mp4', quality)
    .then(path => {
      // emit via socket and push status update
      res.status(200).send(path.substring(6)); // or send the file
    })
  // res.status(200).send('request received');
});

http.listen(port, function() {
  logger.log('Listening on ' + port);
});
