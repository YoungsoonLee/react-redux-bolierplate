import express from 'express';
import expressJwt from 'express-jwt';
import User from '../models/user';
import utils from '../utils/index';
import jwt from 'jsonwebtoken';

const router = express.Router();

/*
    ACCOUNT SIGNUP: POST /api/user/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: BAD EMAIL
        4: USERNAM EXISTS
        5: EMAIL EXISTS
*/
router.post('/signup',(req,res)=>{
  // CHECK USERNAME FORMAT
  let usernameRegex = /^[a-z0-9]+$/;

  if(!usernameRegex.test(req.body.username)){
    return res.status(400).json({
      error: 'BAD USERNAME',
      code: 1
    });
  }

  /* to be implemet valid email */

  // CHECK PASS LENGTH
  if(req.body.password.length < 4 || typeof req.body.password !== 'string'){
    return res.status(400).json({
      error: 'BAD PASSWORD',
      code: 2
    });
  }

  // CHECK USER EXISTANCE
  User.findOne({ username: req.body.username }, (err,exists)=>{
    if(err) throw err;
    if(exists){
      return res.status(409).json({
        error: 'USERNAME EXISTS',
        code: 3
      });
    }else{
      //bug fix
      // CREATE ACCOUNT
      let user = new User({
        username: req.body.username,
        password: req.body.password
      });

      user.password = user.generateHash(user.password);

      // SAVE IN THE DATABASE
      user.save( (err,user) => {
        if(err) throw err;


        let token = utils.generateToken(user); //only use user.username and user._id
        //console.log(user.username);

        return res.json({
          success: true,
          username: user.username,
          token: token
        });
      })
    }
  });

});

/*
    ACCOUNT SIGNIN: POST /api/account/signin
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1:
        2: NOT EXISTS USERNAME
        3: PASSWORD WRONG
*/
router.post('/signin',(req,res)=>{
  if(typeof req.body.password !== 'string'){
    return res.status(401).json({
      error: 'LOGIN FAILED',
      code: 1
    });
  }

  // FIND THE USER BY USERNAME
  User.findOne({ username: req.body.username},(err,user)=>{
    if(err) throw err;

    // CHECK ACCOUNT EXISTANCY
    if(!user){
      return res.status(402).json({
        error: 'NOT EXISTS USERNAME',
        code: 2
      });
    }

    // CHECK WHETHER THE PASSWORD IS VALID
    if(!user.validateHash(req.body.password)){
      return res.status(403).json({
        error: 'PASSWORD WRONG',
        code: 3
      });
    }

    // ALTER session using cookie
    /*
    let session = req.session;
    session.loginInfo = {
      _id: user._id,
      username: user.username
    };
    */

    let token = utils.generateToken(user);
    // RETURN SUCCESS
    return res.json({
      success: true,
      token: token,
      username: user.username
    });

  });

});

//get current user from token
///api/account/validToken
router.post('/validToken', function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
   return res.status(401).json({message: 'Must pass token'});
  }
// Check token that was passed by decoding token using secret
 jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
    if (err) throw err;
   //return user using the id from w/in JWTToken
    User.findById({
    '_id': user._id
    }, function(err, user) {
       if (err) throw err;
          user = utils.getCleanUser(user);
         //Note: you can renew token by creating new token(i.e.
         //refresh it)w/ new expiration time at this point, but I’m
         //passing the old token back.
         // var token = utils.generateToken(user);
        res.json({
          success: true,
          token: token,
          username: user.username
        });
     });
  });
});


/*
  get current user info GET /api/account/getinfo
 */
/*
router.get('/getinfo',expressJwt({secret: process.env.JWT_SECRET}),(req,res)=>{
  if(typeof req.session.loginInfo === 'undefined'){
    return res.status(401).json({
      error: 1
    });
  }

  return res.json({ info: req.session.loginInfo });
})
*/

router.get('/getinfo',(req,res)=>{

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
   return res.status(401).json({message: 'Must pass token'});
  }

  // Check token that was passed by decoding token using secret
   jwt.verify(token, process.env.JWT_SECRET, function(err, user) {

      if (err) {
        res.status(401).json({
          error: 1
        });
      }else{
        //return user using the id from w/in JWTToken

         User.findById({
         '_id': user._id
         }, function(err, user) {
            if (err) {
              user = utils.getCleanUser(user);
              res.status(402).json({
                error: 'NOT EXISTS USERNAME',
                code: 2
              });
            }else{
              //Note: you can renew token by creating new token(i.e.
              //refresh it)w/ new expiration time at this point, but I’m
              //passing the old token back.
              // var token = utils.generateToken(user);
               res.json({
                 success: true,
                 token: token,
                 username: user.username
               });
            }
          });
      }

    });

})

/*
  logout : POST /api/account/logout
 */
router.post('/logout',(req,res)=>{
  //req.session.destory( err => { if(err) throw err; });
  //req.session.destroy();
  return res.json({ success: true });
})

/*
  SEARCH USER: GET /api/account/search/:username
*/
router.get('/search/:username',(req,res)=>{
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var re = new RegExp('^' + req.params.username);
  User.find({username: {$regex: re}},{_id: false,username: true}) // only view username
  .limit(5)
  .sort({username: 1})
  .exec((err,users)=>{
    if(err) throw err;
    return res.json(users);
  });
})

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', (req, res) => {
    res.json([]);
});


export default router;
