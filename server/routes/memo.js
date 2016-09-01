import express from 'express';
import Memo from '../models/memo';
import mongoose from 'mongoose';
import errorCode from '../utils/errorCode';
import expressJwt from 'express-jwt';
import utils from '../utils/index';
import jwt from 'jsonwebtoken';

const router = express.Router();

// write memo
/*
    WRITE MEMO: POST /api/memo
    BODY SAMPLE: { contents: "sample "}
    ERROR CODES
        1: NOT LOGGED IN
        2: EMPTY CONTENTS
*/
router.post('/', (req,res)=>{
//router.post('/', expressJwt({secret: process.env.JWT_SECRET}),(req,res)=>{
  // check contents valid
  if(typeof req.body.contents !== 'string') {
    return res.status(400).json(errorCode.EMPTY_CONTENTS);
  }

  if(req.body.contents === ''){
    return res.status(400).json(errorCode.EMPTY_CONTENTS);
  }

  let token = utils.getToken(req.headers.authorization);
  if (!token) {
   return res.status(401).json( errorCode.EXPIRE_SESSION );
  }

  // check login status
  // Check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
    if (err) {
      res.status(401).json( errorCode.EXPIRE_SESSION );
    }else{
      // create new memo
      let memo = new Memo({
        writer: user.username,
        contents: req.body.contents
      });

      // save into db
      memo.save(err => {
        if(err) throw err;
        return res.json({ success: true });
      });
    }
  });


});

/*
    MODIFY MEMO: PUT /api/memo/:id
    BODY SAMPLE: { contents: "sample "}
    ERROR CODES
        1: INVALID ID,
        2: EMPTY CONTENTS
        3: NOT LOGGED IN
        4: NO RESOURCE
        5: PERMISSION FAILURE
*/
router.put('/:id',(req,res)=>{
  // check memo id validity
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    return res.status(400).json({
      error: 'INVALID ID',
      code: 1
    });
  }

  // check contents valid
  if(typeof req.body.contents !== 'string'){
    return res.status(400).json({
      error: 'EMPTY CONTENTS',
      code: 2
    });
  }

  if(req.body.contents === ''){
    return res.status(400).json({
      error: 'EMPTY CONTENTS',
      code: 2
    });
  }

  // check login status
  if(typeof req.session.loginInfo === 'undefined'){
    return res.status(403).json({
      error: 'NOT LOGGED IN',
      code: 3
    });
  }

  // find memo
  Memo.findById(req.params.id, (err,memo)=>{
    if(err) throw err;

    // if memo does not exist
    if(!memo){
      return res.status(404).json({
        error: 'NO RESOURCE',
        code: 4
      });
    }

    // if exists, check writer
    if(memo.writer != req.session.loginInfo.username){
      return res.status(403).json({
        error: 'PERMISSION FAILURE',
        code: 5
      });
    }

    // modify and seve into db
    memo.contents = req.body.contents;
    memo.date.edited = new Date();
    memo.is_edited = true;

    //console.log(memo.contents);

    memo.save((err,memo)=>{
      if(err) throw err;
      return res.json({
        success: true ,
        memo
      });
    });
  });
});

// delete memo
/*
    DELETE MEMO: DELETE /api/memo/:id
    ERROR CODES
        1: INVALID ID
        2: NOT LOGGED IN
        3: NO RESOURCE
        4: PERMISSION FAILURE
*/
router.delete('/:id',expressJwt({secret: process.env.JWT_SECRET}),(req,res)=>{
  // check memo in validity
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    return res.status(400).json(errorCode.INVALID_ID);
  }

  // check login status
  /*
  if(typeof req.session.loginInfo === 'undefined'){
    return res.status(403).json({
      error: 'NOT LOGGED IN',
      code: 2
    });
  }
  */
  let token = utils.getToken(req.headers.authorization);
  if (!token) {
   return res.status(401).json( errorCode.EXPIRE_SESSION );
  }

  // find memo and check for writer
  Memo.findById(req.params.id,(err,memo)=>{
    if(err) throw err;

    if(!memo){
      return res.status(404).json(errorCode.NO_RESOURCE);
    }

    /*
    if(memo.writer != req.session.loginInfo.username ){
      return res.status(403).json({
        error: 'PERMISSION FAILURE',
        code: 4
      });
    }
    */

    // check login status
    // Check token that was passed by decoding token using secret
    jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
      if (err) {
        res.status(401).json( errorCode.EXPIRE_SESSION );
      }else{
        if(memo.writer != user.username ){
          return res.status(403).json(errorCode.PERMISSION_FAILURE);
        }
      }
    });

    // remove the memo
    Memo.remove({_id:req.params.id } , err => {
      if(err) throw err;
      return res.json({ success: true });
    });

  });

});

