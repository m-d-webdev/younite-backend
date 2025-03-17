const mongoose = require("mongoose");

const TableSchema = mongoose.Schema({
    Blocked_person: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    Blocker: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Blockes", TableSchema);