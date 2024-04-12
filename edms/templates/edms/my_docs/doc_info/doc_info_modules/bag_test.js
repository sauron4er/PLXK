'use strict';
import * as React from 'react';
import {getTextByQueue} from 'templates/components/my_extras';
import Text from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/text';
import Files from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/files';

function BagTest(props) {
  console.log(props.fields);

  function getFileByFieldName(field_name, label) {
    let file = [];
    for (let i = 0; i < props.fields.files.length; i++) {
      if (props.fields.files[i].field_name === field_name) {
        file = [props.fields.files[i]];
      }
    }
    return (
      <Choose>
        <When condition={file.length}>
          <div className='css_note_text mt-2'>
            <Files files={file} fieldName={label} />
          </div>
        </When>
        <Otherwise>
          <></>
        </Otherwise>
      </Choose>
    );
  }

  return (
    <>
      <Text text={props.fields.test_type} text_info={{field_name: 'Тип тестування'}} />
      <Text text={props.fields.provider} text_info={{field_name: 'Постачальник'}} />
      <Text text={props.fields.client} text_info={{field_name: 'Клієнт'}} />
      <Text text={props.fields.bag_type} text_info={{field_name: 'Тип макету'}} />
      <Text text={props.fields.name} text_info={{field_name: 'Назва макету'}} />
      {getFileByFieldName('tech_conditions_file', 'Технічні умови до взірця ТУ У, ДСТУ')}
      {getFileByFieldName('sanitary_conclusion_tu_file', 'Санітарний висновок на ТУ')}
      {getFileByFieldName('sanitary_conclusion_product_file', 'Санітарний висновок на продукцію')}
      {getFileByFieldName('quality_certificate_file', 'Сертифікат якості чи гарантійний лист')}
      {getFileByFieldName('glue_certificate_file', 'Сертифікат безпечності на клей')}
      {getFileByFieldName('paint_certificate_file', 'Сертифікат безпечності на фарбу')}
      <Text text={props.fields.length} text_info={{field_name: 'Довжина, см'}} />
      <Text text={props.fields.width} text_info={{field_name: 'Ширина, см'}} />
      <Text text={props.fields.depth} text_info={{field_name: 'Глибина, см'}} />
      <Text text={props.fields.density} text_info={{field_name: 'Щільність, кг\\м2'}} />
      <Text text={props.fields.weight} text_info={{field_name: 'Вага, кг'}} />
      <Text text={props.fields.material} text_info={{field_name: 'Матеріал виготовлення (бумага, клей, фарба)'}} />
      {getFileByFieldName('material_certificate_file', 'Файл сертифікату на матеріал')}
      <Text text={props.fields.layers} text_info={{field_name: 'Кількість шарів'}} />
      <Text text={props.fields.color} text_info={{field_name: 'Колір'}} />
      {getFileByFieldName('sample_design_file', 'Файл конструкції взірця')}
      <Text text={props.fields.deadline} text_info={{field_name: 'Бажані терміни тестування'}} />
      <div className='css_note_text mt-2'>
        <input
          type='checkbox'
          id='samples_are_available'
          name='samples_are_available'
          checked={props.fields.samples_are_available}
          disabled
        />
        <label htmlFor='samples_are_available'> 20 взірців паперових мішків наявні</label>
      </div>
    </>
  );
}

BagTest.defaultProps = {
  fields: {}
};

export default BagTest;
