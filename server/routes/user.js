import express from 'express';
import expressJwt from 'express-jwt';
import User from '../models/user';
import utils from '../utils/index';
import errorCode from '../utils/errorCode';
import jwt from 'jsonwebtoken';

const router = express.Router();

/*
    ACCOUNT SIGNUP: POST /api/user/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
      * todo: add email
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: BAD EMAIL
        4: USERNAME EXISTS
        5: EMAIL EXISTS
*/
router.post('/signup',(req,res)=>{
  // CHECK USERNAME FORMAT
  let usernameRegex = /^[a-z0-9]+$/;

  if(!usernameRegex.test(req.body.username)){
    return res.status(400).json( errorCode.BAD_USERNAME );
  }

  /* to be implemet valid email */

  // CHECK PASS LENGTH
  if(req.body.password.length < 4 || typeof req.body.password !== 'string'){
    return res.status(400).json( errorCode.BAD_USERNAME );
  }

  // CHECK USER EXISTANCE
  User.findOne({ username: req.body.username }, (err,exists)=>{
    if(err) throw err;
    if(exists){
      return res.status(409).json( errorCode.USERNAME_EXISTS );
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
    return res.status(401).json( errorCode.LOGIN_FAILED );
  }

  // FIND THE USER BY USERNAME
  User.findOne({ username: req.body.username},(err,user)=>{
    if(err) throw err;

    // CHECK ACCOUNT EXISTANCY
    if(!user){
      return res.status(402).json( errorCode.LOGIN_FAILED );
    }

    // CHECK WHETHER THE PASSWORD IS VALID
    if(!user.validateHash(req.body.password)){
      return res.status(403).json( errorCode.WORNG_PASSWORD );
    }

    //session using cookie
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

/* valid token and getUserInfo */
router.get('/getinfo',(req,res)=>{

  //var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
  var token = utils.getToken(req.headers.authorization);
  //console.log(token);

  if (!token) {
   return res.status(401).json({message: 'Must pass token'});
  }

  // Check token that was passed by decoding token using secret
   jwt.verify(token, process.env.JWT_SECRET, function(err, user) {

      if (err) {
        res.status(401).json({error: 1});
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

  //req.session.destroy(); //using cookie
  return res.json({ success: true }); //using jwt
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
