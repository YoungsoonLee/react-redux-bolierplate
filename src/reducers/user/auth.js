//리듀서는 단지 다음 상태를 계산하는 순수 함수
//pure reducers
//always return new object(new state) in reducer
import * as types from 'actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
  login:{
    status:'INIT'
  },
  status: {
    valid: false,
    isLoggedIn: false,
    currentUser: '',
    token: ''
  },
  register: {
    status: 'INIT',
    error: -1
  }
}

export default function auth(state,action){
  if(typeof state === 'undefined'){
    state = initialState;
  }

  switch (action.type) {
    case types.AUTH_REGISTER:
      return update(state,{
        register:{
          status: { $set: 'WAITING' }
        }
      });
    case types.AUTH_REGISTER_SUCCESS:
      return update(state,{
        register:{
          status: { $set: 'SUCCESS'}
        },
        status: {
          token: { $set: action.payload.token },
          valid: { $set: true },
          isLoggedIn: { $set: true},
          currentUser: { $set: action.payload.username },
        }
      });
    case types.AUTH_REGISTER_FAILURE:
      return update(state,{
        register:{
          status: { $set: 'FAILURE' },
          error: { $set: action.error }
        }
      });
    case types.AUTH_LOGIN:
      return update(state,{
        login: {
          status: { $set: 'WAITING' }
        }
      });
    case types.AUTH_LOGIN_SUCCESS:
      //console.log('reducer',action.payload);
      return update(state,{
        login: {
          status: { $set: 'SUCCESS' }
        },
        status: {
          token: { $set: action.payload.token },
          valid: { $set: true },
          isLoggedIn: { $set: true},
          currentUser: { $set: action.payload.username },
        }
      });
    case types.AUTH_LOGIN_FAILURE:
      return update(state,{
        login:{
          status: { $set: 'FAILURE' }
        }
      });
    case types.AUTH_GET_STATUS:
      return update(state,{
        status:{
          //isLoggedIn: { $set: true }
          isLoggedIn: { $set: false }
        }
      })
    case types.AUTH_GET_STATUS_SUCCESS:
      return update(state,{
        status:{
          token: { $set: action.payload.token },
          valid: { $set: true },
          isLoggedIn: { $set: true},
          currentUser: { $set: action.payload.username },
        }
      })
    case types.AUTH_GET_STATUS_FAILURE:
      return update(state,{
        status: {
          valid: { $set: false },
          isLoggedIn: { $set: false }
        }
      })
    case types.AUTH_LOGOUT:
      return update(state,{
        status: {
          token: { $set: '' },
          valid: { $set: false },
          isLoggedIn: { $set: false },
          currentUser: { $set: '' },
        }
      })
    default:
      return state;
  }

}
