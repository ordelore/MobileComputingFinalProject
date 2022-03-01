const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

const rooms = {};

function emitMessageTo(msg, userID, socket){
  console.log('emit test to', userID)
  socket.to(userID).emit("receiving message", msg)
}

io.on('connection', socket => {
    /*
        If a peer is initiator, he will create a new room
        otherwise if peer is receiver he will join the room
    */
    socket.on('join room', roomID => {
      console.log('a user joined!')
        if(rooms[roomID]){
            // Receiving peer joins the room
            rooms[roomID].push(socket.id)
        }
        else{
            // Initiating peer create a new room
            rooms[roomID] = [socket.id];
        }
        /*
            If both initiating and receiving peer joins the room,
            we will get the other user details.
            For initiating peer it would be receiving peer and vice versa.
        */
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if(otherUser){
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }

        // send the socket id to current user in the room
        const currentUser = socket.id;
        io.to(currentUser).emit("userID", socket.id);

        socket.on("sending message", msg => {
          console.log('Server received message:', msg.text, 'from', msg.userID);
          const otherUser = rooms[roomID].find(id => id !== socket.id);
          // send message to other user
          emitMessageTo(msg, otherUser, socket)
        })

        socket.on("touch wall", msg => { // TODO: receive message from canvas when ball bounce
          let userIdx = rooms[roomID].indexOf(msg.userID);
          // consider phones in a line left to right where list of users determines order
          if ((userIdx < rooms[roomID].length - 1) && (msg.wall == "right")) { // if phone to left of another phone
            io.to(msg.userID).emit("remove ball", msg.ballColor);
            io.to(rooms[roomID][userIdx+1]).emit("add ball", {ballX: 0, ballY: msg.ballY, ballRadius: msg.ballRadius, ballColor: msg.ballColor, ballDx: msg.ballDx, ballDy: msg.ballDy});
          } // TODO: when ball moves too fast, moving between screens is buggy
          if ((userIdx >> 0) && (msg.wall == "left")) { // if phone to right of another phone
            io.to(msg.userID).emit("remove ball", msg.ballColor);
            io.to(rooms[roomID][userIdx-1]).emit("add ball", {ballX: 1000000, ballY: msg.ballY, ballRadius: msg.ballRadius, ballColor: msg.ballColor, ballDx: msg.ballDx, ballDy: msg.ballDy})
          }
        })

    });
  });




server.listen(9000, () => console.log("Server is up and running on Port 9000"));
