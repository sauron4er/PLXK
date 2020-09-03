'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getItemById, uniqueArray} from 'templates/components/my_extras';
import TextInput from 'templates/components/form_modules/text_input';
import MultiSelector from 'templates/components/form_modules/multi_selector';
import DateInput from 'templates/components/form_modules/date_input';
import List from 'templates/components/form_modules/list';

class Article extends React.Component {
  state = {
    selected_responsible_id: 0,
    selected_responsible: '',
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
      selected_responsible: e.target.options[selectedIndex].getAttribute('value')
    });
  };

  addResponsible = () => {
    let {article, index, emp_seats} = this.props;
    const {selected_responsible_id} = this.state;
    
    if (selected_responsible_id) {
      const item = getItemById(selected_responsible_id, article.responsibles);
      if (item === -1) {
        const selected_responsible = {...getItemById(selected_responsible_id, emp_seats), status: 'new'};
        let new_responsibles = [...article.responsibles];
        new_responsibles.push(selected_responsible);
        new_responsibles = uniqueArray(new_responsibles);
        article.responsibles = new_responsibles;
        this.props.changeArticle(article, index);
      }
  
      this.setState({
        selected_responsible: '',
        selected_responsible_id: 0
      });
    }
  };

  delResponsible = (id) => {
    let {article, index} = this.props;
    
    for (const i in article.responsibles) {
      if (article.responsibles[i].id === id) {
        if (article.responsibles[i].status === 'new') {
          article.responsibles.splice(i, 1);
          break;
        } else {
          article.responsibles[i].status = 'delete';
          break;
        }
      }
    }
    
    this.props.changeArticle(article, index);
  };

  delArticle = () => {
    this.props.delArticle(this.props.index);
  };

  render() {
    const {article, index, disabled, emp_seats} = this.props;
    const {selected_responsible} = this.state;

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
          selectedName={selected_responsible}
          valueField={'emp_seat'}
          fieldName={'Відповідальні'}
          onChange={this.changeResponsibles}
          addItem={this.addResponsible}
          disabled={disabled}
        />
        <List list={article.responsibles} mainField={'emp_seat'} deleteItem={this.delResponsible} disabled={disabled} />

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
