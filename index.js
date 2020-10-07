const express = require("express");
const path = require("path");
const config = require("./config");
const app = express();
const socket = require("socket.io");
const http = require('http').Server(app);


// Swagger
const swaggerUi = require("swagger-ui-express");
const YAML = require('yamljs');
const { json } = require("express");
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

// Map <SessionId, GameState>
var openSessions = new Map();

//create a io socket
const io = socket(http);
const connectedUsers = new Set(); //a list of every connection to the socket
io.on("connection", function(socket) {
    console.log("Made socket connection");

    socket.on("connect", (data) => {
        console.log("Client Connected: " + data);
    });

    socket.on("disconnect", () => {
        console.log("Disconnecting");
        connectedUsers.delete(socket.userId);
    });

    socket.on("joinGame", (data) => {
        handleJoinGameMessage(data, socket);
    });

    socket.on("updateGame", (data) => {
        handleUpdateGameMessage(data);
    });

    socket.on("playerResult", (data) => {
        handlePlayerResultMessage(data);
    });
});


function handleJoinGameMessage(data, socket) {
    console.log("Recieved Join Message: " + JSON.stringify(data));

    // Join Room that will be subscribed
    socket.join(data.sessionId);
    if (openSessions.get(data.sessionId) == undefined) {
        // Create new Session  
        let currentGame = createSession(data.sessionId, data.gameType, data.playerName);
        openSessions.set(data.sessionId, currentGame);

        io.to(data.sessionId).emit("updateGame", currentGame);
        socket.on("updateGame", handleUpdateGameMessage);

    } else {
        // use existing Session
        console.log("Existing Session!" + openSessions.get(data.sessionId));

        // Update Gamesession
        let currentGame = openSessions.get(data.sessionId);
        currentGame.gameState.players.push(data.playerName);
        // TODO further update Details

        // Send new State in Room to every listener
        io.to(data.sessionId).emit("updateGame", openSessions.get(data.sessionId).gameState);
    }
};

/*
currentSession {
  gameState : {
    ...
    sessionId : string,
    players : [],
    ...
  }
}
*/

function createSession(sessionId, gameType, playerName) {
    var session = {
        sessionId: sessionId,
        gameState: {
            players: [playerName],
            gameType: gameType,
        }
    }
    return session;
}


function handleUpdateGameMessage(data) {
    console.log("Update Game" + JSON.stringify(data));
};

function handlePlayerResultMessage(data, socket) {
    console.log(JSON.stringify(data));
};