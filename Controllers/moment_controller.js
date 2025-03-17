const Moment = require("../Models/Moments")
const Follows = require("../Models/Follow")
const Users = require("../Models/Users")
const { _IMG_UPLOADER, _MOMENT_VIDEO_UPLOADER } = require("../Controllers/file_uploads")
const { Put_notification } = require("./Notification_controller")

const CreateMoment = async (req, res) => {
    try {
        const { userId, content, type, style } = req.body;
        switch (type) {
            case 'text':
                if (content == "") return res.status(400).send("failed to create moment without content");
                const res_crea = await Moment.create({
                    authorId: userId,
                    type,
                    style,
                    content
                })
                // Put_notification(userId, [], 'new', res_crea._id, "moment")

                res.status(200).json({ message: "Text moment has been successfully saved", moment: res_crea })
                break;
            case "image":
                const { file } = req.files
                if (!file) return res.status(400).send("no FIles on the request ! ")
                const url = await _IMG_UPLOADER(file)
                if (url) {
                    const res_crea = await Moment.create({
                        authorId: userId,
                        type,
                        content,
                        url
                    })
                    // Put_notification(userId, [], 'new', res_crea._id, "moment");
                    res.status(200).json({ message: "Image moment has been successfully saved", moment: res_crea })
                } else {
                    res.status(500).json({ message: "Failed tp save your moment image " })
                }
                break;
            case "video":
                const videofile = req.files.file
                if (!videofile) return res.status(400).send("no FIles on the request ! ")
                const url_video = await _MOMENT_VIDEO_UPLOADER(videofile);
                if (url_video) {
                    const res_crea = await Moment.create({
                        authorId: userId,
                        type,
                        content,
                        url: url_video
                    });

                    // Put_notification(userId, [], 'new', res_crea._id, "moment");
                    res.status(200).json({ message: "Video moment has been successfully saved", moment: res_crea });

                } else {
                    res.status(500).json({ message: "Failed tp save your moment image " })
                }
                break;

        }

    } catch (error) {
        console.log("Error creating the moment => ", error);
        return res.status(500).send("error creating the moment")
    }
}

const Get_current_moments = async (req, res) => {
    try {
        const { userId } = req.body
        const user_followings = await Follows.findOne({ user_id: userId }, { _id: 0, following: 1 });
        let NewMoments = await Moment.aggregate([
            {
                $match: { authorId: { $in: user_followings.following } }
            },
            {
                $group: {
                    _id: "$authorId",
                    count: { $sum: 1 },
                    moments: { $push: "$$ROOT" }
                }
            },
            {
                $unwind: "$moments"
            },
            {
                $sort: { "moments.createAt": -1 }
            },
            {
                $group: {
                    _id: "$_id",
                    count: { $first: "$count" },
                    moments: { $push: "$moments" }
                }
            }
        ]).exec();

        NewMoments = await Promise.all(
            NewMoments.map(async (f) => {
                const author = await Users.findOne({ _id: f._id }, { _id: 0, profile_img: 1, FirstName: 1, LastName: 1 });
                return {
                    ...f, author
                }
            })
        );

        return res.status(200).json({ NewMoments })
    } catch (error) {
        console.log("Error geting moment => ", error);
        return res.status(500).send("Failed to get Current moments => " + error)
    }
}


const Get_user_moments = async (req, res) => {
    try {

        const { userId } = req.body
        let user_moments = await Moment.find({ authorId: userId }).sort({ createAt: -1 })
        return res.status(200).json({ user_moments });

    } catch (error) {
        console.log("Error geting moment for user  => ", error);
        return res.status(500).send("Failed to get user moments => " + error)
    }
}


const declare_view_moment = async (req, res) => {
    try {
        const { userId, moment_id } = req.body;
        console.log(moment_id);

        let updateRes = await Moment.updateOne({ _id: moment_id }, { $addToSet: { views: [userId] } })
        console.log(updateRes);

        return res.status(200).send(updateRes)
    } catch (error) {
        console.log(error);
        return res.status(402).send("Failed to declare view")
    }
}


const store_moment_replay = async (req, res) => {
    try {
        const { content, momentId, userId } = req.body

        const Res_up = await Moment.updateOne(
            { _id: momentId },
            {
                $push: {
                    replies: {
                        content, authorId: userId
                    }
                }
            }
        )
        if (Res_up.modifiedCount) {
            return res.status(200).send("Replay submited")
        }
        else {
            return res.status(400).send("Failed to save the peplay")
        }
    } catch (error) {
        console.log('falied to store the moment replay => ', error);

        return res.status(400).send("Failed to save the peplay")
    }
}

const get_moment_interaction = async (req, res) => {
    try {
        const { momentId } = req.query;
        const inter = await Moment.findOne({ _id: momentId }, { views: 1, replies: 1, _id: 0 })
        let views = await Users.find({ _id: { $in: inter.views } }, { _id: 1, profile_img: 1, FirstName: 1, LastName: 1 })
        let replies = await Promise.all(
            inter.replies.map(async (r) => {
                let author = await Users.findOne({ _id: r.authorId }, { _id: 0, profile_img: 1, FirstName: 1, LastName: 1 });
                return { ...r._doc, author }
            })
        );
        replies = replies.sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
        return res.status(200).json({ views, replies });
    } catch (error) {
        return res.status(500).send("Failed to get moment interactrion => " + error)
    }
}


module.exports = { CreateMoment, Get_current_moments, store_moment_replay, Get_user_moments, declare_view_moment, get_moment_interaction }