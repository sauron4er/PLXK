'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave, faCheck} from '@fortawesome/free-solid-svg-icons';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class Text extends React.Component {
  state = {
    text: '',
    changed: false
  };

  componentDidMount() {
    this.setState({text: this.props.text});
  }

  onChange = (e) => {
    this.setState({text: e.target.value});
  };

  postChanges = (e) => {
    const {text_info, doc_info} = this.props;
    const {text} = this.state;

    let formData = new FormData();
    formData.append('document_id', doc_info.id);
    formData.append('text_queue', text_info.queue);
    formData.append('text', text);

    axiosPostRequest('change_text_module/', formData)
      .then((response) => {
        this.setState({changed: true});
      })
      .catch((error) => notify(error));
  };

  render() {
    const {text_info} = this.props;
    const {text, changed} = this.state;

    return (
      <If condition={text}>
        <Choose>
          <When condition={text_info.is_editable}>
            <div className='mt-1'>{text_info.field_name}:</div>
            <div className='d-flex align-items-center mt-1'>
              <input
                className='form-control mr-1'
                name='text'
                id={'text-' + text_info.queue}
                value={text}
                onChange={this.onChange}
                maxLength={5000}
              />
              <button className={'btn btn-sm btn-outline-dark'} onClick={() => this.postChanges()}>
                <FontAwesomeIcon icon={changed ? faCheck : faSave} />
              </button>
            </div>
          </When>
          <Otherwise>
            <div>{text_info.field_name}:</div>
            <div className='css_note_text'>{text}</div>
          </Otherwise>
        </Choose>
      </If>
    );
  }

  static defaultProps = {
    text: '',
    text_info: {
      field_name: '---',
      is_editable: false
    },
    doc_info: {},
    onChange: () => {}
  };
}

export default Text;
