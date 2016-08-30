import React from 'react';
import { Auth } from 'components';
import { connect } from 'react-redux';
import { loginRequest } from 'actions/user/auth';
import { browserHistory } from 'react-router';


class Login extends React.Component {

    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
    }

    handleLogin(username, password) {
        return this.props.loginRequest(username, password).then(
            () => {

                if(this.props.status === "SUCCESS") {
                    /*
                    let loginData = {
                        isLoggedIn: true,
                        username: username
                    };
                    //use cookie
                    //document.cookie = 'key=' + btoa(JSON.stringify(loginData));
                    */
                    //use jwt
                    //console.log('container:',this.props.token);
                    sessionStorage.setItem('jwtToken', this.props.token);

                    Materialize.toast('Welcome ' + username + '!', 2000);
                    browserHistory.push('/');
                    return true;
                } else {
                    let $toastContent = $('<span style="color: #FFB4BA">Incorrect username or password</span>');
                    Materialize.toast($toastContent, 2000);
                    return false;
                }
            }
        );
    }

    render() {
        return (
            <div>
                <Auth mode={true}
                    onLogin={this.handleLogin}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.auth.login.status,
        token: state.auth.status.token,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loginRequest: (username, password) => {
            return dispatch(loginRequest(username,password));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
