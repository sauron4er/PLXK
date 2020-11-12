'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getIndex, getItemById, uniqueArray} from 'templates/components/my_extras';
import TextInput from 'templates/components/form_modules/text_input';
import MultiSelector from 'templates/components/form_modules/multi_selector';
import DateInput from 'templates/components/form_modules/date_input';
import Responsible from 'templates/components/form_modules/articles/responsible';

class Article extends React.Component {
  state = {
    selected_responsible_id: 0,
    selected_responsible: '',
    deadline: '',
    all_chiefs_added: false
  };

  changeField = (e, field) => {
    let {article, index} = this.props;
    article[field] = e.target.value;
    this.props.changeArticle(article, index);
  };

  selectResponsible = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    this.setState({
      selected_responsible_id: e.target.options[selectedIndex].getAttribute('data-key'),
      selected_responsible: e.target.options[selectedIndex].getAttribute('value')
    });
  };

  addResponsible = (selected_responsible_id) => {
    let {article, index, emp_seats} = this.props;

    if (selected_responsible_id) {
      const item = getItemById(selected_responsible_id, article.responsibles);
      if (item === -1) {
        const selected_responsible = {
          ...getItemById(selected_responsible_id, emp_seats),
          status: 'new',
          files_old: [],
          done: false
        };
        let new_responsibles = [...article.responsibles];
        new_responsibles.push(selected_responsible);
        new_responsibles = uniqueArray(new_responsibles);
        article.responsibles = new_responsibles;
        this.props.changeArticle(article, index);
      } else {
        if (item.status === 'delete') {
          const responsible_index = getIndex(item.id, article.responsibles);
          article.responsibles[responsible_index].status = 'old';
          article.responsibles[responsible_index].done = 'false';
          this.props.changeArticle(article, index);
        }
      }

      this.setState({
        selected_responsible: '',
        selected_responsible_id: 0
      });
    }
  };

  delResponsible = (i) => {
    let {article, index} = this.props;

    if (article.responsibles[i].status === 'new') {
      article.responsibles.splice(i, 1);
    } else {
      article.responsibles[i].status = 'delete';
      article.status = 'change';
    }

    this.props.changeArticle(article, index);
  };

  changeResponsible = (responsible, i) => {
    let {article, index} = this.props;

    article.responsibles[i] = responsible;
    if (article.status === 'old') article.status = 'change';

    this.props.changeArticle(article, index);
  };

  delArticle = () => {
    this.props.delArticle(this.props.index);
  };

  addAllChiefs = () => {
    this.props.emp_seats.map((emp_seat) => {
      if (emp_seat.is_dep_chief) this.addResponsible(emp_seat.id);
    });

    this.setState({all_chiefs_added: true});
  };

  getBackground = () => {
    const {text, constant, deadline, responsibles} = this.props.article;
    const {selected_responsible_id} = this.state;
    if (text === '' || (deadline === '' && constant === 'false') || responsibles.length === 0 || selected_responsible_id !== 0) {
      return 'LightPink';
    }
    if (constant === 'false' && responsibles.filter((resp) => resp.status !== 'delete').every((resp) => resp.done)) return 'LightGreen';
    return '';
  };

  render() {
    const {article, index, disabled, emp_seats} = this.props;
    const {selected_responsible, selected_responsible_id, all_chiefs_added} = this.state;

    return (
      <div className='border border-info rounded p-1 mb-2' style={{background: this.getBackground()}}>
        <div className='font-weight-bold'>{index + 1}</div>
        <div className='d-flex'>
          <TextInput text={article.text} onChange={(e) => this.changeField(e, 'text')} maxLength={5000} disabled={disabled} />
          <div>
            <button className='btn btn-sm btn-outline-secondary ml-1 mb-2' onClick={this.delArticle} disabled={disabled}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <MultiSelector
          list={emp_seats}
          selectedName={selected_responsible}
          valueField={'emp_seat'}
          fieldName={'Відповідальні'}
          onChange={this.selectResponsible}
          addItem={this.addResponsible(selected_responsible_id)}
          disabled={disabled}
        />

        <If condition={!all_chiefs_added && !disabled}>
          <button className='btn btn-sm btn-outline-secondary mt-1' onClick={() => this.addAllChiefs()} disabled={disabled}>
            Додати начальників всіх відділів
          </button>
        </If>

        <div className='mt-2'>
          <For each='responsible' index='idx' of={article.responsibles}>
            <Responsible
              key={idx}
              responsible={responsible}
              article_index={index}
              index={idx}
              onChange={this.changeResponsible}
              onDelete={this.delResponsible}
              constant={article.constant}
              disabled={disabled}
            />
          </For>
        </div>

        <If condition={article.constant === 'false' || !disabled}>
          <div className={'form-inline mt-1'}>
            <input
              type='radio'
              name={index + 'constant_radio'}
              id={index + 'deadline'}
              value='false'
              onChange={(e) => this.changeField(e, 'constant')}
              checked={article.constant === 'false'}
            />
            <label className='radio-inline mx-1' htmlFor={index + 'deadline'}>
              Строк виконання
            </label>
            <If condition={article.constant === 'false'}>
              <DateInput
                date={article.deadline}
                className={'mr-2'}
                fieldName={''}
                onChange={(e) => this.changeField(e, 'deadline')}
                disabled={disabled}
              />
              <If condition={article.periodicity === '' || !disabled}>
                <input
                  type='radio'
                  name={index + 'periodicity_radio'}
                  id={index + 'once'}
                  value=''
                  onChange={(e) => this.changeField(e, 'periodicity')}
                  checked={article.periodicity === ''}
                  disabled={disabled}
                />
                <label className='radio-inline mx-1' htmlFor={index + 'once'}>
                  Один раз
                </label>
              </If>
              <If condition={article.periodicity === 'm' || !disabled}>
                <input
                  className='ml-2'
                  type='radio'
                  name={index + 'periodicity_radio'}
                  id={index + 'monthly'}
                  value='m'
                  onChange={(e) => this.changeField(e, 'periodicity')}
                  checked={article.periodicity === 'm'}
                  disabled={disabled}
                />
                <label className='radio-inline mx-1' htmlFor={index + 'monthly'}>
                  Щомісяця
                </label>
              </If>
              <If condition={article.periodicity === 'y' || !disabled}>
                <input
                  className='ml-2'
                  type='radio'
                  name={index + 'periodicity_radio'}
                  id={index + 'yearly'}
                  value='y'
                  onChange={(e) => this.changeField(e, 'periodicity')}
                  checked={article.periodicity === 'y'}
                  disabled={disabled}
                />
                <label className='radio-inline mx-1' htmlFor={index + 'yearly'}>
                  Щороку
                </label>
              </If>
            </If>
          </div>
        </If>
        <If condition={article.constant === 'true' || !disabled}>
          <div className={'form-inline mt-1'}>
            <input
              type='radio'
              name={index + 'constant_radio'}
              id={index + 'constant'}
              value='true'
              onChange={(e) => this.changeField(e, 'constant')}
              checked={article.constant === 'true'}
              disabled={disabled}
            />
            <label className='radio-inline mx-1' htmlFor={index + 'constant'}>
              Виконувати постійно
            </label>
          </div>
        </If>
      </div>
    );
  }

  static defaultProps = {
    article: {text: '', responsibles: [], deadline: '', status: 'new', periodicity: '', constant: 'false'},
    index: 0,
    changeArticle: () => {},
    delArticle: () => {},
    emp_seats: [],
    disabled: true
  };
}

export default Article;
