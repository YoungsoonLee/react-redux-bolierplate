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
        if(this.props.status === 'SUCCESS'){
          Materialize.toast('Success! Please log in.', 2000);
          sessionStorage.setItem('jwtToken', this.props.token); //!!!!
          browserHistory.push('/');
          return true;

        }else{
           let $toastContent = $('<span style="color: #FFB4BA">' +this.props.errorCode.MESSAGE + '</span>');
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
