const express = require("express");
const m = require('mongoose')
const bcrypt = require("bcrypt")
const UserModel = require("../Models/Users")
const jwt = require('jsonwebtoken')
const path = require("path");
const Likes = require("../Models/Likes");
const Follow = require('../Models/Follow');
const Moment = require('../Models/Moments')
const Posts = require("../Models/Posts")
const Reels = require("../Models/Reels");
const MessagesModel = require('../Models/Messages')
const Blogs = require("../Models/Blogs");
const { Put_notification } = require("./Notification_controller");
const UserContacts = require("../Models/UserContacts");
const NotificationModel = require("../Models/Notification")
const { Add_message } = require("./Messages_controller");
const Blockes = require("../Models/Blockes");
const { UPLOAD_FILE_TO_S3 } = require("../config/s3");




const FilterIds = (main = [], ids = []) => {
    return main.filter(e => !ids.includes(e.toString()))
}




const Login_user = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email })
        if (!user) {
            req.session.error_login = "Login error: Check your credentialsl";
            req.session.email = email;
            return res.redirect(`/login`);
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
            res.redirect(`http://localhost:3000/?_access_token=${token}`);
        } else {
            req.session.error_login = "Login error: Check your credentialsl";
            req.session.email = email;
            res.redirect(`/login`);
        }

    } catch (error) {
        console.log(error.message);
    }
}


const StoreNewUser = async (req, res) => {
    try {

        const { FirstName, LastName, day, month, year, email, password } = req.body
        let user = await UserModel.create({ FirstName, LastName, BirthDay: `${year}-${month}-${day}`, email, password })
        await Follow.create({ user_id: user._id });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

        return res.redirect(`http://localhost:3000/?_access_token=${token}`)
    } catch (error) {
        req.session.FirstName = req.body.FirstName;
        req.session.LastName = req.body.LastName;
        req.session.email = error.keyValue.email
        if (error.code === 11000 && error.keyValue.email) {
            req.session.error_duplicate_email = "Email already in use"
        }
        res.redirect('/register');
    }
}

const Update_profile_picture = async (req, res) => {
    try {

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const url = await UPLOAD_FILE_TO_S3({ file: req.files.profile_pic, folderName: "profile_pics" })
        if (!url) return res.status(500).json({ message: 'Failed to update your profile picture on the database ' });
        const update_db = await UserModel.updateOne({ "_id": req.body.userId }, { $set: { profile_img: url } })
        if (update_db.modifiedCount == 1) {
            return res.status(200).json({ message: 'Img Saved successfully ', img_url: url });
        } else {
            console.log(update_db);
            return res.status(500).json({ message: 'Failed to update your profile picture on the database ' });

        }

    } catch (error) {
        console.log(error.message);

        return res.status(400).json({ message: error.message })
    }
}


const get_all_user_data = async (req, res) => {
    try {
        const { userId } = req.body;
        let user = await UserModel.findOne({ '_id': userId }, { FirstName: 1, profile_img: 1, LastName: 1 })
        let likes = await Likes.find({ userId: userId }, { userId: 0, __v: 0 });
        let follows = await Follow.findOne({ user_id: userId }, { followers: 1, following: 1 })
        let viewed_moments = await Moment.find({ views: userId }, { _id: 1 })
        viewed_moments = viewed_moments.map(v => v._id)
        let contactsQuer = await UserContacts.findOne({ userId }, { _id: 0, contacts: 1 });;
        let requestsContact = await NotificationModel.find({ recipients: userId, type: "new-contact-req" }, { _id: 0, senderId: 1 });
        requestsContact = requestsContact.map(e => e.senderId);

        let BlockesAndBlocked = await Blockes.find({
            $or: [
                {
                    Blocker: userId
                },
                {
                    Blocked_person: userId
                },
            ]
        });
        const blockedList = BlockesAndBlocked.filter(el => el.Blocker == userId)
        const blockersList = BlockesAndBlocked.filter(el => el.Blocked_person == userId)
        return res.status(200).json({ ...user?._doc, likes: likes, followers: follows?.followers || [], blockedList, blockersList, following: follows?.following || [], viewed_moments, contacts: contactsQuer?.contacts || [], requestsContact });
    } catch (error) {
        console.log("Failed to get all user data => ", error);
        res.status(400).json({ error: error })
    }
}

