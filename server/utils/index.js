import jwt from 'jsonwebtoken';

function getCleanUser(user) {
  var u = user.toJSON();
  return {
    _id: u._id,
    username: u.username,
    /*
    email: u.email,
    admin: u.admin,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    image: u.image,
    isEmailVerified: u.isEmailVerified
    */
  }
}

function generateToken(user) {
  //Dont use password and other sensitive fields
  //Use fields that are useful in other parts of the app/collections/models
  var u = {
    _id: user._id,
    username: user.username,
  };

  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 // expires in 24 hours ,  ex) 14 * 24 * 60 * 60 * 1000  // 14 DAYS
  });
}

function getToken(token){
  if(typeof token === 'undefined' ){
    return token;
  }else if(token.length > 0){
    return token.replace('Bearer ','');
  }else{
    return token;
  }

}


module.exports = {
  //validateSignUpForm: validateSignUpForm,
  getCleanUser: getCleanUser,
  generateToken: generateToken,
  getToken: getToken
}
