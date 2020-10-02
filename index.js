const express = require("express");
const path = require("path");
const config = require("./config");
const app = express();
const socket = require("socket.io");
const http = require('http').Server(app);


// Swagger
const swaggerUi = require("swagger-ui-express");
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger/docs/components.yaml');
app.use("/games/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// test request
app.get("/api/test_template", (req, res) => {
  const template_test = require("./templates/test.json");
  res.json(template_test);
});

// set static folder
app.use(express.static(path.join(__dirname, "public")));

const server = http.listen(config.PORT, () =>
  console.log(`Server is running on ${config.PORT}`)
);

//create a io socket
const io = socket(http);
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
