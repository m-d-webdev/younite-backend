const express = require('express');
const {  createShares, FilterFriendsWitchShare ,getSharedMedia} = require('../Controllers/ShareMedia');
const { auth_token } = require('../config/middlewares');

const Router = express.Router();


Router.post("/create", auth_token, createShares)
Router.get("/FilterFriendsWitchShare", auth_token, FilterFriendsWitchShare)
Router.get("/getSharedMedia", auth_token, getSharedMedia)


module.exports = Router