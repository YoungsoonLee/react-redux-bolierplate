'use strict';

module.exports = {
  /* sign up */
  BAD_USERNAME: { MESSAGE: 'Bad username', CODE:1 },
  BAD_PASSWORD: { MESSAGE: 'Bad password. Password should have range 8 to 16.', CODE:2 },
  USERNAME_EXISTS: { MESSAGE: 'Already username exists.', CODE:4 },

  /* sign in */
  LOGIN_FAILED: { MESSAGE: 'Login failed. Check username and password.', CODE:1 },
  NOT_EXISTS_USERNAME: { MESSAGE: 'Login failed. Not exists username.', CODE:2 },
  WORNG_PASSWORD: { MESSAGE: 'Login failed. Wrong password.', CODE:3 },

  /* auth */
  NOT_LOGIN: { MESSAGE: 'Not logged in. You should do login.', CODE:1 },
  EXPIRE_SESSION: { MESSAGE: 'Your session is expired, please log in again' ,CODE:1 },

  /* memo */
  EMPTY_CONTENTS: { MESSAGE: 'Empty Contents. You should write contents' , CODE:2 },
  PERMISSION_FAILURE: { MESSAGE: 'PERMISSION FAILURE' , CODE:4 },
  INVALID_ID: { MESSAGE: 'INVALID ID' , CODE:1 },
  NO_RESOURCE: { MESSAGE: 'NO RESOURCE' , CODE:3 },
}
