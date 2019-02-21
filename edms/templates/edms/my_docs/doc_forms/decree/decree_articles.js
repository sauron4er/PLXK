'use strict';
import React, {Fragment} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSave, faEdit, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import ReactDragList from 'react-drag-list'
import 'react-drag-list/assets/index.css'
import Input from "react-validation/build/input";
import axios from "axios";
import {uniqueArray} from '../../../_else/my_extras'

class DecreeArticles extends React.Component {

    state = {
        new_article_area: true,
        new_article_dep_area: false,
        new_article_deadline_area: false,
        edit_article_area: false,
        dep_list: [],

        articles: [],

        new_article_text: '',
        new_article_deps: [],
        new_article_deadline: '',

        select_article_dep_id: '',
        select_article_dep: '',
        select_edit_article_dep_id: '',
        select_edit_article_dep: '',

        edit_article_text: '',
        edit_article_deadline: '',
        edit_article_deps: [],
    };

    onChange = (event) => {
        if (event.target.name === 'select_article_dep') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                select_article_dep_id: event.target.options[selectedIndex].getAttribute('data-key'),
                select_article_dep: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        if (event.target.name === 'select_edit_article_dep') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                select_edit_article_dep_id: event.target.options[selectedIndex].getAttribute('data-key'),
                select_edit_article_dep: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else if (event.target.name === 'edit_article_dep') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                edit_article_dep_id: event.target.options[selectedIndex].getAttribute('data-key'),
                edit_article_dep: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else {
            this.setState({[event.target.name]: event.target.value});
        }
    };

    // отримуємо з бд список відділів
    componentDidMount() {
        if (this.state.dep_list.length === 0) {
            axios({
                method: 'get',
                url: 'get_deps/',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.setState({
                    dep_list: response.data,
                })
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });
        }
    }

    // Показує поле для введення нового пункту наказу
    showNewArticleArea = (e) => {
        e.preventDefault();
        this.setState({
            new_article_area: !this.state.new_article_area,
            new_article_dep_area: false,
            new_article_deadline_area: false,
            new_article_text: '',
        })
    };

    // Закриває поле для зміни пункту
    closeEditArticleArea = (e) => {
        e.preventDefault();
        this.setState({
            edit_article_area: false,
            edit_article_text: '',
            edit_article_index: -1,
        })
    };

    // показує/приховує поле для вибору дедлайну і заодно видаляє дедлайн
    showDeadlineArea = (e) => {
        e.preventDefault();
        this.setState({
            new_article_deadline_area: !this.state.new_article_deadline_area,
            new_article_deadline: '',
        });
    };

    // показує/приховує поле для вибору відповідальних відділів
    showDepsArea = (e) => {
        e.preventDefault();
        this.setState({
            new_article_dep_area: !this.state.new_article_dep_area,
            new_article_deps: [],
        });
    };

    // додає новий відповідальний відділ до створюваного пункту
    addNewArticleDep = (e) => {
      e.preventDefault();
      if (this.state.select_article_dep !== '') {
        let article_deps = [...this.state.new_article_deps];
        article_deps.push({id: this.state.select_article_dep_id, dep: this.state.select_article_dep});
        const unique_deps = uniqueArray(article_deps);
        this.setState({
          new_article_deps: unique_deps,
          select_article_dep_id: '',
          select_article_dep: '',
        })
      }
    };
    
    // видаляє відділ зі списку у новому пункті
    delNewDep = (e, dep_id) => {
        e.preventDefault();
        this.setState((prevState) => ({
            new_article_deps: prevState.new_article_deps.filter(dep => dep.id !== dep_id)
        }))
    };

    // додає новий пункт у список
    addArticle = (e) => {
        e.preventDefault();
        if (this.state.new_article_text !== '') {
         
          // Якщо користувач обрав відповідальний відділ, але не нажав "+", робимо це за нього:
          let article_deps = [...this.state.new_article_deps];
          if (this.state.select_article_dep !== '') {
            article_deps.push({id: this.state.select_article_dep_id, dep: this.state.select_article_dep});
          }
          
          const new_article = {
            text: this.state.new_article_text,
            deps: article_deps,
            deadline: this.state.new_article_deadline === '' ? null : this.state.new_article_deadline,
          };
          this.setState(prevState => ({
            articles: [...prevState.articles, new_article],
            new_article_text: '',
            select_article_dep_id: '',
            select_article_dep: '',
            new_article_deps: [],
            new_article_deadline: '',
            new_article_area: false,
          }));
        }
    };
    
