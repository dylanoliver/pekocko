const mongoose = require('mongoose');
// This plugin is used to verify that emails are unique
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);
// We then export our model so it can be used in our user controllers
module.exports = mongoose.model('User', userSchema);