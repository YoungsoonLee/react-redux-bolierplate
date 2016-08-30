import React from 'react'
import { Auth } from 'components';
import { connect } from 'react-redux';
import { registerRequest } from 'actions/user/auth';
import { browserHistory } from 'react-router';

class Register extends React.Component {
  constructor(props){
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleRegister(username,password){
    return this.props.registerRequest(username,password).then(
      ()=>{
        //console.log('con',this.props.token);

        if(this.props.status === 'SUCCESS'){
          Materialize.toast('Success! Please log in.', 2000);

          /* to be implemet for jwy*/
          /*
            1. save jwt
            2. auto login
          */
          sessionStorage.setItem('jwtToken', this.props.token); //!!!!

          browserHistory.push('/');
          return true;

        }else{
          /*
               ERROR CODES:
                   1: BAD USERNAME
                   2: BAD PASSWORD
                   3: USERNAME EXISTS
           */
           let errorMessage = [
               'Invalid Username',
               'Password is too short',
               'Username already exists'
           ];

           //console.log(this.props.errorCode);

           let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.errorCode - 1] + '</span>');
           Materialize.toast($toastContent, 2000);
           return false;
        }
      }
    );
  }

  render(){
    return(
      <div>
        <Auth mode={false} onRegister={this.handleRegister}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    status: state.auth.register.status,
    token: state.auth.status.token,
    errorCode: state.auth.register.error
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    registerRequest: (username,password) => {
      return dispatch(registerRequest(username, password));
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Register);
