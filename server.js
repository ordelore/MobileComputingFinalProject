const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

const rooms = {};

function emitMessageTo(msg, userID, socket){
  io.to(userID).emit("receiving message", msg)
}

io.on('connection', socket => {
    /*
        If a peer is initiator, he will create a new room
        otherwise if peer is receiver he will join the room
    */
    socket.on('join room', roomID => {
        if(rooms[roomID]){
            // Receiving peer joins the room
            rooms[roomID].push(socket.id)
        }
        else{
            // Initiating peer create a new room
            rooms[roomID] = [socket.id];
        }
        rooms[roomID].forEach(user => {
          io.to(user).emit("new user", rooms[roomID].length);
        });

        // send the socket id to current user in the room
        const currentUser = socket.id;
        io.to(currentUser).emit("userID", socket.id);

        socket.on("sending message", msg => {
          const otherUser = rooms[roomID].find(id => id !== socket.id);
          // send message to other user
          emitMessageTo(msg, otherUser, socket)
        })

        socket.on("touch wall", msg => {
          let userIdx = rooms[roomID].indexOf(msg.userID);
          // consider phones in a line left to right where list of users determines order
          if (msg.wall == "right") {
            let newRoomIdx = (userIdx == rooms[roomID].length-1) ? 0 : userIdx+1;
            io.to(msg.userID).emit("remove ball", msg.ballColor);
            io.to(rooms[roomID][newRoomIdx]).emit("add ball", {ballX: 0, ballY: msg.ballY, ballRadius: msg.ballRadius, ballColor: msg.ballColor, ballDx: msg.ballDx, ballDy: msg.ballDy});
          }
          if (msg.wall == "left") {
            let newRoomIdx = (userIdx == 0) ? rooms[roomID].length-1 : userIdx-1;
            io.to(msg.userID).emit("remove ball", msg.ballColor);
            io.to(rooms[roomID][newRoomIdx]).emit("add ball", {ballX: 1000000, ballY: msg.ballY, ballRadius: msg.ballRadius, ballColor: msg.ballColor, ballDx: msg.ballDx, ballDy: msg.ballDy})
          }
          if (msg.wall == "top") {
            let numTop = rooms[roomID].length - 3;
            let zoneLen = Math.ceil(msg.canvWidth / numTop);
            let zoneId = Math.floor(msg.ballX / zoneLen);
            let thisIdx = rooms[roomID].indexOf(msg.userID);
            let newRoomIdx = thisIdx - 2 - zoneId;
            if (newRoomIdx < 0) {
              newRoomIdx = rooms[roomID].length + newRoomIdx;
            }
            io.to(msg.userID).emit("remove ball", msg.ballColor);
            io.to(rooms[roomID][newRoomIdx]).emit("add ball", {ballX: msg.ballX, ballY: 0, ballRadius: msg.ballRadius, ballColor: msg.ballColor, ballDx: msg.ballDx, ballDy: -(msg.ballDy)}) // maybe issue with toBottom/ vertical direction
          }
        })

    });
  });




server.listen(9000, () => console.log("Server is up and running on Port 9000"));
