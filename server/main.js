import express from 'express';
import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import morgan from 'morgan'; //http request logger
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import api from './routes';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
// LOAD ENV CONFIG
dotenv.config();

const app =  express();
const port = process.env.PORT;
const devPort = process.env.DEV_PORT;

app.use(cors());
app.use(compression());

app.use('/',express.static(path.join(__dirname,'./../public')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/* use session */
/*
app.use(session({
  secret:'CodeLab1$1$234',
  resave: false,
  saveUninitialized: true
}));
*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

/* handle error */
app.use(function(err,req,res,next){
  console.error(err.statck);
  res.status(500).send('Oops Something Wrong');
});

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all the future routes, this helps to know if the request is authenticated or not.
app.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
      if (err) {
        return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    next();
  }
});

//routes
app.use('/api',api); //use ex) http://URL/api/signup

/* support client-side routing */
app.get('*', (req,res)=>{
  res.sendFile(path.resolve(__dirname,'./../public/index.html'));
});

//mongodb connection
const db = mongoose.connection;
db.on('error',console.error);
db.once('open',()=>{console.log('Connected to mongodb server');});
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://'+process.env.DB_HOST+'/'+process.env.DB_NAME);

if (!process.env.JWT_SECRET) {
  console.error('ERROR!: Please set JWT_SECRET before running the app. \n run: export JWT_SECRET=<some secret string> to set JWTSecret. ')
  process.exit();
}

if(process.env.NODE_ENV == 'development'){
  console.log('Server is running on development mode');
  const config = require('../webpack.dev.config');
  const compiler = webpack(config);
  const devServer = new WebpackDevServer(compiler,config.devServer);
  devServer.listen(
    devPort , ()=>{
      console.log('webpack-dev-server is listening on port ',devPort);
    }
  );
}

app.listen(port,()=>{
  console.log('Express is listening on port ',port);
});
