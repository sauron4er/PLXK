'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import {notify} from 'templates/components/my_extras';
import Selector from 'templates/components/form_modules/selectors/selector';

class ApprovalDelegation extends React.Component {
  state = {
   selected_sub: '',
   selected_sub_id: 0
  }
  
  onSubmit = () => {
      this.props.onSubmit();
  };

  onClose = () => {
    this.props.onCloseModal();
  };

  onChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    docInfoStore.delegation_receiver_id = e.target.options[selectedIndex].getAttribute('data-key')
    this.setState({selected_sub: e.target.options[selectedIndex].getAttribute('value')})
  };

  render() {
    const {directSubs} = this.props;
    const {selected_sub} = this.state;

    return (
      <>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Делегування повноважень</h5>
          <button className='btn btn-link' onClick={this.onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <Choose>
          <When condition={directSubs.length > 0}>
            <div className='modal-body'>
              <Selector
                list={directSubs}
                selectedName={selected_sub}
                fieldName={'Підлеглий'}
                onChange={this.onChange}
                disabled={false}
              />
            </div>
            <div className='modal-footer'>
              <button className='btn btn-outline-info ml-1' onClick={this.onSubmit} disabled={docInfoStore.delegation_receiver_id === 0}>
                Делегувати
              </button>
            </div>
          </When>
          <Otherwise>
            <div>Схоже, у вас немає підлеглих, тому делегувати повноваження немає на кого.</div>
          </Otherwise>
        </Choose>
      </>
    );
  }

  static defaultProps = {
    onCloseModal: () => {},
    onSubmit: () => {},
    directSubs: []
  };
}

export default view(ApprovalDelegation);
