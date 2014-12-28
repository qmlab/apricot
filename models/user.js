// Load required packages
var bcrypt = require('bcrypt-nodejs')
, mongoose = require('mongoose')

// Define our user schema
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  adminKey: {
    type: String
  },
  apiKey: {
    type: String
  },
});

UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/* // Used when encoded password does not work in case of digest auth
UserSchema.methods.verifyPassword = function(password, cb) {
  cb(null, password === this.password)
}
*/

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
