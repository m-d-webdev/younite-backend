let localSocket, localio;

const users = new Map();


const socketEvents = (socket, io) => {
    localio = io;
    let { userId, freinds } = socket.handshake.query;
    localSocket = socket;
    if (freinds) {
        freinds = JSON.parse(freinds);
    }

    users.set(userId, socket.id)

    if (Array.isArray(freinds)) {
        freinds.forEach(f => {
            if (users.has(f)) {
                socket.to(users.get(f)).emit('friend-connected', { friendId: userId });
                socket.emit('friend-connected', { friendId: f })
            }
        });
    }

    socket.on('new-massage', async (m) => {
        socket.to(users.get(m.recieverId)).emit('message-recieved', m);
    })

    socket.on("message-added", m => {
        socket.to(users.get(m.reciverId)).emit("massage-added-on-friend", m)
    })
    socket.on("friend-viewed-messages", m => {
        socket.to(users.get(m.recieverId)).emit("friendviewedmymessages", { id: m.senderId })
    })

    socket.on("typing-message", e => {
        socket.to(users.get(e.recieverId)).emit("friend-typing-message", e)
    })

    socket.on("cancel-typing-message", e => {
        socket.to(users.get(e.recieverId)).emit("friend-cancel-typing-message", e)
    });

    socket.on('friend-blocked', doc => {
        socket.to(users.get(doc.Blocked_person)).emit("friend-blocked-me", doc)
    });

    socket.on('friend-Unblocked', doc => {
        socket.to(users.get(doc.Blocked_person)).emit("friend-unblocked-me", doc._id)
    });

    socket.on('disconnect', c => {
     
        if (Array.isArray(freinds)) {
            freinds.forEach(f => {
                if (users.get(f)) {
                    socket.to(users.get(f)).emit('friend-disconnected', { friendId: userId })
                }
            });

        };
        users.delete(userId)
    });
}
const NewSocketEmit = (to, ev, data) => {
    if (users.get(to)) {
        localio.to(users.get(to)).emit(ev, data);
    }
}

module.exports = { socketEvents, NewSocketEmit }