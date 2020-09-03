'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import TextInput from 'templates/components/form_modules/text_input';
import MultiSelector from 'templates/components/form_modules/multi_selector';
import DateInput from 'templates/components/form_modules/date_input';
import {getItemById, uniqueArray} from 'templates/components/my_extras';
import corrStore from '../../../../correspondence/templates/correspondence/store';
import LawsList from '../../../../correspondence/templates/correspondence/request/laws_list';

class Article extends React.Component {
  state = {
    selected_responsible_id: 0,
    selected_responsible_name: '',
    responsibles: [],
    deadline: ''
  };

  changeField = (e, field) => {
    let {article, index} = this.props;
    article[field] = e.target.value;
    this.props.changeArticle(article, index);
  };

  changeResponsibles = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    this.setState({
      selected_responsible_id: e.target.options[selectedIndex].getAttribute('data-key'),
      selected_responsible_name: e.target.options[selectedIndex].getAttribute('value')
    });
  };

  addResponsible = () => {
    const {selected_responsible_id, responsibles} = this.state;
    if (selected_responsible_id) {
      console.log(selected_responsible_id);
      const item = getItemById(selected_responsible_id, responsibles);
      if (item === -1) {
        const selected_responsible = {...item, status: 'new'};
        let new_responsibles = [...responsibles];
        new_responsibles.push(selected_responsible);
        this.setState({responsibles: [...new_responsibles]});
        // new_responsibles = uniqueArray( new_responsibles);
      }
      this.setState({
        selected_responsible_name: '',
        selected_responsible_id: 0
      });
    }
  };

  delArticle = () => {
    this.props.delArticle(this.props.index);
  };

  render() {
    const {article, index, disabled, emp_seats} = this.props;
    const {selected_responsible_name, responsibles} = this.state;

    return (
      <div className='border border-info rounded p-1 mb-2'>
        <div className='font-weight-bold'>{index + 1}</div>
        <div className='d-flex'>
          <TextInput text={article.text} onChange={(e) => this.changeField(e, 'text')} maxLength={500} disabled={disabled} />
          <div>
            <button className='btn btn-sm btn-outline-secondary ml-1 mb-2' onClick={this.delArticle}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        <MultiSelector
          list={emp_seats}
          selectedName={selected_responsible_name}
          fieldName={'Відповідальні'}
          onChange={this.changeResponsibles}
          addItem={this.addResponsible}
          disabled={disabled}
        />
        <If condition={responsibles}>
          <List disabled={!edit_mode} />
        </If>
        <DateInput
          date={article.deadline}
          fieldName={'Строк виконання'}
          onChange={(e) => this.changeField(e, 'deadline')}
          disabled={disabled}
        />
      </div>
    );
  }

  static defaultProps = {
    article: {text: '', responsibles: [], deadline: ''},
    index: 0,
    changeArticle: () => {},
    delArticle: () => {},
    emp_seats: [],
    disabled: true
  };
}

export default Article;
