import React from 'react';
import { Link } from 'react-router';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import { browserHistory } from 'react-router';

const responseFacebook = (response) => {
  console.log(response);
  //browserHistory.push('/login');
}

const responseGoogle = (response) => {
  console.log(response);
}

class Auth extends React.Component{
  constructor(props){
    super(props);
    this.state ={
      username: '',
      password: '',
      errorUserNameMessage: '',
      errorPasswordMessage: '',
      isValidUserName: false,
      isValidPassword: false,
      classUserName: "validate",
      classPassword: "validate"
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleChange(e){
    let nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  }

  handleKeyPress(e){
    let username = this.state.username;
    let password = this.state.password;

    if(e.target.name === 'username')
    {
      if(username.length < 3 ){
        this.setState({
            errorUserNameMessage: 'Too short username. username has a range 4 to 16.',
            classUserName: 'validate invalid'
        });
      }else{
        this.setState({
            isValidUserName:true,
            errorUserNameMessage: '',
            classUserName: 'validate'
        });
      }
    }

    if(e.target.name === 'password'){
      if(password.length < 7 ){
        this.setState({
            errorPasswordMessage: 'Too short password. password has a range 8 to 16.',
            classPassword: 'validate invalid'
        });
      }else{
        this.setState({
            isValidPassword:true,
            errorPasswordMessage: '',
            classPassword: 'validate'
        });
      }
    }

    if(e.charCode==13) {
        if(this.props.mode) {
            this.handleLogin();
        } else {
            this.handleRegister();
        }
    }
  }

  handleRegister(){
    let username = this.state.username;
    let password = this.state.password;

    if(this.state.isValidUserName && this.state.isValidPassword){
      this.props.onRegister(username,password).then(
        (result) => {
             if(!result) {
                 this.setState({
                     username: '',
                     password: ''
                 });
             }
         }
      );
    }else{
      this.setState({
          classUserName: 'validate invalid',
          classPassword: 'validate invalid',
      });
    }
  }

  handleLogin(){
    let username = this.state.username;
    let password = this.state.password;

    if(this.state.isValidUserName && this.state.isValidPassword){
      this.props.onLogin(username,password).then(
        (success) => {
             if(!success) {
                 this.setState({
                     password: ''
                 });
             }
         }
      );
    }else{
      this.setState({
          classUserName: 'validate invalid',
          classPassword: 'validate invalid',
      });
    }
  }

  render(){

    const inputBoxes = (
        <div>
          <div className="input-field col s12 username">
              <label>Username</label>
              <input
              name="username"
              type="text"
              className={this.state.classUserName}
              value={this.state.username}
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
              minLength='4'
              maxLength='16'
              />
            <span className="red-text text-darken-2">{this.state.errorUserNameMessage}</span>
          </div>
          <div className="input-field col s12">
              <label>Password</label>
              <input
              name="password"
              type="password"
              className={this.state.classPassword}
              value={this.state.password}
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
              minLength='8'
              maxLength='16'
              />
            <span className="red-text text-darken-2">{this.state.errorPasswordMessage}</span>
          </div>
      </div>
    );

    const socailView = (

      <div className="row">
        <spam>
          <FacebookLogin
              appId="1088597931155576"
              autoLoad={true}
              fields="name,email,picture"
              cssClass="btn-floating blue"
              callback={responseFacebook}
              textButton=""
              icon="fa-facebook" >
            </FacebookLogin>
        </spam>
        &nbsp;&nbsp;&nbsp;
        <spam>
          <GoogleLogin
            clientId="658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com"
            buttonText=""
            cssClass="btn-floating red"
            callback={responseGoogle} >
            <i className="fa fa-google-plus"> </i>
          </GoogleLogin>
        </spam>
      </div>

    );

    const registerView = (
      <div className="card-content">
          <div className="row">
              {inputBoxes}
              <a className="waves-effect waves-light btn" onClick={this.handleRegister}>CREATE</a>
          </div>
          <div className="footer">
              <div className="card-content">
                  <div className="right" >
                  Already have a account? <Link to="/login">Login</Link>
                  </div>
              </div>
          </div>
          <br />
          {socailView}
      </div>
    );

    const loginView = (
      <div className="card-content">
          <div className="row">
              {inputBoxes}
              <a className="waves-effect waves-light btn" onClick={this.handleLogin} >SUBMIT</a>
          </div>

        <div className="footer">
            <div className="card-content">
                <div className="right" >
                New Here? <Link to="/register">Create an account</Link>
                </div>
            </div>
        </div>
        <br />
        {socailView}
      </div>
    );

    return(

      <div className="container auth">
          <Link className="logo" to="/">MEMOPAD</Link>
          <div className="card">
              <div className="header blue white-text center">
                  <div className="card-content">{this.props.mode ? "LOGIN" : "REGISTER"}</div>
              </div>
              {this.props.mode ? loginView : registerView }
          </div>
      </div>

    );

  }
}

Auth.propTypes={
  mode: React.PropTypes.bool,
  onLogin: React.PropTypes.func,
  onRegister: React.PropTypes.func
}

Auth.defaultTypes={
  mode: true,
  onLogin: (username,password) => { console.error('login function not defined');},
  onRegister: (username,password) => { console.error('register function not defined');},
}

export default Auth;
