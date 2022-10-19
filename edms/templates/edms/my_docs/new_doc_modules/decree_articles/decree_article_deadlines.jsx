'use strict';
import React, {useEffect, useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import DateInput from 'templates/components/form_modules/date_input';

function DecreeArticleDeadlines(props) {
  const article = {...newDocStore.new_document.decree_articles[props.index]};

  function changeTerm(type) {
    newDocStore.new_document.decree_articles[props.index].term = type;
  }

  function changeDeadline(e) {
    newDocStore.new_document.decree_articles[props.index].deadline = e.target.value;
  }

  function changePeriodicity(periodicity) {
    newDocStore.new_document.decree_articles[props.index].periodicity = periodicity;
  }

  return (
    <>
      <div className='form-inline mt-1'>
        <input
          type='radio'
          name={props.index + 'term_radio'}
          id={props.index + 'deadline'}
          value='term'
          onChange={(e) => changeTerm('term')}
          checked={article.term === 'term'}
        />
        <label className='radio-inline mx-1' htmlFor={props.index + 'deadline'}>
          Строк виконання
        </label>

        <If condition={article.term === 'term'}>
          <DateInput date={article.deadline} className={'mr-2'} fieldName={''} onChange={changeDeadline} disabled={false} />

          <input
            type='radio'
            name={props.index + 'periodicity_radio'}
            id={props.index + 'once'}
            value=''
            onChange={(e) => changePeriodicity('')}
            checked={article.periodicity === ''}
          />
          <label className='radio-inline mx-1' htmlFor={props.index + 'once'}>
            Один раз
          </label>

          <input
            className='ml-2'
            type='radio'
            name={props.index + 'periodicity_radio'}
            id={props.index + 'monthly'}
            value='m'
            onChange={(e) => changePeriodicity('m')}
            checked={article.periodicity === 'm'}
          />
          <label className='radio-inline mx-1' htmlFor={props.index + 'monthly'}>
            Щомісяця
          </label>

          <input
            className='ml-2'
            type='radio'
            name={props.index + 'periodicity_radio'}
            id={props.index + 'yearly'}
            value='y'
            onChange={(e) => changePeriodicity('y')}
            checked={article.periodicity === 'y'}
          />
          <label className='radio-inline mx-1' htmlFor={props.index + 'yearly'}>
            Щороку
          </label>
        </If>
      </div>

      <div className={'form-inline mt-1'}>
        <input
          type='radio'
          name={props.index + 'term_radio'}
          id={props.index + 'constant'}
          value='constant'
          onChange={(e) => changeTerm('constant')}
          checked={article.term === 'constant'}
        />
        <label className='radio-inline mx-1' htmlFor={props.index + 'constant'}>
          Виконувати постійно
        </label>
      </div>

      <div className={'form-inline mt-1'}>
        <input
          type='radio'
          name={props.index + 'term_radio'}
          id={props.index + 'no_term'}
          value='no_term'
          onChange={(e) => changeTerm('no_term')}
          checked={article.term === 'no_term'}
        />
        <label className='radio-inline mx-1' htmlFor={props.index + 'no_term'}>
          Без строку виконання
        </label>
      </div>
    </>
  );
}

DecreeArticleDeadlines.defaultProps = {
  index: 0
};

export default view(DecreeArticleDeadlines);
