import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import timestamps from 'mongoose-timestamp';

const Schema = mongoose.Schema;
const User = new Schema({
  username: String,
  //email: String,
  password: String,
  /*
  image: String,
  isEmailVerified: Boolean,
  verifyEmailToken: String,
  verifyEmailTokenExpires: Date,
  */
  created: {type: Date, default: Date.now }
});

User.plugin(timestamps);

//Schema 자체에 임의 메소드 두개를 정의
// generates hash
User.methods.generateHash = function(password){
  return bcrypt.hashSync(password,10);
}

// compares the password
User.methods.validateHash = function(password){
  return bcrypt.compareSync(password, this.password);
}

export default mongoose.model('user',User);
