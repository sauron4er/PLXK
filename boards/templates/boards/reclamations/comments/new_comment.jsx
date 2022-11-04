'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from 'boards/templates/boards/reclamations/store';
import TextInput from 'templates/components/form_modules/text_input';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

function ReclamationNewComment(props) {
  const {reclamation} = reclamationsStore;

  function changeNewComment(e) {
    reclamation.new_comment = e.target.value;
  }

  function changeNewCommentFiles(e) {
    reclamation.new_comment_files = e.target.value;
  }

  function postNewComment() {
    const {id, new_comment, new_comment_files} = reclamation;
    const {originalId} = props;

    let formData = new FormData();
    formData.append('reclamation_id', id);
    formData.append('comment', new_comment);
    formData.append('original_comment_id', originalId === 0 ? '' : originalId);

    if (new_comment_files?.length > 0) {
      new_comment_files.map((file) => {
        formData.append('new_comment_files', file);
      });
    }

    axiosPostRequest('reclamation_post_new_comment', formData)
      .then((response) => {
        reclamation.comments = response;
        reclamation.new_comment = '';
        reclamation.new_comment_files = [];
        props.onPostComment();
      })
      .catch((error) => notify(error));
  }

  return (
    <div className={props.originalId === 0 ? '' : 'bg-light p-1 px-2'}>
      <TextInput
        fieldName={props.originalId === 0 ? 'Додати коментар' : 'Додати відповідь'}
        text={reclamation.new_comment}
        maxLength={1000}
        disabled={false}
        onChange={changeNewComment}
      />
      <FilesUpload onChange={changeNewCommentFiles} files={reclamation.new_comment_files} module_info={{field_name: 'Додати файли'}} />
      <SubmitButton className='btn-info' text='Зберегти' onClick={postNewComment} />
    </div>
  );
}

ReclamationNewComment.defaultProps = {
  originalId: 0,
  onPostComment: () => {}
};

export default view(ReclamationNewComment);
