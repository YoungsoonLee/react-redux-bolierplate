import {
  AUTH_LOGIN ,
  AUTH_LOGIN_SUCCESS ,
  AUTH_LOGIN_FAILURE ,
  AUTH_REGISTER,
  AUTH_REGISTER_SUCCESS,
  AUTH_REGISTER_FAILURE,
  AUTH_GET_STATUS,
  AUTH_GET_STATUS_SUCCESS,
  AUTH_GET_STATUS_FAILURE,
  AUTH_LOGOUT
} from './../ActionTypes';
import axios from 'axios';

/*============================================================================
    authentication
==============================================================================*/

/* LOGIN */
export function loginRequest(username,password){
  return (dispatch) => {
    dispatch(login());

    return axios.post('/api/user/signin',{ username , password })
    .then((response)=>{
      //console.log('action login:',response.data);
      dispatch(loginSuccess(response.data));
    }).catch((error)=>{
      dispatch(loginFailure(error.response.data));
    });
  }
}

export function login(){
  return {
    type: AUTH_LOGIN
  };
}

export function loginSuccess(payload){
  //console.log('action',payload);
  return {
    type: AUTH_LOGIN_SUCCESS,
    payload
  };
}

export function loginFailure(error){
  return {
    type: AUTH_LOGIN_FAILURE,
    error
  };
}

/* REGISTER */
export function registerRequest(username,password){
  return (dispatch) => {
    dispatch(register());

    return axios.post('/api/user/signup', { username, password })
    .then((response) => {
        //console.log('action auth:',response);
        dispatch(registerSuccess(response.data));
    }).catch((error) => {
        //console.log('action:',error.response.data);
        dispatch(registerFailure(error.response.data));
    });
  };
}

export function register(){
  return {
    type: AUTH_REGISTER
  };
}

export function registerSuccess(payload){
  return {
    type: AUTH_REGISTER_SUCCESS,
    payload
  };
}

export function registerFailure(error){
  return {
    type: AUTH_REGISTER_FAILURE,
    error
  };
}


/* GET STATUS */
export function getStatusRequest(token) {
  return (dispatch) => {
      // inform Get Status API is starting
      dispatch(getStatus());

      return axios({
        method: 'get',
        url: '/api/user/getinfo',
        headers: {'Authorization': `Bearer ${token}`}
      })
      //return axios.get('/api/user/getinfo?token='+token)
      .then((response) => {
          dispatch(getStatusSuccess(response.data));
      }).catch((error) => {
          dispatch(getStatusFailure());
      });
  };
}

export function getStatus() {
    return {
        type: AUTH_GET_STATUS
    };
}

export function getStatusSuccess(payload) {
    return {
        type: AUTH_GET_STATUS_SUCCESS,
        payload
    };
}

export function getStatusFailure() {
    return {
        type: AUTH_GET_STATUS_FAILURE
    };
}

/* Logout */
export function logoutRequest() {
    return (dispatch) => {
        return axios.post('/api/user/logout')
        .then((response) => {
            dispatch(logout());
        });
    };
}

export function logout() {
    return {
        type: AUTH_LOGOUT
    };
}
