'use strict';
import * as React from 'react';
import Text from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/text';
import Files from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/files';

function BagTest(props) {

  function getFileByFieldName(field_name, label) {
    let files = [];

    for (let i = 0; i < props.fields.files.length; i++) {
      if (props.fields.files[i].field_name === field_name) {
        files.push(props.fields.files[i]);
      }
    }

    return (
      <Choose>
        <When condition={files.length}>
          <div className='css_note_text mt-2 mb-1'>
            <Files files={files} fieldName={label} />
          </div>
        </When>
        <Otherwise>
          <></>
        </Otherwise>
      </Choose>
    );
  }

  function getCommentByFieldName(field_name) {
    let comment = '';

    for (let i = 0; i < props.fields.results_comments.length; i++) {
      if (props.fields.results_comments[i].field_name === field_name) {
        comment = props.fields.results_comments[i].comment;
        break;
      }
    }

    return (
      <Choose>
        <When condition={comment.length}>
          <div className='font-italic'>{comment}</div>
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
          onChange={() => {}}
        />
        <label htmlFor='samples_are_available'> 20 взірців паперових мішків наявні</label>
      </div>

      <div className='mt-1'>Вимоги клієнта</div>
      <div className='css_note_text'>
        <div>Назва мішка, ТМ: {props.fields.cr_bag_name || '---'}</div>
        <div>Вага, кг: {props.fields.cr_weight_kg || '---'}</div>
        <div>Масова частка води, W,%: {props.fields.cr_mf_water || '---'}</div>
        <div>Основна фракція: {props.fields.cr_main_faction || '---'}</div>
        <div>Масова частка золи в перерахунку на суху речовину, %: {props.fields.cr_mf_ash || '---'}</div>
        <div>Масова частка летких в перерахунку на суху речовину, %: {props.fields.cr_mf_evaporable || '---'}</div>
        <div>Масова частка нелеткого вуглецю в перерахунку на суху речовину, %: {props.fields.cr_mf_not_evaporable_carbon || '---'}</div>
        <div>Грануляційний склад, фракція, &lt; 5 мм: {props.fields.cr_granulation_lt5 || '---'}</div>
        <div>Грануляційний склад, фракція, &lt; 10 мм: {props.fields.cr_granulation_lt10 || '---'}</div>
        <div>Грануляційний склад, фракція, &lt; 20 мм: {props.fields.cr_granulation_lt20 || '---'}</div>
        <div>Грануляційний склад, фракція, &lt; 25 мм: {props.fields.cr_granulation_lt25 || '---'}</div>
        <div>Грануляційний склад, фракція, &lt; 40 мм: {props.fields.cr_granulation_lt40 || '---'}</div>
        <div>Грануляційний склад, фракція, &gt; 20 мм: {props.fields.cr_granulation_mt20 || '---'}</div>
        <div>Грануляційний склад, фракція, &gt; 60 мм: {props.fields.cr_granulation_mt60 || '---'}</div>
        <div>Грануляційний склад, фракція, &gt; 80 мм: {props.fields.cr_granulation_mt80 || '---'}</div>
      </div>

      <If condition={props.fields.test_date}>
        <hr />
        <div className='rounded p-2' style={props.fields.sample_is_compliant ? {background: 'lightgreen'} : {background: 'pink'}}>
          <div className='font-italic'>Результати тестування:</div>
          <div className='css_note_text mt-1'>
            <div className='font-weight-bold'>
              {props.fields.sample_is_compliant ? 'Взірець відповідає вимогам' : 'Взірець не відповідає вимогам'}
            </div>
            {getCommentByFieldName('sample_is_compliant_comment')}
          </div>

          <div className='css_note_text'>Дата закінчення попереднього тестування взірця: {props.fields.test_date}</div>
          <div className='css_note_text mt-1'>
            {props.fields.meets_tech_specs ? 'Відповідає ТУ У' : 'Не відповідає ТУ У'}
            {getCommentByFieldName('meets_tech_specs_comment')}
          </div>
          <div className='css_note_text mt-1'>
            {props.fields.meets_certificate
              ? 'Відповідає показникам сертифікату якості (якість паперу, колір, опір на розрив)'
              : 'Не відповідає показникам сертифікату якості (якість паперу, колір, опір на розрив)'}
            {getCommentByFieldName('meets_certificate_comment')}
          </div>
          <div className='css_note_text mt-1'>
            {props.fields.meets_dimensions ? 'Відповідає розмірам' : 'Не відповідає розмірам'}
            {getCommentByFieldName('meets_dimensions_comment')}
            {getFileByFieldName('meets_dimensions_files', '')}
          </div>
          <div className='css_note_text mt-1'>
            {props.fields.meets_density ? 'Відповідає щільності' : 'Не відповідає щільності'}
            {getCommentByFieldName('meets_density_comment')}
            {getFileByFieldName('meets_density_files', '')}
          </div>
          <div className='css_note_text mt-1'>
            {props.meets_client_requirements
              ? 'Відповідає вимогам клієнта (збереження продукції)'
              : 'Не відповідає вимогам клієнта (збереження продукції)'}
            {getCommentByFieldName('meets_client_requirements_comment')}
          </div>
          <div className='css_note_text mt-1'>
            {props.tech_conditions_are_in_certificate
              ? 'Зазначені технічні умови наявні у сертифікаті якості'
              : 'Зазначені технічні умови НЕ наявні у сертифікаті якості'}
            {getCommentByFieldName('tech_conditions_are_in_certificate_comment')}
            {getFileByFieldName('tech_conditions_are_in_certificate_files', '')}
          </div>
        </div>
      </If>
    </>
  );
}

BagTest.defaultProps = {
  fields: {}
};

export default BagTest;
