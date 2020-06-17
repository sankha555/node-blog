const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = mongoose.model('User')
const config = require('../config/database')
const bcrypt = require('bcryptjs')
const GoogleStrategy = require('passport-google-oauth2').Strategy

module.exports = function(passport){
    passport.use(new LocalStrategy(function (username, password, done) {
        console.log('In passport')
        let query = { username: username }
        User.findOne(query, function (err, user) {
            if (err) {
                throw err
            }

            if (!user) {
                return done(null, false, { message: 'No user found' });
            }

            // Match Password
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) {
                    throw err
                }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Wrong password' });
                }
            })
        })
    }))

 
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user)
        })
    })

    passport.use(new GoogleStrategy({
        clientID: '714747507436-cr4tslvs24jrhe0knfk2jmo2suvmcv8i.apps.googleusercontent.com',
        clientSecret: 'C-8rq2xR6QO_drOn4WFUsLDe',
        callbackURL: "http://localhost:5000/auth/google/callback",
        passReqToCallback: true
    },
        function (request, accessToken, refreshToken, profile, done) {
            User.findOne({
                'googleId': profile.id
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                console.log(profile)
                //No user was found... so create a new user with values from Facebook (all the profile. stuff)
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails ? profile.emails[0].value : "null",
                        username: profile.emails ? profile.emails[0].value : "null",
                        googleId: profile.id
                        //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                    })
                    user.save(function (err) {
                        if (err)
                            console.log(err)
                        return done(err, user)
                    })
                } else {
                    //found user. Return
                    return done(err, user)
                }
            })
        }
    ))
}


