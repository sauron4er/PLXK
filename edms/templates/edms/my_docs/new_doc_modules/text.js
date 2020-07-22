'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {getIndexByProperty} from 'templates/components/my_extras';

class Text extends React.Component {
  componentDidMount() {
    if (this.props.type === 'dimensions') {
      newDocStore.new_document.dimensions.push({
        queue: this.props.queue,
        text: this.props.text
      });
    }
  }

  onDimensionsChange = (event) => {
    let text_box_id = event.target.id.substring(5); // видаляємо 'text-' з ід інпуту
    const queue = getIndexByProperty(
      newDocStore.new_document.dimensions,
      'queue',
      parseInt(text_box_id)
    );
    if (queue === -1) {
      newDocStore.new_document.dimensions.push({
        queue: parseInt(text_box_id),
        text: event.target.value
      });
    } else {
      newDocStore.new_document.dimensions[queue].text = event.target.value;
    }
  };

  getDimension = (queue) => {
    let text = this.props.text;
    const dimension_queue = getIndexByProperty(
      newDocStore.new_document.dimensions,
      'queue',
      parseInt(queue)
    );
    if (dimension_queue !== -1) text = newDocStore.new_document.dimensions[dimension_queue].text;
    return text;
  };

  render() {
    const {fieldName, text, onChange, rows, maxLength, queue, type} = this.props;
  
    return (
      <Choose>
        <When condition={type === 'dimensions'}>
          <div className='row align-items-center mr-lg-1'>
            <label className='col-lg-4' htmlFor={'text-' + queue}>
              {fieldName}:
            </label>
            <input
              className='form-control col-lg-2'
              name='text'
              type='number'
              id={'text-' + queue}
              // value={newDocStore.new_document.dimensions[queue]?.text}
              value={this.getDimension(queue)}
              onChange={this.onDimensionsChange}
              maxLength={maxLength}
            />
          </div>
        </When>
        <Otherwise>
          <label className='full_width' htmlFor={'text-' + queue}>
            {fieldName}:
            <textarea
              className='form-control full_width'
              name='text'
              id={'text-' + queue}
              value={text}
              rows={rows}
              onChange={onChange}
              maxLength={maxLength}
            />
          </label>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    text: '',
    fieldName: '-',
    rows: 1,
    queue: 1,
    maxLength: 5000,
    type: 'default'
  };
}

export default view(Text);
