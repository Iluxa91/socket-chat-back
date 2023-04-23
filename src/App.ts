const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);

const messages = [
    {
        message: "Hello Ilua", id: "asxas", user: {
            id: "sdacsd", name: "victor"
        }
    },
    {
        message: "Hello Victor", id: "asxxssas", user: {
            id: "cdcd", name: "Ilua"
        }
    },
]
const usersState = new Map()

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

app.get("/", (reqL: any, res: any) => {
    res.send("Hello, it's WS server");
});

io.on("connection", (socketChannel: any) => {

    usersState.set(socketChannel, {id: new Date().getTime().toString(), name: "anonym"})

    io.on("disconnect", () => {
        usersState.delete(socketChannel)
    })

    socketChannel.emit("init-messages-published", messages)

    socketChannel.on("client-message-sent", (message: string, successFn: any) => {
        if (typeof message !== "string" || message.length > 50) {
            successFn("Message should be less than 50 chars")
            return
        }

        const user = usersState.get(socketChannel)
        const messageItem = {
            message: message, id: new Date().getTime().toString(), user: {
                id: user.id, name: user.name
            }
        }
        messages.push(messageItem)
        socketChannel.emit("new-message-sent", messageItem)

        successFn(null)
    })

    socketChannel.on("client-typed", () => {
        socketChannel.broadcast.emit("user-typing", usersState.get(socketChannel))
    })

    socketChannel.on("client-name-sent", (name: string) => {
        const user = usersState.get(socketChannel)
        user.name = name
    })

    console.log("a user connected");
});

const PORT = process.env.PORT || 3009

httpServer.listen(PORT, () => {
    console.log("listening on *:3009");
});