const get_profile_personal_info = async (req, res) => {
    try {

        const { userId } = req.body;
        let user = await UserModel.findOne({ _id: userId }, { email: 1, bio: 1, links: 1, BirthDay: 1, FirstName: 1, profile_img: 1, LastName: 1 })
        let follows = await Follow.findOne({ user_id: userId }, { followers: 1, following: 1 })
        let contactsQuer = await UserContacts.findOne({ userId }, { _id: 0, contacts: 1 });;
        let requestsContact = await NotificationModel.find({ recipients: userId, type: "new-contact-req" }, { _id: 0, senderId: 1 });
        // requestsContact = requestsContact.map(e => e.senderId);

        let blockedList = await Blockes.find({ Blocker: userId }, { Blocked_person: 1 });
        return res.status(200).json({ ...user?._doc, followersCount: follows?.followers.length || 0, blockedListCount: blockedList.length, followingCount: follows?.following.length || 0, contacts: contactsQuer?.contacts.length || 0, requestsContactCount: requestsContact.length });
    } catch (error) {
        console.log("Failed to get personal user => ", error);
        res.status(400).json({ error: error.message })
    }
}

const Get_user_to_view = async (req, res) => {
    try {
        const { _id } = req.query;
        const { userId } = req.body;
        let user = await UserModel.findOne({ _id }, { FirstName: 1, profile_img: 1, LastName: 1, BirthDay: 1, createdAt: 1, bio: 1, links: 1 })
        let follows = await Follow.findOne({ user_id: _id }, { followers: 1, following: 1 })
        let postsCount = await Posts.countDocuments({ authorId: _id })
        let ReelsCount = await Reels.countDocuments({ authorId: _id })
        let blogsCount = await Blogs.countDocuments({ author: _id })
        Put_notification(userId, [_id], "viewed_profile")
        return res.status(200).json({ ...user._doc, followersCount: follows.followers.length, followingCount: follows.following.length, blogsCount, postsCount, ReelsCount });

    } catch (error) {
        console.log("Failed to get all user data => ", error.message);

        res.status(400).json({ error: error.message })
    }
}

const add_to_contact = async (req, res) => {
    try {
        const { userId, contactId } = req.body;
        await UserContacts.updateOne(
            {
                userId
            },
            {
                $addToSet: {
                    contacts: contactId
                }
            }, {
            upsert: true
        }
        )
        await NotificationModel.deleteOne({ senderId: contactId, recipients: userId, type: "new-contact-req" })
        Put_notification(userId, [contactId], 'new-contact');
        return res.status(204).send('');
    } catch (error) {
        return res.status(400).send(error)
    }
};
const get_contacts = async (req, res) => {
    try {
        const { userId } = req.body;
        let doc = await UserContacts.findOne(
            {
                userId
            }
        )
        let contacts = await Promise.all(
            doc.contacts.map(async (c) => {
                let user = await UserModel.findOne({ _id: c }, { FirstName: 1, profile_img: 1, LastName: 1 })
                return user
            })
        )
        return res.status(200).json({ contacts });
    } catch (error) {
        return res.status(400).send(error)
    }
};

const GetContactsRequests = async (req, res) => {
    try {
        const { userId } = req.body;
        let requestsContact = await NotificationModel.find({ recipients: userId, type: "new-contact-req" }, { _id: 0, senderId: 1 });
        requestsContact = requestsContact.map(e => e.senderId);

        let data = await Promise.all(
            requestsContact.map(async (c) => {
                let user = await UserModel.findOne({ _id: c }, { FirstName: 1, profile_img: 1, LastName: 1 })
                return user
            })
        );

        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send(error)
    }
};


const GetBlockedPersons = async (req, res) => {
    try {
        const { userId } = req.body;
        let BlockesAndBlocked = await Blockes.find({ Blocker: userId }).limit(100);
        let data = await Promise.all(
            BlockesAndBlocked.map(async (c) => {
                let user = await UserModel.findOne({ _id: c.Blocked_person }, { FirstName: 1, profile_img: 1, LastName: 1 })
                return user
            })
        );

        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send(error)
    }
};


const SayHello = async (req, res) => {
    try {
        const { userId, contactId } = req.body;
        await UserContacts.updateOne(
            {
                userId
            },
            {
                $addToSet: {
                    contacts: contactId
                }
            },
            {
                upsert: true
            }
        );
        const now = new Date().toISOString();
        Put_notification(userId, [contactId], 'new-contact-req')
        Add_message({
            _id: `${now}${userId}`,
            senderId: userId,
            recieverId: contactId,
            message: "Hi 👋",
            type: "text",
            createAt: now
        })
        return res.status(204).send('');
    } catch (error) {
        return res.status(400).send(error)
    }
}

