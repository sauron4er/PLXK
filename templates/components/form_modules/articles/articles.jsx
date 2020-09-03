'use strict';
import React from 'react';
// import ReactDragList from 'react-drag-list';
// import 'react-drag-list/assets/index.css';
import Article from 'templates/components/form_modules/articles/article';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

class Articles extends React.Component {
  state = {};

  addEmptyArticle = () => {
    let articles = [...this.props.articles];
    articles.push({text: '', responsibles: [], deadline: ''});
    this.props.changeArticles(articles);
  };

  changeArticle = (article, index) => {
    let articles = [...this.props.articles];
    articles[index] = article;

    this.props.changeArticles(articles);
  };

  delArticle = (index) => {
    let articles = [...this.props.articles];
    articles.splice(index, 1);

    this.props.changeArticles(articles);
  };

  render() {
    const {articles, emp_seats, disabled} = this.props;
    return (
      <If condition={articles.length > 0 || !disabled}>
        <hr />
        <div>Пункти наказу:</div>
        <For each='article' index='idx' of={articles}>
          <Article
            key={idx}
            article={article}
            index={idx}
            emp_seats={emp_seats}
            changeArticle={this.changeArticle}
            delArticle={this.delArticle}
            disabled={disabled}
          />
        </For>
        <button className='btn btn-sm btn-outline-secondary' onClick={this.addEmptyArticle}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </If>
    );
  }

  static defaultProps = {
    disabled: true,
    articles: [],
    emp_seats: [],
    changeArticles: () => {}
  };
}

export default Articles;
