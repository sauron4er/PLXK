'use strict';
import React, {useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from 'boards/templates/boards/reclamations/store';
import ReclamationNewComment from "boards/templates/boards/reclamations/comments/new_comment";
import ReclamationComment from "boards/templates/boards/reclamations/comments/comment";

function ReclamationComments() {
  const [newCommentAreaOpen, setNewCommentAreaOpen] = useState(false);
  const {comments, phase} = reclamationsStore.reclamation;

  function openNewCommentArea() {
    setNewCommentAreaOpen(true);
  }

  function closeNewCommentArea() {
    setNewCommentAreaOpen(false);
  }

  return (
    <div className='h-100 d-flex flex-column'>
      <div className='row font-weight-bold justify-content-center text-white bg-dark'>Коментарі</div>
      <If condition={phase > 0}>
        <If condition={!newCommentAreaOpen}>
          <button className='mt-2 btn btn-sm btn-outline-info' onClick={openNewCommentArea}>
            Додати коментар
          </button>
        </If>
        <If condition={newCommentAreaOpen}>
          <ReclamationNewComment onPostComment={closeNewCommentArea} />
        </If>
        <hr className='w-100' />
        <For each='comment' of={comments} index='index'>
          <ReclamationComment key={index} comment={comment} />
        </For>
      </If>
    </div>
  );
}

export default view(ReclamationComments);
