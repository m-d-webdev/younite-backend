const mongoose = require('mongoose');


const TableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true

    },
    contacts: {
        type: [mongoose.Types.ObjectId],
        required: true
    },
});

module.exports = mongoose.model("UserContacts", TableSchema);
