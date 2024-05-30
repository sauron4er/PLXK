'use strict';
import * as React from 'react';
import PDFCell from "edms/templates/edms/my_docs/doc_info/pdf/pdf_cell";

function BagTestPDF(props) {
  console.log(props.fields);

  const fields = props.fields

  return (
    <>
      <PDFCell label={'Тип тестування'} value={fields.test_type} columns={12} />
      <PDFCell label={'Постачальник'} value={fields.provider} columns={6} />
      <PDFCell label={'Клієнт'} value={fields.client} columns={6} />
      <PDFCell label={'Тип макета'} value={fields.bag_type} columns={6} />
      <PDFCell label={'Назва макета'} value={fields.name} columns={6} />
      <PDFCell label={'Довжина, см'} value={fields.length} columns={3} />
      <PDFCell label={'Ширина, см'} value={fields.width} columns={3} />
      <PDFCell label={'Глибина, см'} value={fields.depth} columns={3} />
      <PDFCell label={'Вага, кг'} value={fields.weight} columns={3} />
      <PDFCell label={'Матеріал виготовлення'} value={fields.material} columns={5} />
      <PDFCell label={'Колір'} value={fields.color} columns={3} />
      <PDFCell label={'Кількість шарів'} value={fields.layers} columns={2} />
      <PDFCell label={'Щільність, кг\\м2'} value={fields.density} columns={2} />
      <PDFCell label={'Вимоги клієнта'} value={'Вимоги клієнта'} columns={12} />
      <PDFCell label={'Результати тестування'} value={'Результати тестування'} columns={12} />
      <PDFCell label={'У info'} value={'Неправильно показує &mt у вимогах клієнта'} columns={12} />

    </>
  );
}

BagTestPDF.defaultProps = {
  fields: {}
};

export default BagTestPDF;
