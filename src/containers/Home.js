import React from 'react';
import { connect } from 'react-redux';
import { Writer, MemoList} from 'components';
import { memoPostRequest,memoListRequest,memoEditRequest,memoRemoveRequest,memoRemoveFromData,memoStarRequest} from 'actions/memo/memo';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.handlePost = this.handlePost.bind(this);
    this.loadNewMemo = this.loadNewMemo.bind(this);
    this.loadOldMemo = this.loadOldMemo.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.state = {
      loadingState: false,
      initiallyLoaded: false
    };

  }

  componentDidMount() {
    // LOAD NEW MEMO EVERY 5 SECONDS
    const loadMemoLoop = () => {
      this.loadNewMemo().then(
        () => {
          this.memoLoaderTimeoutId = setTimeout(loadMemoLoop, 5000);
        }
      );

      // DO THE INITIAL LOADING
      this.props.memoListRequest(true, undefined, undefined, this.props.username).then(
        () => {
          this.setState({
            initiallyLoaded: true
          });
        }
      );
    };

    const loadUntilScrollable = () => {
      // IF THE SCROLLBAR DOES NOT EXIST,
      if ($("body").height() < $(window).height()) {
        this.loadOldMemo().then(
          () => {
            // DO THIS RECURSIVELY UNLESS IT'S LAST PAGE
            if (!this.props.isLast) {
              loadUntilScrollable();
            }
          }
        );
      }
    };

    this.props.memoListRequest(true, undefined, undefined, this.props.username).then(
      () => {
        // LOAD MEMO UNTIL SCROLLABLE
        setTimeout(loadUntilScrollable, 1000);
        loadMemoLoop();
      }
    );

    $(window).scroll(() => {
      // WHEN HEIGHT UNDER SCROLLBOTTOM IS LESS THEN 250
      if ($(document).height() - $(window).height() - $(window).scrollTop() < 250) {
        if (!this.state.loadingState) {
          this.loadOldMemo();
          this.setState({
            loadingState: true
          });
        }
      } else {
        if (this.state.loadingState) {
          this.setState({
            loadingState: false
          });
        }
      }
    });
  }

  componentWillUnmount() {
    // STOPS THE loadMemoLoop
    clearTimeout(this.memoLoaderTimeoutId);
    // REMOVE WINDOWS SCROLL LISTENER
    $(window).unbind();

    this.setState({
      initiallyLoaded: false
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.username !== prevProps.username) {
      this.componentWillUnmount();
      this.componentDidMount();
    }
  }

  loadNewMemo() {
    // CANCEL IF THERE IS A PENDING REQUEST
    if (this.props.listStatus === 'WAITING')
      return new Promise((resolve, reject) => {
        resolve();
      });

    // IF PAGE IS EMPTY, DO THE INITIAL LOADING
    if (this.props.memoData.length === 0)
      return this.props.memoListRequest(true, undefined, undefined, this.props.username);

    return this.props.memoListRequest(false, 'new', this.props.memoData[0]._id, this.props.username);
  }

  loadOldMemo() {
    // CANCEL IF USER IS READING THE LAST PAGE
    if (this.props.isLast) {
      return new Promise(
        (resolve, reject) => {
          resolve();
        }
      );
    }

    // GET ID OF THE MEMO AT THE BOTTOM
    let lastId = this.props.memoData[this.props.memoData.length - 1]._id;

    // START REQUEST
    return this.props.memoListRequest(false, 'old', lastId, this.props.username).then(() => {
      // IF IT IS LAST PAGE, NOTIFY
      if (this.props.isLast) {
        Materialize.toast('You are reading the last page', 2000);
      }
    });
  }

  handlePost(contents) {
    let token = sessionStorage.getItem('jwtToken');

    return this.props.memoPostRequest(contents,token).then(
      () => {

        if (this.props.postStaus.status === 'SUCCESS') {
          this.loadNewMemo().then(
            () => {
              Materialize.toast('Success!', 2000);
            }
          );
        } else {
          /*
              ERROR CODES
                  1: NOT LOGGED IN
                  2: EMPTY CONTENTS
          */
          //console.log(this.props.postStaus);

          let $toastContent;
          $toastContent = $('<span style="color: #FFB4BA">'+this.props.postStaus.error.MESSAGE+'</span>');
          Materialize.toast($toastContent, 2000);

          if(this.props.postStaus.error.CODE === 1){ //not logged in
            setTimeout(() => {
              location.reload(false);
            }, 2000);
          }

          /*
          switch (this.props.postStaus.error) {
            case 1:
              // IF NOT LOGGED IN, NOTIFY AND REFRESH AFTER
              $toastContent = $('<span style="color: #FFB4BA">You are not logged in</span>');
              Materialize.toast($toastContent, 2000);
              setTimeout(() => {
                location.reload(false);
              }, 2000);
              break;
            case 2:
              $toastContent = $('<span style="color: #FFB4BA">Please write something</span>');
              Materialize.toast($toastContent, 2000);
              break;
            default:
              $toastContent = $('<span style="color: #FFB4BA">Something Broke</span>');
              Materialize.toast($toastContent, 2000);
              break;
          }
          */
        }
      }
    );
  }

  handleStar(id, index) {
    let token = sessionStorage.getItem('jwtToken');
    return this.props.memoStarRequest(id, index,token).then(
      () => {
        if (this.props.starStatus.status !== 'SUCCESS') {
          /*
              TOGGLES STAR OF MEMO: POST /api/memo/star/:id
              ERROR CODES
                  1: INVALID ID
                  2: NOT LOGGED IN
                  3: NO RESOURCE
          */
          let errorMessage = [
            'Something broke',
            'You are not logged in',
            'That memo does not exist'
          ];

          // NOTIFY ERROR
          let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.starStatus.error - 1] + '</span>');
          Materialize.toast($toastContent, 2000);

          // IF NOT LOGGED IN, REFRESH THE PAGE
          if (this.props.starStatus.error === 2) {
            setTimeout(() => {
              location.reload(false)
            }, 2000);
          }
        }
      }
    );
  }

  handleEdit(id, index, contents) {
    let token = sessionStorage.getItem('jwtToken');
    return this.props.memoEditRequest(id, index, contents,token).then(
      () => {
        if (this.props.editStatus.status === "SUCCESS") {
          Materialize.toast('Success!', 2000);
        } else {
          /*
              ERROR CODES
                  1: INVALID ID,
                  2: EMPTY CONTENTS
                  3: NOT LOGGED IN
                  4: NO RESOURCE
                  5: PERMISSION FAILURE
          */
         /*
          let errorMessage = [
            'Something broke',
            'Please write soemthing',
            'You are not logged in',
            'That memo does not exist anymore',
            'You do not have permission'
          ];
          */
         
          //let error = this.props.editStatus.error;

          // NOTIFY ERROR
          let $toastContent = $('<span style="color: #FFB4BA">' + this.props.editStatus.error.MESSAGE + '</span>');
          Materialize.toast($toastContent, 2000);

          // IF NOT LOGGED IN, REFRESH THE PAGE AFTER 2 SECONDS
          if (error === 3) {
            setTimeout(() => {
              location.reload(false)
            }, 2000);
          }

        }
      }
    );
  }

  handleRemove(id, index) {
    let token = sessionStorage.getItem('jwtToken');
    this.props.memoRemoveRequest(id, index,token).then(() => {
      if (this.props.removeStatus.status === "SUCCESS") {
        // LOAD MORE MEMO IF THERE IS NO SCROLLBAR
        // 1 SECOND LATER. (ANIMATION TAKES 1SEC)
        setTimeout(() => {
          if ($("body").height() < $(window).height()) {
            this.loadOldMemo();
          }
        }, 1000);
      } else {
        // ERROR
        /*
            DELETE MEMO: DELETE /api/memo/:id
            ERROR CODES
                1: INVALID ID
                2: NOT LOGGED IN
                3: NO RESOURCE
                4: PERMISSION FAILURE
        */
       /*
        let errorMessage = [
          'Something broke',
          'You are not logged in',
          'That memo does not exist',
          'You do not have permission'
        ];
        */

        // NOTIFY ERROR
        let $toastContent = $('<span style="color: #FFB4BA">' + this.props.removeStatus.error.MESSAGE + '</span>');
        Materialize.toast($toastContent, 2000);


        // IF NOT LOGGED IN, REFRESH THE PAGE
        if (this.props.removeStatus.error === 2) {
          setTimeout(() => {
            location.reload(false)
          }, 2000);
        }
      }
    });
  }

  render() {
    const write = (
      <Writer onPost={this.handlePost} />
    );

    const emptyView = (
      <div className="container">
              <div className="empty-page">
                  <b>{this.props.username}</b> isn't registered or hasn't written any memo
              </div>
          </div>
    );

    const wallHeader = (
      <div>
               <div className="container wall-info">
                   <div className="card wall-info blue lighten-2 white-text">
                       <div className="card-content">
                           {this.props.username}
                       </div>
                   </div>
               </div>
               { this.props.memoData.length === 0 && this.state.initiallyLoaded ? emptyView : undefined }
           </div>
    );

    return (
      <div className="wrapper">
             { typeof this.props.username !== "undefined" ? wallHeader : undefined }
             { this.props.isLoggedIn ? write : undefined }
             <MemoList  data={this.props.memoData}
                        currentUser={this.props.currentUser}
                        onEdit={this.handleEdit}
                        onRemove={this.handleRemove}
                        onStar={this.handleStar} />
         </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    postStaus: state.memo.post,
    isLoggedIn: state.auth.status.isLoggedIn,
    currentUser: state.auth.status.currentUser,
    memoData: state.memo.list.data,
    listStatus: state.memo.list.status,
    isLast: state.memo.list.isLast,
    editStatus: state.memo.edit,
    removeStatus: state.memo.remove,
    starStatus: state.memo.star
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    memoPostRequest: (contents,token) => {
      return dispatch(memoPostRequest(contents,token));
    },
    memoListRequest: (isInitial, listType, id, username) => {
      return dispatch(memoListRequest(isInitial, listType, id, username));
    },
    memoEditRequest: (id, index, contents,token) => {
      return dispatch(memoEditRequest(id, index, contents,token));
    },
    memoRemoveRequest: (id, index,token) => {
      return dispatch(memoRemoveRequest(id, index,token));
    },
    memoStarRequest: (id, index ,token) => {
      return dispatch(memoStarRequest(id, index,token));
    }
  }
}

Home.PropTypes = {
  username: React.PropTypes.string
};

Home.defaultProps = {
  username: undefined
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
