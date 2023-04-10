'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import Modal from 'react-responsive-modal';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import SelectorWithFilter from 'templates/components/form_modules/selectors/selector_with_filter';
import DocumentSimpleView from 'edms/templates/edms/my_docs/doc_info/document_simple_view';

class ClientRequirementsChoose extends React.Component {
  state = {
    requirements: [],
    loading: false,
    modal_open: false
  };

  getRequirementsDocs() {
    this.setState({loading: true}, () => {
      axiosGetRequest(`get_client_requirements_for_choose/${this.props.counterparty}`)
        .then((response) => {
          console.log(response);
          this.setState({
            requirements: response,
            loading: false
          });
        })
        .catch((error) => notify(error));
    });
  }

  componentDidMount() {
    if (newDocStore.new_document.counterparty_type === 'client' && this.props.counterparty) {
      this.getRequirementsDocs();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.counterparty !== this.props.counterparty) {
      this.getRequirementsDocs();
    }
  }

  onChoseRequirementChange(e) {
    newDocStore.new_document.choosed_client_requirement_name = e.name;
    newDocStore.new_document.choosed_client_requirement = e.id;
  }

  render() {
    const {requirements, loading, modal_open} = this.state;
    const {choosed_client_requirement, choosed_client_requirement_name, counterparty_type} = newDocStore.new_document;
    const {module_info, counterparty} = this.props;

    return (
      <>
        <small className='text-danger'>{module_info?.additional_info}</small>
        <If condition={counterparty_type === 'client'}>
          <Choose>
            <When condition={!loading}>
              <Choose>
                <When condition={requirements?.length !== 0}>
                  <SelectorWithFilter
                    list={requirements}
                    fieldName={module_info.field_name}
                    valueField='name'
                    selectedName=''
                    disabled={false}
                    value={{name: choosed_client_requirement_name, id: choosed_client_requirement}}
                    onChange={this.onChoseRequirementChange}
                  />
                  <If condition={choosed_client_requirement !== 0}>
                    <button
                      className='btn btn-outline-info'
                      onClick={() => this.setState({modal_open: true})}
                      disabled={!newDocStore.new_document.choosed_client_requirement}
                    >
                      Переглянути Вимоги
                    </button>
                  </If>
                </When>
                <When condition={!counterparty}>
                  <div className='font-italic'>Оберіть клієнта</div>
                </When>
                <Otherwise>
                  <div className='font-italic'>В базу не внесено жодних Вимог обраного клієнта</div>
                </Otherwise>
              </Choose>
            </When>
            <Otherwise>
              <div className='mt-3 loader-small' id='loader-1'>
                {' '}
              </div>
            </Otherwise>
          </Choose>
        </If>

        <Modal
          open={modal_open}
          onClose={() => this.setState({modal_open: false})}
          showCloseIcon={true}
          closeOnOverlayClick={true}
          styles={{modal: {marginTop: 75}}}
        >
          <DocumentSimpleView doc_id={newDocStore.new_document.choosed_client_requirement} />
        </Modal>
      </>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: 'Вибір вимог клієнта',
      queue: 0,
      required: false,
      additional_info: null
    },
    onChange: () => {},
    counterparty: 0
  };
}

export default view(ClientRequirementsChoose);
