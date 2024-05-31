'use strict';
import * as React from 'react';
import PDFCell from 'edms/templates/edms/my_docs/doc_info/pdf/pdf_cell';

function BagTestPDF(props) {
  const fields = props.fields;

  return (
    <>
      <PDFCell label='Тип тестування' value={fields.test_type} columns={12} />
      <PDFCell label='Постачальник' value={fields.provider} columns={6} />
      <PDFCell label='Клієнт' value={fields.client} columns={6} />
      <PDFCell label='Тип макета' value={fields.bag_type} columns={6} />
      <PDFCell label='Назва макета' value={fields.name} columns={6} />
      <PDFCell label='Довжина, см' value={fields.length} columns={3} />
      <PDFCell label='Ширина, см' value={fields.width} columns={3} />
      <PDFCell label='Глибина, см' value={fields.depth} columns={3} />
      <PDFCell label='Вага, кг' value={fields.weight} columns={3} />
      <PDFCell label='Матеріал виготовлення' value={fields.material} columns={5} />
      <PDFCell label='Колір' value={fields.color} columns={2} />
      <PDFCell label='Кількість шарів' value={fields.layers} columns={2} />
      <PDFCell label='Щільність, кг\\м2' value={fields.density} columns={3} />

      <div className='col-12'>
        <hr />
      </div>
      <h5 className='text-center col-12 mb-3'>Вимоги клієнта</h5>
      <PDFCell value={fields.cr_bag_name} label='Назва мішка, ТМ' columns={12} />
      <PDFCell value={fields.cr_weight_kg} label='Вага, кг' columns={2} />
      <PDFCell value={fields.cr_mf_water} label='Масова частка води, W,%' columns={3} />
      <PDFCell value={fields.cr_main_faction} label='Основна фракція' columns={3} />
      <PDFCell value={fields.cr_mf_ash} label='Масова частка золи в перерахунку на суху речовину, %' columns={4} />
      <PDFCell value={fields.cr_mf_evaporable} label='Масова частка летких в перерахунку на суху речовину, %' columns={4} />
      <PDFCell
        value={fields.cr_mf_not_evaporable_carbon}
        label='Масова частка нелеткого вуглецю в перерахунку на суху речовину, %'
        columns={4}
      />
      <PDFCell value={fields.cr_granulation_lt5} label='Грануляційний склад, фракція, < 5 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_lt10} label='Грануляційний склад, фракція, < 10 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_lt20} label='Грануляційний склад, фракція, < 20 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_lt25} label='Грануляційний склад, фракція, < 25 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_lt40} label='Грануляційний склад, фракція, < 40 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_mt20} label='Грануляційний склад, фракція, > 20 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_mt60} label='Грануляційний склад, фракція, > 60 мм' columns={3} />
      <PDFCell value={fields.cr_granulation_mt80} label='Грануляційний склад, фракція, > 80 мм' columns={3} />

      <div className='col-12'>
        <hr />
      </div>
      <h5 className='text-center col-12 mb-3'>Результати тестування</h5>
      <PDFCell value={props.fields.sample_is_compliant ? 'Взірець відповідає вимогам' : 'Взірець не відповідає вимогам'} columns={12} />
      <PDFCell value={props.fields.meets_tech_specs ? 'Відповідає ТУ У' : 'Не відповідає ТУ У'} columns={4} />
      <PDFCell value={props.fields.meets_dimensions ? 'Відповідає розмірам' : 'Не відповідає розмірам'} columns={4} />
      <PDFCell value={props.fields.meets_density ? 'Відповідає щільності' : 'Не відповідає щільності'} columns={4} />
      <PDFCell value={props.fields.meets_certificate
              ? 'Відповідає показникам сертифікату якості (якість паперу, колір, опір на розрив)'
              : 'Не відповідає показникам сертифікату якості (якість паперу, колір, опір на розрив)'} columns={12} />
      <PDFCell value={props.meets_client_requirements
              ? 'Відповідає вимогам клієнта (збереження продукції)'
              : 'Не відповідає вимогам клієнта (збереження продукції)'} columns={12} />
      <PDFCell value={props.tech_conditions_are_in_certificate
              ? 'Зазначені технічні умови наявні у сертифікаті якості'
              : 'Зазначені технічні умови НЕ наявні у сертифікаті якості'} columns={9} />
      <PDFCell value={fields.test_date} label='Дата тестування' columns={3} />
    </>
  );
}

BagTestPDF.defaultProps = {
  fields: {}
};

export default BagTestPDF;
