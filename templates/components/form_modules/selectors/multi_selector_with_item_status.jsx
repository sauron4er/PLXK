'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getItemById, notify} from 'templates/components/my_extras';
import Select from 'react-select';

class MultiSelectorWithItemStatus extends React.Component {
  state = {
    selected_item: {id: 0, value: ''},
  };

  onChooseItem = (item) => {
    const selected_item = {
      id: item.id,
      name: item.name,
      status: 'new'
    };
    this.setState({selected_item}, () => {
      this.addItem();
    });
  };

  addItem = () => {
    const {selected_item} = this.state;
    const {selected} = this.props;

    if (selected_item.id) {
      const item = getItemById(selected_item.id, selected);
      if (item === -1) {
        let new_list = [...selected];
        new_list.push(selected_item);
        this.setState({selected_item: {id: 0, value: ''}});
        this.props.onChange(new_list);
      }
    }
  };

  deleteItem = (index) => {
    let selected = [...this.props.selected];
    if (selected[index].status === 'old') selected[index].status = 'del'
    else selected.splice(index, 1);
    this.props.onChange(selected);
  };

  render() {
    const {options, selected, fieldName, disabled, hint, sideFields} = this.props;
    const {selected_item} = this.state;
  
    return (
      <>
        <If condition={fieldName}>
          <label className='full_width' htmlFor={fieldName}>
            {fieldName}:
          </label>
        </If>

        <Select
          options={options}
          onChange={this.onChooseItem}
          isDisabled={disabled}
          value={selected_item}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
        />

        <div className='mt-2'>
          <For each='item' index='index' of={selected}>
            <If condition={item.status !== 'del'}>
              <div key={item.id} className='css_list_item d-flex'>
                <div className='mr-2'>
                  <div className='font-weight-bold'>{item.name}</div>

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
      </>
    );
  }

  static defaultProps = {
    options: [],
    selected: [],
    fieldName: '',
    sideFields: [], // Назви полів, які теж мають відображатися
    hint: '',
    onChange: () => {},
    disabled: true
  };
}

export default MultiSelectorWithItemStatus;
