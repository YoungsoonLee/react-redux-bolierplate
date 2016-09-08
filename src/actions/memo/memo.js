import {
  MEMO_POST ,
  MEMO_POST_SUCCESS ,
  MEMO_POST_FAILURE,
  MEMO_LIST,
  MEMO_LIST_SUCCESS,
  MEMO_LIST_FAILURE,
  MEMO_EDIT,
  MEMO_EDIT_SUCCESS,
  MEMO_EDIT_FAILURE,
  MEMO_REMOVE,
  MEMO_REMOVE_SUCCESS,
  MEMO_REMOVE_FAILURE,
  MEMO_STAR,
  MEMO_STAR_SUCCESS,
  MEMO_STAR_FAILURE
} from './../ActionTypes';
import axios from 'axios';

/* post memo */
export function memoPostRequest(contents,token) {
  return (dispatch) => {
    // inform MEMO POST API is starting
    dispatch(memoPost());

    //sample for jwt  , server route : expressJwt({secret: process.env.JWT_SECRET})
    /*
    const request = axios({
      method: 'post',
      data: contents,
      url: '/api/memo',
      headers: {'Authorization': `Bearer ${token}`}
    });
    */

    //return axios.post('/api/memo', { contents })
    return axios({
      method: 'post',
      data: {
        contents: contents,
      },
      url: '/api/memo',
      headers: {'Authorization': `Bearer ${token}`}
    })
    .then((response) => {
      dispatch(memoPostSuccess());
    })
    .catch((error) => {
      dispatch(memoPostFailure(error.response.data));
    });
  }
}

export function memoPost() {
  return {
    type: MEMO_POST
  };
}

export function memoPostSuccess(){
  return {
    type: MEMO_POST_SUCCESS
  };
}

export function memoPostFailure(error){
  return {
    type: MEMO_POST_FAILURE,
    error
  };
}

/* list memo */
/*
    Parameter:
        - isInitial: whether it is for initial loading
        - listType:  OPTIONAL; loading 'old' memo or 'new' memo
        - id:        OPTIONAL; memo id (one at the bottom or one at the top)
        - username:  OPTIONAL; find memos of following user
*/

export function memoListRequest(isInitial, listType, id, username){
  return (dispatch) => {
    // inform memo list API is starting
    dispatch(memoList());

    let url = '/api/memo';

    if(typeof username==="undefined") {
        // username not given, load public memo
        url = isInitial ? url : `${url}/${listType}/${id}`;
        // or url + '/' + listType + '/' +  id
    } else {
      // load memos of a user
      url = isInitial ? `${url}/${username}` : `${url}/${username}/${listType}/${id}`;
    }

    return axios.get(url)
    .then((response) => {
        dispatch(memoListSuccess(response.data, isInitial, listType));
    }).catch((error) => {
        dispatch(memoListFailure());
    });
  }
}

export function memoList() {
  return {
    type: MEMO_LIST
  };
}

export function memoListSuccess(data, isInitial, listType){
  return {
    type: MEMO_LIST_SUCCESS,
    data,
    isInitial,
    listType
  };
}

export function memoListFailure(){
  return {
    type: MEMO_LIST_FAILURE
  };
}

/* edit memo*/
export function memoEditRequest(id, index, contents,token){
  return (dispatch) => {
    /* to be implement */
    dispatch(memoEdit())

    //return axios.put('/api/memo/' + id, { contents })
    return axios({
      method: 'put',
      data: {
        contents: contents,
      },
      url: '/api/memo/'+ id,
      headers: {'Authorization': `Bearer ${token}`}
    })
    .then((response) => {
        //console.log('action response:',response);
        dispatch(memoEditSuccess(index, response.data.memo));
    }).catch((error) => {
        //console.log('action error:',error.response.data);
        dispatch(memoEditFailure(error.response.data));
    });
  }
}

export function memoEdit(){
  return {
    type: MEMO_EDIT
  }
}

export function memoEditSuccess(index, memo){
  return {
    type: MEMO_EDIT_SUCCESS,
    index,
    memo  // fixed memo objext
  }
}

export function memoEditFailure(error){
  console.log('memoEditFailure:',error);
  return {
    type: MEMO_EDIT_FAILURE,
    error
  }
}

/* remove memo*/
export function memoRemoveRequest(id,index,token){
  return (dispatch) => {
      dispatch(memoRemove());

      //return axios.delete('/api/memo/' + id)
      return axios({
        method: 'delete',
        url: '/api/memo/'+ id,
        headers: {'Authorization': `Bearer ${token}`}
      })
      .then((response) => {
          dispatch(memoRemoveSuccess(index));
      }).catch((error) => {
          dispatch(memoRemoveFailure(error.response.data.code));
      });
  };
}

export function memoRemove(){
  return {
    type: MEMO_REMOVE
  };
}

export function memoRemoveSuccess(index) {
    return {
        type: MEMO_REMOVE_SUCCESS,
        index
    };
}

export function memoRemoveFailure(error) {
  return (dispatch) => {
       // TO BE IMPLEMENTED
       return axios.post('/api/memo/star/' + id)
       .then((response) => {
           dispatch(memoStarSuccess(index, response.data.memo));
       }).catch((error) => {
           dispatch(memoStarFailure(error.response.data.code));
       });
   };
}

/* MEMO TOGGLE STAR */
export function memoStarRequest(id, index,token) {
  return (dispatch) => {
    // to be implemented
    //return axios.post('/api/memo/star/'+id)
    return  axios({
       method: 'post',
       url: '/api/memo/star/'+id,
       headers: {'Authorization': `Bearer ${token}`}
     })
    .then((response) => {
      dispatch(memoStarSuccess(index,response.data.memo));
    })
    .catch((error) => {
      dispatch(memoStarFailure(error,response.data));
    });
  }
}

export function memoStar() {
    return {
        type: MEMO_STAR
    };
}

export function memoStarSuccess(index, memo) {
    return {
        type: MEMO_STAR_SUCCESS,
        index,
        memo
    };
}

export function memoStarFailure(error) {
    return{
        type: MEMO_STAR_FAILURE,
        error
    };
}
