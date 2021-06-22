'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import TextInput from 'templates/components/form_modules/text_input';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class NCNewComment extends React.Component {
  changeNewComment = (e) => {
    nonComplianceStore.non_compliance.new_comment = e.target.value;
  };

  changeNewCommentFiles = (e) => {
    nonComplianceStore.non_compliance.new_comment_files = e.target.value;
  };

  postNewComment = () => {
    const {id, new_comment, new_comment_files} = nonComplianceStore.non_compliance;
    const {originalId} = this.props;

    let formData = new FormData();
    formData.append('non_compliance_id', id);
    formData.append('comment', new_comment);
    formData.append('original_comment_id', originalId === 0 ? '' : originalId);

    if (new_comment_files?.length > 0) {
      new_comment_files.map((file) => {
        formData.append('new_comment_files', file);
      });
    }

    axiosPostRequest('post_new_comment', formData)
      .then((response) => {
        nonComplianceStore.non_compliance.comments = response
        this.props.onPostComment();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {non_compliance} = nonComplianceStore;
    const {originalId} = this.props;

    return (
      <div className={originalId === 0 ? '' : 'bg-light p-1 px-2'}>
        <TextInput
          fieldName={originalId === 0 ? 'Додати коментар' : 'Додати відповідь'}
          text={non_compliance.new_comment}
          maxLength={1000}
          disabled={false}
          onChange={this.changeNewComment}
        />
        <FilesUpload
          onChange={this.changeNewCommentFiles}
          files={non_compliance.new_comment_files}
          module_info={{field_name: 'Додати файли'}}
        />
        <SubmitButton className='btn-info' text='Зберегти' onClick={this.postNewComment} />
      </div>
    );
  }

  static defaultProps = {
    originalId: 0,
    onPostComment: () => {}
  };
}

export default view(NCNewComment);
