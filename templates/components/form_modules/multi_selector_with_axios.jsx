'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {getIndex, getItemById, notify, uniqueArray} from 'templates/components/my_extras';
import {LoaderSmall} from 'templates/components/loaders';
import nonComplianceStore from 'boards/templates/boards/non_compliances/non_compliance_store';
import Select from 'react-select';
import SubmitButton from 'templates/components/form_modules/submit_button';

class MultiSelectorWithAxios extends React.Component {
  state = {
    choice_list: [],
    selected_item: {id: 0, value: ''},
    selected_list: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest(`get_${this.props.listNameForUrl}'`)
      .then((response) => {
        this.setState({
          choice_list: response,
          loading: false
        });
      })
      .catch((error) => notify(error));
  }

  onChooseItem = (item) => {
    const selected_item = {
      id: item.id,
      value: item.name
    };
    this.setState({selected_item}, () => {
      this.addItem();
    });
  };

  addItem = () => {
    const {selected_item, selected_list} = this.state;

    if (selected_item.id) {
      const item = getItemById(selected_item.id, selected_list);
      if (item === -1) {
        let new_list = [...selected_list];
        new_list.push(selected_item);
        this.setState({
          selected_list: new_list,
          selected_item: {id: 0, value: ''}
        });
        this.props.onChange(new_list);
      }
    }
  };

  deleteItem = (index) => {
    let selected_list = [...this.state.selected_list];
    selected_list.splice(index, 1);
    this.setState({selected_list});
    this.props.onChange(selected_list);
  };

  render() {
    const {fieldName, disabled, hint, sideFields} = this.props;
    const {loading, choice_list, selected_list, selected_item} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
          <If condition={fieldName}>
            <label className='full_width' htmlFor={fieldName}>
              {fieldName}:
            </label>
          </If>

          <Select
            className='mt-2'
            options={choice_list}
            onChange={this.onChooseItem}
            isDisabled={disabled}
            value={selected_item}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
          />

          <div className='mt-2'>
            <For each='item' index='index' of={selected_list}>
              <If condition={item.status !== 'delete'}>
                <div key={item.id} className='css_list_item d-flex'>
                  <div className='mr-2'>
                    <div className='font-weight-bold'>{item.value}</div>

                    <For each='field' index='id' of={sideFields}>
                      <If condition={item[field]}>
                        <div>item[field]</div>
                      </If>
                    </For>

                    <If condition={item.files?.length}>
                      <div>Файли: {this.arrangeFiles(item.files)}</div>
                    </If>
                  </div>
                  <button
                    className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto'
                    onClick={() => this.deleteItem(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </If>
            </For>
          </div>
          <small>{hint}</small>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    listNameForUrl: '',
    fieldName: '',
    sideFields: [], // Назви полів, які теж мають відображатися
    hint: '',
    onChange: () => {},
    disabled: true
  };
}

export default MultiSelectorWithAxios;
