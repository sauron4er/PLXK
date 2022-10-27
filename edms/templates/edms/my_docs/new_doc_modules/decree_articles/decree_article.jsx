'use strict';
import React, {useEffect, useState} from 'react';
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import decreeArticlesStore from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/store";
import MultiSelectorWithFilter from 'templates/components/form_modules/selectors/multi_selector_with_filter';
import {getIndex, getItemById, uniqueArray} from 'templates/components/my_extras';
import ListForMultiSelector from 'templates/components/form_modules/selectors/list_for_multi_selector';
import DecreeArticleDeadlines from 'edms/templates/edms/my_docs/new_doc_modules/decree_articles/decree_article_deadlines';

function DecreeArticle(props) {
  const [allChiefsAdded, setallChiefsAdded] = useState(false);
  // const [selectedResponsible, setSelectedResponsible] = useState(0);
  // const [selectedResponsibleName, setSelectedResponsibleName] = useState('');

  function delArticle(e) {
    let articles = [...decreeArticlesStore.decree_articles];
    let article = articles[props.index];

    if (article.status === 'new') articles.splice(props.index, 1);
    else article.status = 'delete';

    decreeArticlesStore.decree_articles = [...articles];
  }

  function changeField(e, field) {
    let article = {...decreeArticlesStore.decree_articles[props.index]};
    article[field] = e.target.value;
    decreeArticlesStore.decree_articles[props.index] = {...article};
  }
  
  function onTextChange(value) {
    decreeArticlesStore.decree_articles[props.index].text = value
  }

  function selectResponsible(item) {
    // setSelectedResponsible(item.id);
    // setSelectedResponsibleName(item.name);

    addResponsible(item.id);
  }

  function addAllChiefs() {
    newDocStore.emps_seats_from_local_storage.map((emp_seat) => {
      if (emp_seat.is_dep_chief && !emp_seat.on_vacation) addResponsible(emp_seat.id);
    });

    setallChiefsAdded(true);
  }

  function addResponsible(selected_responsible_id) {
    let article = { ...decreeArticlesStore.decree_articles[props.index] };
  
    const item = getItemById(selected_responsible_id, article.responsibles);

    if (item === -1) {
      const selected_responsible = {
        ...getItemById(selected_responsible_id, newDocStore.emps_seats_from_local_storage),
        status: 'new',
        files_old: [],
        done: false
      };
      let new_responsibles = [...article.responsibles];
      new_responsibles.push(selected_responsible);
      // new_responsibles = uniqueArray(new_responsibles);
      article.responsibles = new_responsibles;
      decreeArticlesStore.decree_articles[props.index] = article;
    } else {
      if (item.status === 'delete') {
        const responsible_index = getIndex(item.id, article.responsibles);
        article.responsibles[responsible_index].status = 'old';
        // article.responsibles[responsible_index].done = 'false';
        decreeArticlesStore.decree_articles[props.index] = article;
      }
    }

    // setSelectedResponsible(0);
    // setSelectedResponsibleName('');
  }

  function delResponsible(i) {
    let article = {...decreeArticlesStore.decree_articles[props.index]};

    if (article.responsibles[i].status === 'new') {
      article.responsibles.splice(i, 1);
    } else {
      article.responsibles[i].status = 'delete';
      article.status = 'change';
    }

    decreeArticlesStore.decree_articles[props.index] = {...article};
  }

  return (
    <div className='border border-info rounded p-1 mb-2'>
      <div className='font-weight-bold'>{props.index + 1}</div>
      <div className='d-flex'>
        <div className='w-100'><ReactQuill
          theme="snow"
          value={decreeArticlesStore.decree_articles[props.index].text}
          onChange={onTextChange}
          // style={{minHeight: '400px'}}
        /></div>
        {/*<TextInput*/}
        {/*  text={decreeArticlesStore.decree_articles[props.index].text}*/}
        {/*  onChange={(e) => changeField(e, 'text')}*/}
        {/*  maxLength={5000}*/}
        {/*  disabled={false}*/}
        {/*/>*/}
        <div>
          <button className='btn btn-sm btn-outline-secondary ml-1 mb-2' onClick={delArticle}>
            <span aria-hidden='true'>&times;</span>
          </button>
        </div>
      </div>

      <MultiSelectorWithFilter
        fieldName='Відповідальні'
        list={newDocStore.emps_seats_from_local_storage}
        onChange={selectResponsible}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        disabled={false}
      />
      <ListForMultiSelector list={decreeArticlesStore.decree_articles[props.index].responsibles} delItem={delResponsible} />
      
      <If condition={!allChiefsAdded}>
        <button className='btn btn-sm btn-outline-secondary mt-1' onClick={() => addAllChiefs()}>
          Додати начальників всіх відділів
        </button>
      </If>

      <DecreeArticleDeadlines index={props.index} />
    </div>
  );
}

DecreeArticle.defaultProps = {
  index: 0
};

export default view(DecreeArticle);
