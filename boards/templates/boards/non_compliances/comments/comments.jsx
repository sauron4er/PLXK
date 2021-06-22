'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import NCNewComment from 'boards/templates/boards/non_compliances/comments/new_comment';
import NCComment from 'boards/templates/boards/non_compliances/comments/comment';

class NCComments extends React.Component {
  state = {
    new_comment_area_open: false
  };

  openNewCommentArea = () => {
    this.setState({new_comment_area_open: true});
  };

  closeNewCommentArea = () => {
    this.setState({new_comment_area_open: false});
  };

  render() {
    const {comments, phase} = nonComplianceStore.non_compliance;
    const {new_comment_area_open} = this.state;
  
    return (
      <div className='h-100 d-flex flex-column'>
        <div className='row font-weight-bold justify-content-center text-white bg-dark'>Коментарі</div>
        <If condition={phase > 0}>
          <If condition={!new_comment_area_open}>
            <button className='mt-2 btn btn-sm btn-outline-info' onClick={this.openNewCommentArea}>
              Додати коментар
            </button>
          </If>
          <If condition={new_comment_area_open}>
            <NCNewComment onPostComment={this.closeNewCommentArea} />
          </If>
          <hr className='w-100' />
          <For each='comment' of={comments} index='index'>
            <NCComment key={index} comment={comment}/>
          </For>
        </If>
      </div>
    );
  }
}

export default view(NCComments);