const Get_all_Users = async (req, res) => {
    try {
        let users = await UserModel.find();
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const add_follwing_relation = async (req, res) => {
    try {
        const { userId, following_user_id } = req.body;
        const respnose = await Follow.updateOne({ user_id: following_user_id }, {
            $addToSet: {
                followers: userId
            }
        });
        if (respnose.modifiedCount == 1) {
            const add_followerReq = await Follow.updateOne({ user_id: userId }, {
                $addToSet: {
                    following: following_user_id
                }

            });
            if (add_followerReq.modifiedCount == 1) {
                Put_notification(userId, [following_user_id], "start_following");
                return res.status(200).json({ messgae: "Process done" })
            } else {
                return res.status(500).json({ message: "Failed to set the relationship" })
            }
        } else {
            return res.status(500).json({ message: "Failed to set the relationship" })
        }

    } catch (error) {
        console.log("Failed to add the following relation =>", error.message);
        return res.status(500).json({ message: "Failed to add the following relation => " + error.message })
    }
}
const remove_follwing_relation = async (req, res) => {
    try {
        const { userId, following_user_id } = req.body;

        const respnose = await Follow.updateOne({ user_id: following_user_id }, {
            $pull: {
                followers: userId
            }
        });
        if (respnose.modifiedCount == 1) {
            const add_followerReq = await Follow.updateOne({ user_id: userId }, {
                $pull: {
                    following: following_user_id
                }
            });
            if (add_followerReq.modifiedCount == 1) {
                return res.status(200).json({ messgae: "Process done" })
            } else {
                return res.status(500).json({ message: "Failed to remove the relationship" })
            }
        } else {
            return res.status(500).json({ message: "Failed to remove the relationship" })
        }

    } catch (error) {
        console.log("Failed to add the following relation =>", error.message);
        return res.status(500).json({ message: "Failed to remove the following relation => " + error.message })
    }
}
const get_friend_followers = async (req, res) => {
    try {
        const { _id } = req.query;
        const lastIds = req.query.lastIds || [];
        const { userId } = req.body;
        const r = await Follow.findOne({ user_id: _id }, { _id: 0, followers: 1 });

        const followersIds = FilterIds(r.followers, lastIds)
        let followers = await UserModel.find({ _id: { $in: followersIds, $nin: lastIds } }, { profile_img: 1, FirstName: 1, LastName: 1 }).limit(10)
        if (_id != userId) {
            Put_notification(userId, [_id], "checked_followers");
        }

        return res.status(200).json({ followers })
    } catch (error) {
        console.log("Failed get followers  =>", error.message);
        return res.status(500).json({ message: "Failed get followers  => " + error.message })
    }
}
const get_friend_followings = async (req, res) => {
    try {
        const { _id } = req.query;
        const lastIds = req.query.lastIds || [];
        const { userId } = req.body;
        const r = await Follow.findOne({ user_id: _id }, { _id: 0, following: 1 });
        const followingsIds = FilterIds(r.following, lastIds)
        let following = await UserModel.find({ _id: { $in: followingsIds } }, { profile_img: 1, FirstName: 1, LastName: 1 }).limit(10)


        if (userId != _id) {
            Put_notification(userId, [_id], "checked_followings");
        }

        return res.status(200).json({ following })
    } catch (error) {
        console.log("Failed get followings  =>", error.message);
        return res.status(500).json({ message: "Failed get followings  => " + error.message })
    }
}

const Get_users = async (req, res) => {
    try {
        const { users } = req.query;
        const { userId } = req.body
        let data = await UserModel.find({ _id: { $in: users } }, { profile_img: 1, FirstName: 1, LastName: 1 })
        if (req.query.withLastChat) {
            let chats = await Promise.all(
                data.map(async (f) => {
                    let messages = await MessagesModel.find({
                        $or: [
                            {
                                $and: [
                                    { senderId: userId },
                                    { recieverId: f._id }
                                ]
                            },
                            {
                                $and: [
                                    { senderId: f._id },
                                    { recieverId: userId },
                                ]
                            },
                        ]
                    }).sort({ createAt: -1 }).limit(30);

                    return { friendId: f._id, messages };
                })
            );


            return res.status(200).json({ users: data, chats });


        }
        return res.status(200).json({ users: data });
    } catch (error) {
        return res.status(402).send('Failed to get user => ', error)
    }
}
const Get_users_to_follow = async (req, res) => {
    try {
        const { userId } = req.body;
        let f = await Follow.findOne({ user_id: userId }, { _id: 0, following: 1 })
        let peopleToFollo = await UserModel.find({ _id: { $nin: [...f.following, userId] } }, { profile_img: 1, FirstName: 1, LastName: 1 }).limit(10)
        res.status(200).json({ users: peopleToFollo });
    } catch (error) {
        return res.status(400).send('Failed to get user to follow  => ', error)
    }
}

const Get_Single_user = async (id) => {
    return new Promise(
        async (resolve, reject) => {
            try {
                const data = await UserModel.findOne({ _id: id }, { FirstName: 1, LastName: 1, profile_img: 1 });
                resolve({ ...data._doc });
            } catch (error) {
                reject(error);
            }
        }
    )

}

const identificat_user = async (req, res) => {
    try {
        const { _id } = req.query;
        const data = await UserModel.findOne({ _id }, { FirstName: 1, LastName: 1, profile_img: 1 });
        return res.status(200).json({ ...data._doc })
    } catch (error) {
        console.log('cant find user ', error);
        return res.status(400).send(error);
    }
}




const BlockFriend = async (req, res) => {
    try {
        const { userId, Blocked_person } = req.body;
        const reqs = await Blockes.create({
            Blocked_person,
            Blocker: userId
        });
        return res.status(200).json(reqs)
    } catch (error) {
        console.log('failed to block => ', error);
        return res.status(400).send('')
    }
}
const UnblockFriend = async (req, res) => {
    try {
        const { userId, Blocked_person } = req.body;
        const reqs = await Blockes.deleteOne({
            Blocked_person,
            Blocker: userId
        });
        return res.status(200).json(reqs)
    } catch (error) {
        console.log('failed to block => ', error);
        return res.status(400).send(error)
    }
}



const addLinkToProfile = async (req, res) => {
    try {
        const { LinkDesc, userId, bodyLink } = req.body;
        let UpadateRes = await UserModel.findOneAndUpdate({ _id: userId },
            {
                $push:
                {
                    links:
                    {
                        description: LinkDesc, url: bodyLink
                    }
                }
            }, {
            new: true
        });
        if (UpadateRes) {
            return res.status(200).json({ ...UpadateRes.links[UpadateRes.links.length - 1]._doc });
        }
        return res.status(404).send("user not found")
    } catch (error) {
        return res.status(400).send(error);
    }
}

const DeleteLinkFromProfile = async (req, res) => {
    try {
        const { userId, _id } = req.body

        let reqponseUpdate = await UserModel.updateOne({ _id: userId },
            {
                $pull: {
                    links: { _id }
                }
            }
        );
        if (reqponseUpdate.modifiedCount == 1) {
            return res.status(200).send("OK")
        } else {
            return res.status(404).send("Failed to delete ,no muthes");
        }
    } catch (error) {
        return res.status(400).send(error)
    }
}

const updateUserFiel = async (req, res) => {
    try {
        const { userId, field, newVal } = req.body
        let newValsQuer, matchs;
        if (field == "links") {
            matchs = {
                _id: userId,
                'links._id': newVal._id
            }
            newValsQuer = {
                $set: {
                    'links.$.url': newVal.url,
                    'links.$.description': newVal.description
                }
            }
        }
        else {
            matchs = {
                _id: userId,
            };
            newValsQuer = {
                $set: {
                    [field]: newVal
                }
            }
        }

        let reqponseUpdate = await UserModel.updateOne(matchs, newValsQuer, { upsert: true });
        if (reqponseUpdate.modifiedCount == 1) {
            return res.status(200).send("OK")
        } else {
            return res.status(404).send("Failed to save ,no muthes");
        }
    } catch (error) {
        return res.status(400).send(error)
    }
}



module.exports = {
    Login_user,
    StoreNewUser,
    get_all_user_data,
    Get_all_Users,
    Update_profile_picture,
    add_follwing_relation,
    remove_follwing_relation,
    Get_users,
    Get_users_to_follow,
    Get_user_to_view,
    get_friend_followers,
    get_friend_followings,
    add_to_contact,
    identificat_user,
    SayHello,
    BlockFriend,
    UnblockFriend,
    get_profile_personal_info,
    addLinkToProfile,
    updateUserFiel,
    DeleteLinkFromProfile,
    get_contacts,
    GetContactsRequests,
    GetBlockedPersons,
    Get_Single_user
}