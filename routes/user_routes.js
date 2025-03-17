const express = require("express")
const {
    SayHello,
    Login_user,
    StoreNewUser,
    get_all_user_data,
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
    BlockFriend,
    get_profile_personal_info,
    UnblockFriend,
    addLinkToProfile,
    updateUserFiel,
    DeleteLinkFromProfile,
    get_contacts,
    GetBlockedPersons,
    GetContactsRequests
} = require('../Controllers/user_controller');

const router = express.Router();
const { auth_token, guest } = require('../config/middlewares');
const { CreateMoment, Get_current_moments, store_moment_replay, Get_user_moments, declare_view_moment } = require('../Controllers/moment_controller')
const { get_sp_user_posts } = require('../Controllers/post_controller')
const { get_sp_friend_reels } = require('../Controllers/reel_controler')
const { get_sp_friend_blogs } = require('../Controllers/blog_controller');
const { Get_messagesForUser, SyncMessages } = require("../Controllers/Messages_controller");
// login user ----

router.get('/login', (req, res) => {

    const email = req.session.email;;
    const error_login = req.session.error_login;

    // ----------------------

    req.session.error_login = undefined;
    req.session.email = null;

    // ----------------------

    res.render("login", { email, error_login })
})

router.post("/login", Login_user);


// Add new user ---  

router.get('/register', guest, (req, res) => {
    const email = req.session.email;;
    const error_duplicate_email = req.session.error_duplicate_email;
    const FirstName = req.session.FirstName
    const LastName = req.session.LastName
    // ----------------------

    req.session.error_duplicate_email = undefined;
    req.session.email = null;
    req.session.FirstName = null
    req.session.LastName = null
    // ----------------------

    res.render("register", { email, error_duplicate_email, FirstName, LastName })
})

router.post("/register", guest, StoreNewUser);

// *------Get user data 

router.get("/user/get_all_user_data", auth_token, get_all_user_data)

router.post('/user/add_follwing_relation', auth_token, add_follwing_relation);
router.post('/user/remove_follwing_relation', auth_token, remove_follwing_relation);
router.post('/user/create_moment', auth_token, CreateMoment);
router.get('/user/Get_current_moments', auth_token, Get_current_moments);
router.post('/user/put_moment_replay', auth_token, store_moment_replay);
router.post('/user/declare_view_moment', auth_token, declare_view_moment);
router.get('/user/Get_user_moments', auth_token, Get_user_moments);
router.get('/user/identification', auth_token, identificat_user);
router.post('/user/addToConact', auth_token, add_to_contact);
router.post('/user/SayHello', auth_token, SayHello);
router.post('/user/BlockFriend', auth_token, BlockFriend);
router.post('/user/UnBlockFriend', auth_token, UnblockFriend);
// -- Profile routes 

router.get("/user/get_profile_personal_info", auth_token, get_profile_personal_info)
router.post('/user/upload_profile', auth_token, Update_profile_picture);
router.post('/user/addLinkToProfile', auth_token, addLinkToProfile);
router.post('/user/DeleteLinkFromProfile', auth_token, DeleteLinkFromProfile);
router.post('/user/updateUserFiel', auth_token, updateUserFiel);
router.get('/user/get_contacts', auth_token, get_contacts);
router.get('/user/GetContactsRequests', auth_token,GetContactsRequests);
router.get('/user/GetBlockedPersons', auth_token,GetBlockedPersons);


// ALL ABPUT GETTING USERS NOT ONLY ONE , RETRIEVE THE ARRAY AND SEND DATA OF EACH ONE

router.get('/users', auth_token, Get_users)
router.get('/users/to_follow', auth_token, Get_users_to_follow)
router.get('/users/view_user', auth_token, Get_user_to_view)
router.get('/users/get_friend_followers', auth_token, get_friend_followers)
router.get('/users/get_friend_followings', auth_token, get_friend_followings)
router.get('/users/get_friend_posts', auth_token, get_sp_user_posts)
router.get('/users/get_friend_reels', auth_token, get_sp_friend_reels)
router.get('/users/get_friend_blogs', auth_token, get_sp_friend_blogs)
router.get('/users/get_single_chat', auth_token, Get_messagesForUser)
router.post('/messages/sync', auth_token, SyncMessages)


// -------------------------
module.exports = router