    // додає новий відповідальний відділ до редагованого пункту
    addEditArticleDep = (e) => {
      e.preventDefault();
      if (this.state.select_edit_article_dep !== '') {
        let article_deps = [...this.state.edit_article_deps];
        article_deps.push({id: this.state.select_edit_article_dep_id, dep: this.state.select_edit_article_dep});
        const unique_deps = uniqueArray(article_deps);
        this.setState({
          edit_article_deps: unique_deps,
          select_edit_article_dep_id: '',
          select_edit_article_dep: '',
        })
      }
    };
    
    // видаляє відділ зі списку у новому пункті
    delEditDep = (e, dep_id) => {
        e.preventDefault();
        this.setState((prevState) => ({
            edit_article_deps: prevState.edit_article_deps.filter(dep => dep.id !== dep_id)
        }))
    };
    
    // видаляє дедлайн у редагованому пункті
    clearEditDeadline = (e) => {
      e.preventDefault();
      this.setState({edit_article_deadline: ''})
    };

    // відкриває поле для редагування пункту
    editArticle = (e, index) => {
        e.preventDefault();
        this.setState({
            edit_article_area: true,
            edit_article_text: this.state.articles[index].text,
            edit_article_deps: this.state.articles[index].deps,
            edit_article_deadline: this.state.articles[index].deadline,
            edit_article_index: index,
        });
    };

    // зберігає зміни у пункті
    saveArticle = (e) => {
        e.preventDefault();
        // Якщо користувач обрав відповідальний відділ, але не нажав "+", робимо це за нього:
        let article_deps = [...this.state.edit_article_deps];
        if (this.state.select_edit_article_dep !== '') {
          article_deps.push({id: this.state.select_edit_article_dep_id, dep: this.state.select_edit_article_dep});
        }
        
        // Створюємо новий пункт:
        let new_articles_list = [...this.state.articles];
        new_articles_list[this.state.edit_article_index].text = this.state.edit_article_text;
        new_articles_list[this.state.edit_article_index].deps = article_deps;
        new_articles_list[this.state.edit_article_index].deadline = this.state.edit_article_deadline;
        
        this.setState({
            articles: new_articles_list,
            edit_article_area: false,
            select_edit_article_dep_id: '',
            select_edit_article_dep: '',
        })
    };

    delArticle = (e, index) => {
        e.preventDefault();
        let articles = this.state.articles;
        articles.splice(index, 1);
        this.setState({articles: articles});
    };

    // перетягування
    // handleListChange = (e) => {
    //   console.log(this.state.articles);
    // };

