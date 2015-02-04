var db = require('./db.js');

module.exports = {
  addUser: function (token, tokenSecret, profile, done){
    console.log('dbHelpers: profile:', profile);
    var err = '';
    //Add the user's profile info to the db
    db.child('users').child(profile.id).once('value', function (data) {
      // collect necessary data
      var user = {};
      user.id = profile.id;
      /**
       * use `fullName` if available. For new users, it may be undefined.
       * The database will complain about this, so default to passing the
       * `displayName`, or anonymous
       */
      user.name = profile._json.user.fullName || 
        profile._json.user.displayName || 'anonymous';
      user.strideRunning = profile._json.user.strideLengthRunning;
      user.strideWalking = profile._json.user.strideLengthWalking;
      user.units = profile._json.user.distanceUnit;

      //if user is not already in the db
      if (data.val() === null) {
        user.tokenSecret = tokenSecret;
        user.token = token;
        db.child('users').child(profile.id).set(user, function(err) {
          // TODO handle error data
          // return user DB model
          done(user);
        });
     
      //if user is already in db, update their profile info
      } else {
        db.child('users').child(profile.id).update(user, function(err) {
          // TODO handle error
          // return user DB model
          db.child('users').child(profile.id).once('value', function(data) {
            // console.log('db user from update:', data.val());
            done(data.val());
          });
        });
      }
    });
  },
  
  getUserStats: function (userID, callback) {
    //take user id and query the firebase database
    return db.child('users').child(userID);
    
  },
  
  //add user activity, such as stairs and steps to their profile in the db
  addUserStats: function (userID, userStats) {
    db.child('users').child(userID).child('stats')
      .update(JSON.parse(userStats), function(err) {
        // TODO: error handling
        // TODO: maybe? Send back updated user db model
        // db.child('users').child(userID).once('value', function(data) {
        //   // console.log('db user from addUserStats:', data.val());
        //   done(data.val());
        // });
      });
  },

  addDonation: function (token, email) {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here https://dashboard.stripe.com/account
    var stripe = require("stripe")(config.stripe.apiKey);

    var charge = stripe.charges.create({
      amount: 1000, // amount in cents, again
      currency: "usd",
      card: token,
      description: "payinguser@example.com"
    }, function(err, charge) {
      if (err && err.type === 'StripeCardError') {
        // The card has been declined
      }
    });
  },
  getDonation: function() {

  }

};