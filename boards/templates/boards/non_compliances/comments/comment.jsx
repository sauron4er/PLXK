'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import NCNewComment from 'boards/templates/boards/non_compliances/comments/new_comment';

class NCComment extends React.Component {
  state = {
    new_comment_area_open: false
  };

  openNewCommentArea = () => {
    this.setState({new_comment_area_open: true});
  };

  closeNewCommentArea = () => {
    this.setState({new_comment_area_open: false});
  };

  func = () => {};

  render() {
    const {comment} = this.props;
    const {new_comment_area_open} = this.state;

    return (
      <>
        <div className='css_path p-2 mb-1'>
          <div className='font-italic mb-1'>{comment.author}</div>
          <hr className='m-0' />
          <If condition={comment.original_comment_id !== 0}>
            <blockquote className='m-1'>
              <small>
                <div className='font-italic'>{comment.original_comment_author}</div>
                <div className='font-italic'>{comment.original_comment_text}</div>
              </small>
            </blockquote>
          </If>
          <div>{comment.text}</div>
          <If condition={comment.files.length > 0}>
            {comment.files.map((file) => {
              return (
                <div key={file.id}>
                  <a href={'../../media/' + file.file} download>
                    {file.name}{' '}
                  </a>
                </div>
              );
            })}
          </If>
          <If condition={!new_comment_area_open}>
            <div className='d-flex'>
              <button type='button' className='ml-auto btn btn-sm btn-light btn-outline-secondary my-1' onClick={this.openNewCommentArea}>
                Відповісти
              </button>
            </div>
          </If>
          <If condition={new_comment_area_open}>
            <NCNewComment onPostComment={this.closeNewCommentArea} originalId={comment.id} />
          </If>
        </div>
      </>
    );
  }

  static defaultProps = {
    comment: {
      id: 0,
      text: '',
      original_comment_id: 0,
      original_comment_text: '',
      files: []
    }
  };
}

export default view(NCComment);
