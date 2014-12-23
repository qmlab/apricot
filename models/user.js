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

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.username + '+' + 'panda', salt, null, function(err, hash) {
      if (err) return callback(err);
      user.adminKey = hash;
      bcrypt.hash(user.username + '+' + 'tiger', salt, null, function(err, hash) {
        if (err) return callback(err);
        user.apiKey = hash;
        callback()
      })
    })
  })
})

/* // Skip this encoding because basic is only supposed to be used in debug env
UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
*/
UserSchema.methods.verifyPassword = function(password, cb) {
  cb(null, password === this.password)
}

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
