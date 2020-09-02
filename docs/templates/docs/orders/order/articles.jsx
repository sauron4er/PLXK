'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faSave, faEdit, faTimes, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import ReactDragList from 'react-drag-list';
import 'react-drag-list/assets/index.css';
import Input from 'react-validation/build/input';
import {uniqueArray} from 'templates/components/my_extras';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import TextInput from 'templates/components/form_modules/text_input';

class Articles extends React.Component {
  state = {
    new_article_area: true,
    new_article_responsible_area: false,
    new_article_deadline_area: false,
    edit_article_area: false,

    new_article_text: '',
    //
    new_article_responsibles: [],
    new_article_deadline: '',

    select_article_responsible_id: '',
    select_article_responsible: '',
    select_edit_article_responsible_id: '',
    select_edit_article_responsible: '',

    edit_article_text: '',
    edit_article_deadline: '',
    edit_article_responsibles: []
  };

  onChange = (event) => {
    if (event.target.name === 'select_article_dep') {
      // беремо ід керівника із <select>
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        select_article_dep_id: event.target.options[selectedIndex].getAttribute('data-key'),
        select_article_dep: event.target.options[selectedIndex].getAttribute('value')
      });
    }
    if (event.target.name === 'select_edit_article_dep') {
      // беремо ід керівника із <select>
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        select_edit_article_dep_id: event.target.options[selectedIndex].getAttribute('data-key'),
        select_edit_article_dep: event.target.options[selectedIndex].getAttribute('value')
      });
    } else if (event.target.name === 'edit_article_dep') {
      // беремо ід керівника із <select>
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        edit_article_dep_id: event.target.options[selectedIndex].getAttribute('data-key'),
        edit_article_dep: event.target.options[selectedIndex].getAttribute('value')
      });
    } else {
      this.setState({[event.target.name]: event.target.value});
    }
  };
  
  onTextChange = (e) => {
    this.setState({new_article_text: e.target.value});
  };

  render() {
    const {new_article_area, new_article_text} = this.state;
    const {is_orders_admin, employees} = ordersStore;
    const {articles} = ordersStore.order;
    return (
      <>
        <div>Пункти:</div>

        {/* Створення нового пункту */}
        <If condition={new_article_area}>
          <div className='border border-info rounded p-1 mb-2'>
            <div className='d-flex'>
              <TextInput
                text={new_article_text}
                fieldName={'Новий пункт'}
                onChange={this.onTextChange}
                maxLength={500}
                disabled={!is_orders_admin}
              />
              <button className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1' onClick={this.addArticle}>
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1' onClick={this.showNewArticleArea}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <If condition={!this.state.new_article_dep_area}>
              <button className='btn btn-sm btn-outline-secondary mt-1' onClick={this.showDepsArea}>
                Додати відповідальні відділи
              </button>
            </If>
            <If condition={!this.state.new_article_deadline_area}>
              <button className='btn btn-sm btn-outline-secondary mt-1 ml-1' onClick={this.showDeadlineArea}>
                Додати термін виконання
              </button>
            </If>
            <If condition={this.state.new_article_dep_area && this.state.dep_list.length > 0}>
              <div className='d-flex align-items-start mt-1'>
                <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_article_dep'>
                  Відповідальні відділи:
                </label>
                <select
                  className='form-control'
                  id='select_article_dep'
                  name='select_article_dep'
                  value={this.state.select_article_dep}
                  onChange={this.onChange}
                >
                  <option key={0} data-key={0} value='Не внесено'>
                    ------------
                  </option>
                  {this.state.dep_list.map((dep) => {
                    return (
                      <option key={dep.id} data-key={dep.id} value={dep.dep}>
                        {dep.dep}
                      </option>
                    );
                  })}
                </select>
                <button className=' btn btn-sm btn-outline-secondary font-weight-bold ml-1' onClick={this.addNewArticleDep}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
                <button className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1' onClick={this.showDepsArea}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <If condition={this.state.new_article_deps.length > 0}>
                <ul>
                  {this.state.new_article_deps.map((dep) => {
                    return (
                      <div className='d-flex align-items-start'>
                        <li key={dep.id}>{dep.dep}</li>
                        <button
                          className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                          onClick={(e) => this.delNewDep(e, dep.id)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    );
                  })}
                </ul>
              </If>
            </If>
            <If condition={this.state.new_article_deadline_area}>
              <div className='d-flex align mt-1'>
                <label className='d-flex align-items-center mr-1'>
                  Виконати до:
                  <Input
                    className='form-control ml-1'
                    type='date'
                    value={this.state.new_article_deadline}
                    name='new_article_deadline'
                    onChange={this.onChange}
                  />
                </label>
                <button className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1' onClick={this.showDeadlineArea}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </If>
          </div>
        </If>

        {/* Редагування пунктту */}
        <If condition={this.state.edit_article_area === true}>
          <div className='border border-info rounded p-1'>
            Редагування пункту:
            <div className='d-flex'>
              <div className='mr-1 font-weight-bold'>{this.state.edit_article_index + 1}.</div>
              <textarea
                className='flex-grow-1 form-control'
                value={this.state.edit_article_text}
                name='edit_article_text'
                onChange={this.onChange}
                maxLength={1000}
              />
              <button
                className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                onClick={(event) => this.saveArticle(event)}
              >
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button
                className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                onClick={this.closeEditArticleArea}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className='d-flex align-items-start mt-1'>
              <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_article_dep'>
                Відповідальні відділи:
              </label>
              <select
                className='form-control'
                id='select_article_dep'
                name='select_edit_article_dep'
                value={this.state.select_edit_article_dep}
                onChange={this.onChange}
              >
                <option key={0} data-key={0} value='Не внесено'>
                  ------------
                </option>
                {this.state.dep_list.map((dep) => {
                  return (
                    <option key={dep.id} data-key={dep.id} value={dep.dep}>
                      {dep.dep}
                    </option>
                  );
                })}
              </select>
              <button className=' btn btn-sm btn-outline-secondary font-weight-bold ml-1' onClick={this.addEditArticleDep}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <If condition={this.state.edit_article_deps.length > 0}>
              <ul>
                {this.state.edit_article_deps.map((dep) => {
                  return (
                    <div key={dep.id} className='d-flex align-items-start'>
                      <li>{dep.dep}</li>
                      <button
                        className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                        onClick={(e) => this.delEditDep(e, dep.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  );
                })}
              </ul>
            </If>
            <label className='d-flex'>
              Виконати до:
              <Input
                className='form-control ml-1'
                type='date'
                value={this.state.edit_article_deadline}
                name='edit_article_deadline'
                onChange={this.onChange}
              />
              <button className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1' onClick={this.clearEditDeadline}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </label>
          </div>
          <br />
        </If>

        {/* Список пунктів */}
        <If condition={articles.length > 0}>
          <ReactDragList
            dataSource={articles}
            rowKey='index'
            row={(record, index) => (
              <div key={index} className='d-flex mb-3'>
                <div className='mr-1 font-weight-bold'>{index + 1}.</div>
                <div className='flex-grow-1 flex-column'>
                  <div className='d-flex'>
                    <div className='form-control css_decree_article css_multiline'>
                      <pre>{record.text}</pre>
                    </div>
                    <button
                      className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                      onClick={(event) => this.editArticle(event, index)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                      onClick={(event) => this.delArticle(event, index)}
                      disabled={this.state.edit_article_area}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                  <If condition={record.deps.length > 0}>
                    <div>Відповідальні відділи:</div>
                    <ul className='mb-0'>
                      {record.deps.map((dep) => {
                        return <li key={dep.id}>{dep.dep}</li>;
                      })}
                    </ul>
                  </If>
                  <If condition={record.deadline}>
                    <div className='mt-0'>Виконати до: {record.deadline}</div>
                  </If>
                </div>
              </div>
            )}
            handles={false}
            disabled={true} // треба розібратися з автоматичною зміною нумерації при перетягуванні
            // disabled={this.state.edit_article_area} // при включеному перетягуванні: якщо редагується якийсь із пунктів - перетягування не активне
            // onUpdate={this.handleListChange}
            // className="simple-drag"
            // rowClassName="simple-drag-row"
          />
        </If>

        <If condition={this.state.new_article_area === false}>
          <button className=' btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1' onClick={this.showNewArticleArea}>
            Новий пункт
          </button>
        </If>
      </>
    );
  }
}

export default view(Articles);
