const path = require("path");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const {
  gernerateMessage,
  gernerateLocationMessage,
} = require("./utils/message");
const { Users } = require("./utils/users");

const publicPath = path.join(__dirname + "/../public");
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  // console.log("New user connected");

  // socket.emit(
  //   "newMessage",
  //   gernerateMessage("Admin", "Welcome to the ChatApp")
  // );

  // socket.broadcast.emit(
  //   "newMessage",
  //   gernerateMessage("Admin", "New user joins")
  // );

  socket.on("join", (params) => {
    const { room, name } = params;
    socket.join(room);

    users.addUser(socket.id, name, room);
    io.to(room).emit("usersInRoom", {
      usersInRoom: users.getListOfUsersInRoom(room),
    });

    // io.emit() --> io.to('Ten room').emit
    // socket.broadcast.emit --> socket.broadcast.to('Ten room').emit

    socket.emit(
      "newMessage",
      gernerateMessage("Admin", `Welcome to ${room} room`)
    );

    socket.broadcast
      .to(room)
      .emit("newMessage", gernerateMessage("Admin", `${name} joins`));
  });

  socket.on("createMessage", (message, callback) => {
    // console.log("Message: ", message);
    var user = users.getUserById(socket.id);

    // Gửi thông tin tới tất cả các clients hiện đang listen sự kiện newMessage
    io.to(user.room).emit(
      "newMessage",
      gernerateMessage(message.from, message.text)
    );

    // Gửi thông tin tới tất cả các clients hiện đang listen sự kiện newMessage (ngoại trừ client
    // client vừa mới emit sự kiện newMessage này)
    // socket.broadcast.emit(
    //   "newMessage",
    //   gernerateMessage(message.from, message.text)
    // );

    callback && callback("Message has been sent");
  });

  socket.on("createLocationMessage", (message) => {
    var user = users.getUserById(socket.id);
    io.to(user.room).emit(
      "newNewLocationMessage",
      gernerateLocationMessage(
        message.from,
        message.latitude,
        message.longitude
      )
    );
  });

  socket.on("disconnect", () => {
    // console.log("User was disconnected");
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("usersInRoom", {
        usersInRoom: users.getListOfUsersInRoom(user.room),
      });
      io.to(user.room).emit(
        "createMessage",
        gernerateMessage("Admin", `${user.name} has left the room`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