    render() {
        return <Fragment>
            {/* Шапка */}
            <div className='d-flex justify-content-center align-content-center'>
                <h3 className='text-center'>НАКАЗУЮ: </h3>
                <If condition={this.state.new_article_area === false}>
                    <button className=" btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1" onClick={this.showNewArticleArea}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </If>
            </div>

            {/* Створення нового пункту */}
            <If condition={this.state.new_article_area}>
                <div className='border border-info rounded p-1'>Новий пункт:
                    <div className='d-flex'>
                        <textarea className='flex-grow-1 form-control' value={this.state.new_article_text} name='new_article_text' onChange={this.onChange} maxLength={1000}/>
                        <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                                onClick={this.addArticle}>
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                                onClick={this.showNewArticleArea}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                  
                    <If condition={!this.state.new_article_dep_area}>
                      <button className="btn btn-sm btn-outline-secondary mt-1" onClick={this.showDepsArea} >Додати відповідальні відділи</button>
                    </If>
                    <If condition={!this.state.new_article_deadline_area}>
                      <button className="btn btn-sm btn-outline-secondary mt-1 ml-1" onClick={this.showDeadlineArea}>Додати термін виконання</button>
                    </If>

                    <If condition={this.state.new_article_dep_area && this.state.dep_list.length > 0}>
                        <div className='d-flex align-items-start mt-1'>
                            <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_article_dep'>Відповідальні відділи:</label>
                            <select className='form-control' id='select_article_dep' name='select_article_dep' value={this.state.select_article_dep} onChange={this.onChange}>
                                <option key={0} data-key={0} value='Не внесено'>------------</option>
                                {
                                  this.state.dep_list.map(dep => {
                                    return <option key={dep.id} data-key={dep.id} value={dep.dep}>{dep.dep}</option>;
                                  })
                                }
                            </select>
                            <button className=" btn btn-sm btn-outline-secondary font-weight-bold ml-1" onClick={this.addNewArticleDep}>
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1" onClick={this.showDepsArea} >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <If condition={this.state.new_article_deps.length > 0}>
                            <ul>
                                {
                                    this.state.new_article_deps.map(dep => {
                                        return (
                                            <div className='d-flex align-items-start'>
                                                <li key={dep.id}>{dep.dep}</li>
                                                <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                                                        onClick={(e) => this.delNewDep(e, dep.id)}
                                                        >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        )
                                    })
                                }
                            </ul>
                        </If>
                    </If>

                    <If condition={this.state.new_article_deadline_area}>
                        <div className='d-flex align mt-1'>
                            <label className='d-flex align-items-center mr-1'>Виконати до:
                                <Input className='form-control ml-1'
                                       type="date"
                                       value={this.state.new_article_deadline}
                                       name="new_article_deadline"
                                       onChange={this.onChange}
                                />
                            </label>
                            <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1" onClick={this.showDeadlineArea} >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    </If>
                </div>
            </If>

            {/* Редагування пунктту */}
            <If condition={this.state.edit_article_area === true}>
              <div className='border border-info rounded p-1'>Редагування пункту:
                  <div className='d-flex'>
                      <div className='mr-1 font-weight-bold'>{this.state.edit_article_index + 1}.</div>
                      <textarea className='flex-grow-1 form-control' value={this.state.edit_article_text} name='edit_article_text' onChange={this.onChange} maxLength={1000}/>
                      <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                              onClick={(event) => this.saveArticle(event)}>
                          <FontAwesomeIcon icon={faSave} />
                      </button>
                      <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                              onClick={this.closeEditArticleArea}>
                          <FontAwesomeIcon icon={faTimes} />
                      </button>
                  </div>
                
                  <div className='d-flex align-items-start mt-1'>
                      <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_article_dep'>Відповідальні відділи:</label>
                      <select className='form-control' id='select_article_dep' name='select_edit_article_dep' value={this.state.select_edit_article_dep} onChange={this.onChange}>
                          <option key={0} data-key={0} value='Не внесено'>------------</option>
                          {
                            this.state.dep_list.map(dep => {
                              return <option key={dep.id} data-key={dep.id} value={dep.dep}>{dep.dep}</option>;
                            })
                          }
                      </select>
                      <button className=" btn btn-sm btn-outline-secondary font-weight-bold ml-1" onClick={this.addEditArticleDep}>
                          <FontAwesomeIcon icon={faPlus} />
                      </button>
                  </div>
                  <If condition={this.state.edit_article_deps.length > 0}>
                      <ul>
                          {
                              this.state.edit_article_deps.map(dep => {
                                  return (
                                      <div key={dep.id} className='d-flex align-items-start'>
                                          <li>{dep.dep}</li>
                                          <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                                                  onClick={(e) => this.delEditDep(e, dep.id)}
                                                  >
                                              <FontAwesomeIcon icon={faTimes} />
                                          </button>
                                      </div>
                                  )
                              })
                          }
                      </ul>
                  </If>
                  
                  <label className='d-flex'>Виконати до:
                      <Input className='form-control ml-1'
                             type="date"
                             value={this.state.edit_article_deadline}
                             name="edit_article_deadline"
                             onChange={this.onChange}
                      />
                      <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1" onClick={this.clearEditDeadline} >
                          <FontAwesomeIcon icon={faTimes} />
                      </button>
                  </label>
              </div>
              <br />
            </If>

            {/* Список пунктів */}
            <If condition={this.state.articles.length > 0}>
                <ReactDragList
                    dataSource={this.state.articles}
                    rowKey="index"
                    row={(record, index) => (
                        <div key={index} className='d-flex mb-3'>
                            <div className='mr-1 font-weight-bold'>{index + 1}.</div>
                            <div className='flex-grow-1 flex-column'>
                                <div className='d-flex'>
                                    <div className='form-control css_decree_article css_multiline'><pre>{record.text}</pre></div>
                                    <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                                            onClick={(event) => this.editArticle(event, index)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                                            onClick={(event) => this.delArticle(event, index)}
                                            disabled={this.state.edit_article_area} >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                                <If condition={record.deps.length > 0}>
                                    <div>Відповідальні відділи:</div>
                                    <ul className='mb-0'>
                                        {
                                            record.deps.map(dep => {
                                                return <li key={dep.id}>{dep.dep}</li>
                                            })
                                        }
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
        </Fragment>
    }
}

export default DecreeArticles;