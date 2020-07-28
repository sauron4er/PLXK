"use strict";
import React from "react";

class Articles extends React.Component {
  // отримує інформацію про документ в масиві doc та створює відповідні кнопки для doc_info

  render() {
    const { articles } = this.props;

    return (
      <For each="article" index="idx" of={articles}>
        <div key={article.id} className="d-flex mb-3">
          <div className="mr-1 font-weight-bold">{idx + 1}.</div>
          <div className="flex-grow-1 flex-column">
            <div>{article.text}</div>
            <If condition={article.deps.length > 0}>
              {article.deps.length > 1 ? (
                <div className="font-italic mt-1">Відповідальні відділи:</div>
              ) : (
                <div className="font-italic mt-1">Відповідальний відділ:</div>
              )}
              <For each="dep" index="idx" of={article.deps}>
                <div key={dep.id}>{dep.dep}</div>
              </For>
            </If>
            <If condition={article.deadline}>
              <span className="font-italic mt-1 mr-1">Виконати до:</span>
              <span>{article.deadline}</span>
            </If>
          </div>
        </div>
      </For>
    );
  }

  static defaultProps = {
    articles: []
  };
}

export default Articles;
