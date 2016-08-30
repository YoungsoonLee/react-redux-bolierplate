import { combineReducers } from 'redux';
import auth from './user/auth';
import memo from './memo/memo';
import search from './search/search';

export default combineReducers({
  auth ,  memo , search
});
