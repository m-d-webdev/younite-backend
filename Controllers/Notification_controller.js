const express = require('express');
const NotificationModel = require("../Models/Notification");
const UserModel = require("../Models/Users");
const FollowModel = require('../Models/Follow');
const PostsModel = require('../Models/Posts');
const BlogsModel = require('../Models/Blogs');
const ReelsModel = require('../Models/Reels');
const CommentsModel = require('../Models/Comments');
const RepliesModel = require('../Models/Replies');

const { NewSocketEmit } = require('../socket');
const { Get_single_post } = require('./post_controller');
const { Get_single_reel } = require('./reel_controler');
const { Get_single_blog } = require('./blog_controller');

const Put_notification = async (userId, recipients, type, contentId, content_type) => {
    try {
        if (["start_following", "checked_followings", "checked_followers", "viewed_profile"].includes(type)) {
            if (recipients[0] == "*") return;
            const nt_id = await NotificationModel.create({
                senderId: userId, recipients, type,
            })
            // ------ Create notification => 

            let sender = await UserModel.findOne({ _id: userId }, { FirstName: 1, LastName: 1, profile_img: 1 });
            let message;

            switch (type) {
                case "checked_followings":
                    message = `${sender.FirstName}  ${sender.LastName}  checked your followings list`
                    break;
                case "start_following":
                    message = `${sender.FirstName}  ${sender.LastName}  is now one of your followers`
                    break;
                case "checked_followers":
                    message = `${sender.FirstName}  ${sender.LastName}  checked your followers list`
                    break;
                case "viewed_profile":
                    message = `${sender.FirstName}  ${sender.LastName}  took a look at your profile`
                    break;
            }
            NewSocketEmit(recipients[0], "new-notification",
                {
                    _id: nt_id._id,
                    senderId: userId, sender, type,
                    message

                }
            )



        }
        if (['like', "comment", "replay"].includes(type)) {
            if (recipients[0] == "*") return;
            if (!contentId || !content_type) return;
            const nt_id = await NotificationModel.create({
                senderId: userId, recipients, type, contentId, content_type
            });

            // ------ Create notification => 
            let sender = await UserModel.findOne({ _id: userId }, { FirstName: 1, LastName: 1, profile_img: 1 });
            let message;
            let contentType = content_type
            switch (type) {
                case "like":
                    if (contentType.charAt(contentType.length - 1) == "s") contentType = contentType.substring(0, contentType.length - 1)
                    message = `${sender.FirstName}  ${sender.LastName}  gave your ${contentType} a like`
                    break;
                case "comment":
                    if (contentType.charAt(contentType.length - 1) == "s") contentType = contentType.substring(0, contentType.length - 1)
                    message = `${sender.FirstName}  ${sender.LastName}   left a comment on your  ${contentType} `
                    break;
                case "replay":
                    message = `${sender.FirstName}  ${sender.LastName}  replay to your comment`
                    break;
            }

            NewSocketEmit(recipients[0], "new-notification", {
                _id: nt_id._id,
                senderId: userId,
                sender,
                type,
                content_type,
                contentId,
                message

            })
        }
        if (type == "new") {
            recipients = await FollowModel.findOne({ user_id: userId }, { _id: 0, followers: 1 })
            const nt_id = await NotificationModel.create({
                senderId: userId, recipients: recipients.followers, type, contentId, content_type
            });
            // ------ Create notification => 
            let sender = await UserModel.findOne({ _id: userId }, { FirstName: 1, LastName: 1, profile_img: 1 });
            recipients.followers.forEach(async element => {
                NewSocketEmit(element, "new-notification", {
                    _id: nt_id._id, senderId: userId, sender, type, contentId, content_type,
                    message: `${sender.FirstName}  ${sender.LastName}  published a fresh ${content_type} `

                })
            });
        }
        if (type == "new-contact") {
            let nt_id = await NotificationModel.create({
                senderId: userId, recipients, type
            });
            // ------ Create notification => 
            let sender = await UserModel.findOne({ _id: userId }, { FirstName: 1, LastName: 1, profile_img: 1 });
            NewSocketEmit(recipients[0], "new-notification", {
                _id: nt_id._id,
                senderId: userId, sender, type,
                message: `${sender.FirstName}  ${sender.LastName}  added you to his contacts`

            })
        }
        if (type == "new-contact-req") {
            if (recipients[0] == "*") return;
            const nt_id = await NotificationModel.create({
                senderId: userId, recipients, type
            });
            // ------ Create notification => 
            let sender = await UserModel.findOne({ _id: userId }, { FirstName: 1, LastName: 1, profile_img: 1 });
            NewSocketEmit(recipients[0], "new-notification", {
                _id: nt_id._id,
                senderId: userId, sender, type,
                message: `${sender.FirstName}  ${sender.LastName}  want to be one of your contacts`
            })
        }

    } catch (error) {
        console.log(error);

    }
}

