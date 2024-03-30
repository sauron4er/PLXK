'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import BagTestField from "edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field";

function BagTest(props) {
  function onChange(e) {

  }

  return (
    <div className='row'>
      <BagTestField name='name' label='Назва макета, см.' length={100} columns={12} />
      <BagTestField name='length' label='Довжина, см.' length={3} />
      <BagTestField name='width' label='Ширина, см.' length={3} />
      <BagTestField name='depth' label='Глибина, см.' length={3} />
      <BagTestField name='density' label='Щільність, кг/м2' length={3} columns={6} />
      <BagTestField name='weight' label='Вага, кг' length={3} columns={6} />
      <BagTestField name='material' label='Матеріал виготовлення' length={400} columns={12} />
      <BagTestField name='layers' label='Кількість шарів' length={1} columns={4} />
      <BagTestField name='color' label='Колір' length={20} columns={4} />
      <BagTestField name='color' label='ФАЙЛ' length={1} columns={4} />
    </div>
  );
}

BagTest.defaultProps = {};

export default view(BagTest);
