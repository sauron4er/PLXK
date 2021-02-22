'use strict';
import * as React from 'react';
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
    const queue = getIndexByProperty(newDocStore.new_document.dimensions, 'queue', parseInt(text_box_id));
    if (queue === -1) {
      newDocStore.new_document.dimensions.push({
        queue: parseInt(text_box_id),
        text: event.target.value
      });
    } else {
      newDocStore.new_document.dimensions[queue].text = event.target.value;
    }
  };

  onTextChange = (event) => {
    let text_box_id = event.target.id.substring(5); // видаляємо 'text-' з ід інпуту
    const queue = getIndexByProperty(newDocStore.new_document.text, 'queue', parseInt(text_box_id));
    if (queue === -1) {
      newDocStore.new_document.text.push({
        queue: parseInt(text_box_id),
        text: event.target.value
      });
    } else {
      newDocStore.new_document.text[queue].text = event.target.value;
    }
  };

  getDimension = (queue) => {
    // Цю херню можна переробити, забравши взагалі массив dimensions, а працюючи лише з text. Сервер так і робить.
    let text = '';
    let dimension_queue = getIndexByProperty(newDocStore.new_document.dimensions, 'queue', parseInt(queue));
    if (dimension_queue !== -1) text = newDocStore.new_document.dimensions[dimension_queue].text;
    else {
      dimension_queue = getIndexByProperty(newDocStore.new_document.text, 'queue', parseInt(queue));
      if (dimension_queue !== -1) text = newDocStore.new_document.text[dimension_queue].text;
    }
    return text;
  };

  getText = (queue) => {
    let text = '';
    const text_queue = getIndexByProperty(newDocStore.new_document.text, 'queue', parseInt(queue));
    if (text_queue !== -1) text = newDocStore.new_document.text[text_queue].text;
    return text;
  };

  render() {
    const {module_info, rows, cols, maxLength, type} = this.props;

    return (
      <Choose>
        <When condition={type === 'dimensions'}>
          <div className='row align-items-center mr-lg-1'>
            <label className='col-lg-4' htmlFor={'text-' + module_info.queue}>
              <If condition={module_info.required}>{'* '}</If> {module_info.field_name}:
            </label>
            <input
              className='form-control col-lg-2'
              name='text'
              type='number'
              id={'text-' + module_info.queue}
              // value={newDocStore.new_document.dimensions[module_info.queue]?.text}
              value={this.getDimension(module_info.queue)}
              onChange={this.onDimensionsChange}
              maxLength={maxLength}
            />
          </div>
          <small className='text-danger'>{module_info?.additional_info}</small>
        </When>
        <Otherwise>
          <label className='full_width' htmlFor={'text-' + module_info.queue}>
            <If condition={module_info.required}>{'* '}</If>
            {module_info.field_name}:
            <textarea
              className='form-control full_width'
              name='text'
              id={'text-' + module_info.queue}
              value={this.getText(module_info.queue)}
              // Переробити на окреме поле в таблиці doc_type_modules - big_text, яке буде визначати чи високе текстове поле
              rows={[69, 77].includes(module_info.id) ? 6 : rows} // Зміст заявок високий.
              cols={cols}
              onChange={this.onTextChange}
              maxLength={maxLength}
            />
            <small className='text-danger'>{module_info?.additional_info}</small>
          </label>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    },
    rows: 1,
    cols: 50,
    maxLength: 5000,
    type: 'default',
    onChange: () => {}
  };
}

export default view(Text);
