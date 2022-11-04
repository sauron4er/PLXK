'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import ReclamationNewComment from 'boards/templates/boards/reclamations/comments/new_comment';
import {useState} from 'react';

function ReclamationComment(props) {
  const [newCommentAreaOpen, setNewCommentAreaOpen] = useState(false);

  function openNewCommentArea() {
    setNewCommentAreaOpen(true);
  }

  function closeNewCommentArea() {
    setNewCommentAreaOpen(false);
  }

  return (
    <>
      <div className='css_path p-2 mb-1'>
        <div className='font-italic mb-1'>{props.comment.author}</div>
        <hr className='m-0' />
        <If condition={props.comment.original_comment_id !== 0}>
          <blockquote className='m-1'>
            <small>
              <div className="font-italic">{props.comment.original_comment_author}</div>
              <div className="font-italic">{props.comment.original_comment_text}</div>
            </small>
          </blockquote>
        </If>
        <div>{props.comment.text}</div>
        <If condition={props.comment.files.length > 0}>
          {props.comment.files.map((file) => {
            return (
              <div key={file.id}>
                <a href={'../../media/' + file.file} download>
                  {file.name}{' '}
                </a>
              </div>
            );
          })}
        </If>
        <If condition={!newCommentAreaOpen}>
          <div className='d-flex'>
            <button type='button' className='ml-auto btn btn-sm btn-light btn-outline-secondary my-1' onClick={openNewCommentArea}>
              Відповісти
            </button>
          </div>
        </If>
        <If condition={newCommentAreaOpen}>
          <ReclamationNewComment onPostComment={closeNewCommentArea} originalId={props.comment.id} />
        </If>
      </div>
    </>
  );
}

ReclamationComment.defaultProps = {
  comment: {
    id: 0,
    text: '',
    original_comment_id: 0,
    original_comment_text: '',
    files: []
  }
};

export default view(ReclamationComment);
