const express = require('express');
const path = require('path');
const config = require('./config');
const app = express();
const socket = require('socket.io');

const docsRoute = require('./swagger/docs.route');
const router = express.Router();
router.use('/docs', docsRoute);

// test request
app.get('/api/test_template', (req, res) => {
    const template_test = require('./templates/test.json');
    res.json(template_test);
});

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(config.PORT, () => console.log(`Server is running on ${config.PORT}`));

//create a io socket
const io = socket(server);
const connectedUsers = new Set(); //a list of every connection to the socket
io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("new user", function (data) {
        socket.userId = data;
        connectedUsers.add(data);
      });
    
      socket.on("disconnect", () => {
        connectedUsers.delete(socket.userId);
      });
  });