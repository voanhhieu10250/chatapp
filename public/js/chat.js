var socket = io();

socket.on("connect", () => {
  console.log("Connected to the server");

  // $.deparam của file deparam.js chứ ko phải của jquery
  socket.emit("join", $.deparam(window.location.search));
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});

socket.on("newMessage", (message) => {
  var template = $("#message__template").html();
  var html = Mustache.render(template, {
    text: message.text,
    from:
      message.from === $.deparam(window.location.search).name
        ? `${message.from} (you)`
        : message.from,
    createAt: moment(message.createAt).format("h:mm A"),
  });
  $("#messages").append(html);

  //   var formattedTime = moment(message.createAt).format("h:mm A");
  //   var li = $("<li></li>");
  //   li.text(`${message.from} ${formattedTime}: ${message.text}`);
  //   $("#messages").append(li);

  $("#messages").scrollTop(
    $("#messages").prop("scrollHeight") + $(window).height()
  );
});

socket.on("newNewLocationMessage", (message) => {
  var template = $("#message__template__location").html();
  var html = Mustache.render(template, {
    url: message.url,
    from:
      message.from === $.deparam(window.location.search).name
        ? `${message.from} (you)`
        : message.from,
    createAt: moment(message.createAt).format("h:mm A"),
  });
  $("#messages").append(html);

  //   var formattedTime = moment(message.createAt).format("h:mm A");
  //   var li = $("<li></li>");
  //   var a = $('<a target="_blank">My current location</a>');
  //   a.attr("href", message.url);
  //   li.text(`${message.from} ${formattedTime}: `);
  //   li.append(a);
  //   $("#messages").append(li);

  $("#messages").scrollTop(
    $("#messages").prop("scrollHeight") + $(window).height()
  );
});

socket.on("usersInRoom", ({ usersInRoom }) => {
  // console.log(usersInRoom);
  var ol = $("<ol></ol>");
  usersInRoom.forEach((u) => {
    const user = $(
      `<li key=${u.id}>${u.name}${
        u.name === $.deparam(window.location.search).name ? " (you)" : ""
      }</li>`
    );
    ol.append(user);
  });
  $("#listUser").html(ol);
});

$("#message-form").on("submit", (event) => {
  event.preventDefault();
  if (!!!$("[name=message]").val().trim()) return;

  socket.emit(
    "createMessage",
    {
      from: $.deparam(window.location.search).name,
      text: $("[name=message]").val(),
    },
    (data) => {
      console.log(data);
    }
  );
  $("[name=message]").val("");
});

$("#send_location").on("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supports on old browser");
  } else {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);

        socket.emit("createLocationMessage", {
          from: $.deparam(window.location.search).name,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        alert("Unable to fetch location");
      }
    );
  }
});
