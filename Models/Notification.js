const express = require('express');
const mongoose = require("mongoose");


const notificationSchema = mongoose.Schema({
    recipients: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    content_type: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notification", notificationSchema);