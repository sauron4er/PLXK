'use strict';
import React, {Fragment} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSave, faEdit, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import ReactDragList from 'react-drag-list'
import 'react-drag-list/assets/index.css'

class Articles extends React.Component {

    state = {
        new_article_area: true,
        edit_article_area: false,
        name: '',
        text: '',
        articles: [],
        new_article_text: '',
        edit_article_text: '',
    };

    onChange = (event) => {
        this.setState({[event.target.name]:event.target.value});
    };

    // Показує поле для введення нового пункту наказу
    showNewArticleArea = (e) => {
        e.preventDefault();
        this.setState({
            new_article_area: !this.state.new_article_area,
            new_article_text: '',
        })
    };

    // Показує поле для зміни пункту
    closeEditArticleArea = (e) => {
        e.preventDefault();
        this.setState({
            edit_article_area: false,
            edit_article_text: '',
            edit_article_number: -1,
        })
    };

    // додає пункт у список
    addArticle = (e) => {
        e.preventDefault();
        if (this.state.new_article_text !== '') {
            const new_article = {
                text: this.state.new_article_text,
                id: this.state.articles.length + 1,
                editing: false, // якщо true, то пункт показується як textarea з можливістю змін
            };
            this.setState(prevState => ({
                articles: [...prevState.articles, new_article],
                new_article_text: '',
                new_article_area: false,
            }));

        }
    };

    editArticle = (e, index) => {
        e.preventDefault();
        this.setState({
            edit_article_area: true,
            edit_article_text: this.state.articles[index].text,
            edit_article_number: index + 1,
        });
    };

    saveArticle = (e) => {
        e.preventDefault();

    };

    // видаляє резолюцію зі списку
    delArticle = (e, index) => {
        e.preventDefault();
        let articles = this.state.articles;
        articles.splice(index, 1);
        this.setState({articles: articles});
    };

    render() {
        return <Fragment>
            <div className='d-flex justify-content-center align-content-center'>
                <h3 className='text-center'>НАКАЗУЮ: </h3>
                <If condition={this.state.new_article_area === false}>
                    <button className=" btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1" onClick={this.showNewArticleArea}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </If>
            </div>
            {/* Створення нового пункту */}
            <If condition={this.state.new_article_area === true}>
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
            </If>
            {/* Редагування пунктту */}
            <If condition={this.state.edit_article_area === true}>
                <div className='border border-info rounded p-1'>Редагування пункту:
                    <div className='d-flex'>
                        <div className='mr-1 font-weight-bold'>{this.state.edit_article_number}.</div>
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
                </div>
            </If>
            <br />
            {/* Список пунктів */}
            <If condition={this.state.articles.length > 0}>
                <ReactDragList
                    dataSource={this.state.articles}
                    rowKey="title"
                    row={(record, index) => (
                        <div key={index} className='d-flex mb-1'>
                            <div className='mr-1 font-weight-bold'>{index + 1}.</div>
                            <div className='flex-grow-1 form-control css_decree_article'>{record.text}</div>
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
                    )}
                    handles={false}
                    disabled={this.state.edit_article_area}
                    // className="simple-drag"
                    // rowClassName="simple-drag-row"
                />
            </If>
            <br />
        </Fragment>
    }
}

export default Articles;