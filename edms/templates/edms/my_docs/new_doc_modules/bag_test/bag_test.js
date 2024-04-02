'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import BagTestField from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field';
import BagTestFile from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_file';

function BagTest(props) {
  function onChange(e) {}

  return (
    <div className='row'>
      <BagTestField name='name' label='Назва макета, см.' length={100} columns={12} />
      <BagTestFile
        name='tech_conditions_files'
        label='Технічні умови до взірця ТУ У, ДСТУ *'
        files={newDocStore.new_document.bag_test_fields.tech_conditions_files}
        columns={6}
      />
      <BagTestFile
        name='sanitary_conclusion_tu_files'
        label='Санітарний висновок на ТУ *'
        files={newDocStore.new_document.bag_test_fields.sanitary_conclusion_tu_files}
        columns={6}
      />
      <BagTestFile
        name='sanitary_conclusion_product_files'
        label='Санітарний висновок на продукцію *'
        files={newDocStore.new_document.bag_test_fields.sanitary_conclusion_product_files}
        columns={6}
      />
      <BagTestFile
        name='quality_certificate_files'
        label='Сертифікат якості чи гарантійний лист *'
        files={newDocStore.new_document.bag_test_fields.quality_certificate_files}
        columns={6}
      />
      <BagTestFile
        name='glue_certificate_files'
        label='Сертифікат безпечності на клей *'
        files={newDocStore.new_document.bag_test_fields.glue_certificate_files}
        columns={6}
      />
      <BagTestFile
        name='paint_certificate_files'
        label='Сертифікат безпечності на фарбу *'
        files={newDocStore.new_document.bag_test_fields.paint_certificate_files}
        columns={6}
      />
      <BagTestField name='length' label='Довжина, см.' length={3} />
      <BagTestField name='width' label='Ширина, см.' length={3} />
      <BagTestField name='depth' label='Глибина, см.' length={3} />
      <BagTestField name='density' label='Щільність, кг/м2' length={3} columns={6} />
      <BagTestField name='weight' label='Вага, кг' length={3} columns={6} />
      <BagTestField name='material' label='Матеріал виготовлення' length={400} columns={12} />
      <BagTestField name='layers' label='Кількість шарів' length={1} columns={4} />
      <BagTestField name='color' label='Колір' length={20} columns={4} />
    </div>
  );
}

BagTest.defaultProps = {};

export default view(BagTest);
