const mediaShares = require("../Models/mediaShares");
const { Get_single_blog } = require("./blog_controller");
const { Get_single_post } = require("./post_controller");
const { Get_single_reel } = require("./reel_controler");
const { Get_Single_user } = require("./user_controller");







const createShares = async (req, res) => {
    try {
        const { reciveirs, contentId, type, userId } = req.body
        await Promise.all(
            reciveirs.map(async f => {
                await mediaShares.create({
                    senderId: userId,
                    recieverId: f,
                    contentId,
                    type
                })
            })
        )
        return res.status(200).send("")
    } catch (error) {
        return res.status(400).send(error);
    }
}



const FilterFriendsWitchShare = async (req, res) => {
    try {
        const { userId } = req.body
        let data = await mediaShares.find({
            $or: [
                {
                    senderId: userId,
                },
                {
                    recieverId: userId
                }
            ]
        }, {
            senderId: 1,
            recieverId: 1
        })

        let organizedDada = {};
        data.map(async m => {
            let friendId = m.senderId == userId ? m.recieverId : m.senderId;
            if (!organizedDada[friendId]) {
                organizedDada[friendId] = {
                    friendData: {},
                }
            }
        })

        await Promise.all(
            Object.keys(organizedDada).map(async k => {
                const friendData = await Get_Single_user(k);
                const lastShare = await mediaShares.find({
                    $or: [
                        {
                            senderId: k,
                        },
                        {
                            recieverId: k
                        }
                    ]
                }).sort({ createAt: -1 }).limit(1);
                let contentData;
                if (lastShare[0].type == "posts") {
                    contentData = await Get_single_post(lastShare[0].contentId);
                }
                if (lastShare[0].type == "reels") {
                    contentData = await Get_single_reel(lastShare[0].contentId);
                }
                if (lastShare[0].type == "blogs") {
                    contentData = await Get_single_blog(lastShare[0].contentId);
                }

                organizedDada[k].friendData = friendData
                organizedDada[k].lastShare = { ...contentData, fromMe: lastShare[0].senderId == userId, sentAt: lastShare[0].createAt, type: lastShare[0].type }
            })
        )

        return res.status(200).json(organizedDada)
    } catch (error) {
        return res.status(400).send("");
    }
}
const getSharedMedia = async (req, res) => {
    try {
        const { userId } = req.body
        const { friendId } = req.query
        let data = await mediaShares.find({
            $or: [
                {
                    senderId: userId,
                    recieverId: friendId
                },
                {
                    senderId: friendId,
                    recieverId: userId
                }
            ]
        }).sort({ createAt: -1 }).limit(20);


        data = await Promise.all(
            data.map(async m => {
                let contentData;
                if (m.type == "posts") {
                    contentData = await Get_single_post(m.contentId);
                }
                if (m.type == "reels") {
                    contentData = await Get_single_reel(m.contentId);
                }
                if (m.type == "blogs") {
                    contentData = await Get_single_blog(m.contentId);
                }

                return { ...m._doc, fromMe: m.senderId == userId, contentData }
            })
        )

        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).send("");
    }
}

module.exports =
{
    getSharedMedia,
    createShares,
    FilterFriendsWitchShare
}