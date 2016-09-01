//root container
import React from 'react';
//import components
import { Header } from 'components';
import { connect } from 'react-redux';
import { getStatusRequest , logoutRequest } from 'actions/user/auth';
import { searchRequest } from 'actions/search/search';

class App extends React.Component{
  constructor(props){
    super(props);

    this.handleLogout = this.handleLogout.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(keyword) {
        this.props.searchRequest(keyword);
    }

  handleLogout(){
    this.props.logoutRequest().then(
        () => {
            Materialize.toast('Good Bye!', 2000);

            // EMPTIES THE SESSION
            /*
            let loginData = {
                isLoggedIn: false,
                username: ''
            };
            document.cookie = 'key=' + btoa(JSON.stringify(loginData)); //!!!!
            */
           sessionStorage.removeItem('jwtToken'); //remove token from storage
        }
    );
  }

  componentDidMount() {
    //check status login through cookie
    // get cookie by name
    /*
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    // get loginData from cookie
    let loginData = getCookie('key');
    // if loginData is undefined, do nothing
    if(typeof loginData === "undefined") return;
    // decode base64 & parse json
    loginData = JSON.parse(atob(loginData));
    // if not logged in, do nothing
    if(!loginData.isLoggedIn) return;
    // page refreshed & has a session in cookie,
    // check whether this cookie is valid or not
    */

   // get using from jwtToken
   let token = sessionStorage.getItem('jwtToken');
   if(!token || token === '') {//if there is no token, dont bother
   	return;
   }

    this.props.getStatusRequest(token).then(
        () => {
            //console.log(this.props.status);
            // if session is not valid
            if(!this.props.status.valid) {

                //document.cookie='key=' + btoa(JSON.stringify(loginData));
                sessionStorage.removeItem('jwtToken'); //remove token from storage

                // and notify
                let $toastContent = $('<span style="color: #FFB4BA">Your session is expired, please log in again</span>');
                Materialize.toast($toastContent, 4000);

            }
        }
    );

  }

  render(){
    /* Check whether current route is login or register using regex for remove Header when login or register */
    let re = /(login|register)/;
    let isAuth = re.test(this.props.location.pathname);

    return (
      <div>
        { isAuth ? undefined : <Header  isLoggedIn={this.props.status.isLoggedIn}
                                        onLogout={this.handleLogout}
                                        currentUser={this.props.status.currentUser}
                                        onSearch={this.handleSearch}
                                        usernames={this.props.searchResults}/> }
        { this.props.children }
      </div>
    );
  }
}

//reducer
const mapStateToProps = (state) => {
    return {
        status: state.auth.status,
        searchResults: state.search.usernames
    };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getStatusRequest: (token) => {
      return dispatch(getStatusRequest(token));
    },
    logoutRequest: () => {
      return dispatch(logoutRequest());
    },
    searchRequest: (keyword) => {
        return dispatch(searchRequest(keyword));
    }

  }

}

export default connect(mapStateToProps,mapDispatchToProps)(App);