const filter_notification = async (req, res) => {
    try {
        const { userId } = req.body
        const Noti = await NotificationModel.find({ recipients: userId, isRead: false }).sort({ createAt: -1 }).limit(30);
        const AllNotification = await Promise.all(
            Noti.map(async n => {
                let sender = await UserModel.findOne({ _id: n.senderId }, { FirstName: 1, LastName: 1, profile_img: 1 });
                let message;
                let contentType = n.content_type;
                switch (n.type) {
                    case "checked_followings":
                        message = `${sender.FirstName}  ${sender.LastName}  checked your followings list`
                        break;
                    case "start_following":
                        message = `${sender.FirstName}  ${sender.LastName}  is now one of your followers`
                        break;

                    case "checked_followers":
                        message = `${sender.FirstName}  ${sender.LastName}  checked your followers list`
                        break;
                    case "viewed_profile":
                        message = `${sender.FirstName}  ${sender.LastName}  took a look at your profile`
                        break;
                    case "like":
                        if (contentType.charAt(contentType.length - 1) == "s") contentType = contentType.substring(0, contentType.length - 1)
                        message = `${sender.FirstName}  ${sender.LastName}  gave your ${contentType} a like`
                        break;
                    case "comment":
                        if (contentType.charAt(contentType.length - 1) == "s") contentType = contentType.substring(0, contentType.length - 1)
                        message = `${sender.FirstName}  ${sender.LastName}   left a comment on your  ${contentType} `
                        break;
                    case "replay":
                        message = `${sender.FirstName}  ${sender.LastName}  replay to your comment`
                        break;
                    case "new":
                        message = `${sender.FirstName}  ${sender.LastName}  published a fresh ${n.content_type} `
                        break;
                    case "new-contact":
                        message = `${sender.FirstName}  ${sender.LastName}  added you to his contacts `;
                        break;
                    case "new-contact-req":
                        message = `${sender.FirstName}  ${sender.LastName}  want to be one of your contacts  `;
                        break;
                    default:
                        message = `Unknown notification from ${sender.FirstName}  ${sender.LastName} `
                        break;
                }
                return { ...n._doc, sender, message }

            })
        )
        return res.status(200).json({ AllNotification })
    } catch (error) {
        console.log(error);

        return res.status(402).send(error)
    }
}
const describNotification = async (req, res) => {
    try {
        const { userId } = req.body;
        const { not } = req.query;

        if (["new", "like", 'comment', "replay"].includes(not.type)) {
            let contentBody, targetComent, targetReplay;
            switch (not.content_type) {
                case "reels":
                    contentBody = await Get_single_reel(not.contentId);
                    break;
                case "blogs":
                    contentBody = await Get_single_blog(not.contentId);
                    break;
                case "post":
                    contentBody = await Get_single_post(not.contentId);
                    break;
                case "posts":
                    contentBody = await Get_single_post(not.contentId);
                    break;
                case "comments":
                    targetComent = await CommentsModel.findOne({ _id: not.contentId });
                    switch (targetComent.collection_ref) {
                        case "reels":
                            contentBody = await Get_single_reel(targetComent.articleId);

                            break;
                        case "blogs":
                            contentBody = await Get_single_blog(targetComent.articleId);
                            break;
                        case "posts":
                            contentBody = await Get_single_post(targetComent.articleId);
                            break;
                    }
                    // contentBody = await CommentsModel.findOne({ _id: not.contentId });
                    break;
                case "replay":
                    targetReplay = await RepliesModel.findOne({ _id: not.contentId })
                    if (targetReplay) {
                        targetComent = await CommentsModel.findOne({ _id: targetReplay.commentId });
                        switch (targetComent.collection_ref) {
                            case "reels":
                                contentBody = await Get_single_reel(targetComent.articleId);
                                break;
                            case "blogs":
                                contentBody = await Get_single_blog(targetComent.articleId);
                                break;
                            case "posts":
                                contentBody = await Get_single_post(targetComent.articleId);
                                break;
                        }
                        break;
                    }
                    else return res.status(404).send("not found")
                default:
                    contentBody = {}
                    break;
            };

            if (not.type == "comment") {
                targetComent = await CommentsModel.findOne({ articleId: not.contentId, collection_ref: not.content_type });
            }

            return res.status(200).json({ contentBody, targetComent, targetReplay });
        }



    } catch (error) {
        console.log('Failed to get not => ', error);

        return res.status(400).send(error);
    }
}
module.exports = { Put_notification , filter_notification, describNotification }