// get memo list
/*
    READ MEMO: GET /api/memo
*/
router.get('/',(req,res)=>{
  Memo.find()
  .sort({'_id':-1})
  .limit(6)
  .exec((err,memos)=>{
    if(err) throw err;
    return res.json(memos);
  });
});

/*
  READ ADDITIONAL (OLD/NEW) MEMO: GET /api/memo/:listType/:id
*/
router.get('/:listType/:id', (req,res) => {
  let listType = req.params.listType;
  let id = req.params.id;

  // CHECK LIST TYPE VALIDITY
  if(listType !== 'old' && listType !== 'new') {
    return res.status(400).json({
      error: 'INVALID LISTTYPE',
      code: 1
    });
  }

  // CHECK MEMO ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'INVALID ID',
      code: 2
    });
  }

  let objId = new mongoose.Types.ObjectId(req.params.id);

  if(listType === 'new') {
    Memo.find( { _id: { $gt: objId }})
    .sort({_id:-1})
    .limit(6)
    .exec((err,memos)=>{
      if(err) throw err;
      return res.json(memos);
    });
  }else{
    Memo.find({_id:{ $lt: objId }})
    .sort({_id:-1})
    .limit(6)
    .exec((err,memos)=>{
      if(err) throw err;
      return res.json(memos);
    });
  }
})

/*
    TOGGLES STAR OF MEMO: POST /api/memo/star/:id
    ERROR CODES
        1: INVALID ID
        2: NOT LOGGED IN
        3: NO RESOURCE
*/
router.post('/star/:id',(req,res)=>{
  // check memo id validity
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    return res.status(400).json({
      error: 'INVALID ID',
      code: 1
    });
  }

  //check login status
  if(typeof req.session.loginInfo === 'undefined'){
    return res.status(403).json({
      error: 'NOT LOGGED IN',
      code: 2
    });
  }

  // find memo
  Memo.findById(req.params.id,(err,memo)=>{
    if(err) throw err;

    //memo does not exist
    if(!memo){
      return res.status(404).json({
        error: 'NO RESOURCE',
        code: 3
      });
    }

    // get index of usrename in the array
    let index = memo.starred.indexOf(req.session.loginInfo.username);
    // check wether the user already has given a star
    let hasStarred = (index === -1) ? false : true;

    if(!hasStarred){
      // if it does not exist
      memo.starred.push(req.session.loginInfo.username);
    }else{
      // already starred
      memo.starred.splice(index,1);
    }

    // save the memo
    memo.save((err,memo)=>{
      if(err) throw err;
      return res.json({
        success: true,
        'has_starred': !hasStarred,
        memo  //new memo object
      });
    });
  });
})

/*
    READ MEMO OF A USER: GET /api/memo/:username
*/
router.get('/:username',(req,res)=>{
  Memo.find({writer:req.params.username})
  .sort({'_id':-1})
  .limit(6)
  .exec((err,memos)=>{
    if(err) throw err;
    return res.json(memos)
  });
})

/*
    READ ADDITIONAL (OLD/NEW) MEMO OF A USER: GET /api/memo/:username/:listType/:id
*/
router.get('/:username/:listType/:id',(req,res)=>{
  let listType = req.params.listType;
  let id = req.params.id;

  // check list type validity
  if(listType !== 'old' && listType !== 'new'){
    return res.status(400).json({
      error: 'INVALID LISTTYPE',
      code: 1
    });
  }

  // check memo id validity
  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({
      error: 'INVALID ID',
      code: 2
    });
  }

  let objId = new mongoose.Types.ObjectId(req.params.id);

  if(listType === 'new'){
    // get newer memo
    Memo.find({writer: req.params.usernanme , _id: { $gt: objId }})
    .sort({_id:-1})
    .limit(6)
    .exec((err,memos)=>{
      if(err) throw err;
      return res.json(memos);
    });
  }else{
    // GET OLDER MEMO
    Memo.find({ writer: req.params.username, _id: { $lt: objId }})
    .sort({_id: -1})
    .limit(6)
    .exec((err, memos) => {
        if(err) throw err;
        return res.json(memos);
    });
  }
})

export default router;
