'use strict';
import React from 'react';
import Article from 'templates/components/form_modules/articles/article';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

class Articles extends React.Component {

  addEmptyArticle = () => {
    let articles = [...this.props.articles];
    articles.push({text: '', responsibles: [], deadline: '', status: 'new', periodicity: '', constant: 'false'});
    this.props.changeArticles(articles);
  };
  
  isArticleDone = (article) => {
    return article.responsibles.filter(resp => resp.status !== 'delete').every(resp => resp.done);
  };

  changeArticle = (article, index) => {
    let articles = [...this.props.articles];
    articles[index] = article;
    if (articles[index].status === 'old') articles[index].status = 'change';
    articles[index].done = this.isArticleDone(article)
  
    this.props.changeArticles(articles);
  };

  delArticle = (index) => {
    let articles = [...this.props.articles];

    if (articles[index].status === 'new') {
      articles.splice(index, 1);
    } else {
      articles[index].status = 'delete';
    }

    this.props.changeArticles(articles);
  };

  render() {
    const {articles, emp_seats, disabled} = this.props;
  
    return (
      <If condition={articles.length > 0 || !disabled}>
        <hr />
        <div>Пункти наказу:</div>
        <For each='article' index='idx' of={articles}>
          <If condition={article.status !== 'delete'}>
            <Article
              key={idx}
              article={article}
              index={idx}
              emp_seats={emp_seats}
              changeArticle={this.changeArticle}
              delArticle={this.delArticle}
              disabled={disabled}
            />
          </If>
        </For>
        <button className='btn btn-sm btn-outline-secondary' onClick={this.addEmptyArticle} disabled={disabled}>
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
