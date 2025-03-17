const Messages = require("../Models/Messages");


const Get_messagesForUser = async (req, res) => {
    try {
        const { friendId } = req.query;
        const { userId } = req.body;
        let MessagesFound = await Messages.find({
            $or: [
                {
                    $and: [
                        {
                            recieverId: friendId,
                        },
                        {
                            senderId: userId,
                        }
                    ]
                }
                , {
                    $and: [
                        {
                            recieverId: userId,
                        },
                        {
                            senderId: friendId,
                        }
                    ]
                }
            ]
        }).sort({ createAt: -1 }).limit(40);
        return res.status(200).json({ MessagesFound })
    } catch (error) {
        console.log("error getting chats => ", error);
        res.status(500).send(error)
    }
};


const Add_message = (m) => {
    return new Promise(
        async (resolve, reject) => {
            try {
                const res = await Messages.create(m);
                resolve(res)
            } catch (error) {
                reject(error)
            }

        }
    )

}


const SyncMessages = async (req, res) => {
    try {
        const { stoff } = req.body;
        if (stoff) {
            stoff.forEach(async (doc) => {
                doc.savedInDb = true
                await Messages.updateOne({ _id: doc._id }, doc , { upsert: true });
            });
            return res.status(200).send("done");
        }
        return res.status(400).send('there is no stuff');
    } catch (error) {
        return res.status(500).send(error)
    }
}

module.exports = { Get_messagesForUser, Add_message, SyncMessages }