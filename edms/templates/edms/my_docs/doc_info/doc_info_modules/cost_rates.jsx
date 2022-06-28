import * as React from 'react';
import Text from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/text';

class CostRates extends React.Component {
  render() {
    const {costRates} = this.props;

    return (
      <>
        <Text text_info={{is_editable: false, field_name: 'Тип норм витрат'}} text={costRates.type} />
        <Text text_info={{is_editable: false, field_name: 'Тип обліку'}} text={costRates.accounting} />
        <Text text_info={{is_editable: false, field_name: 'Вид продукції'}} text={costRates.product_type} />
        <Text text_info={{is_editable: false, field_name: 'Продукція'}} text={costRates.product} />
        <Text text_info={{is_editable: false, field_name: 'Виробничий підрозділ'}} text={costRates.department} />
        <Text text_info={{is_editable: false, field_name: 'Дата введення в дію'}} text={costRates.date_start} />
        <If condition={costRates.client}>
          <Text text_info={{is_editable: false, field_name: 'Клієнт'}} text={costRates.client} />
        </If>

        <div className='mt-1'>Сировина та витратні матеріали:</div>

        <For each='field' of={costRates.fields} index='idx'>
          <div key={idx} className='bg-white p-1 my-1 border-top border-bottom'>
            <div className='d-flex'>
              <div className='col-lg-8'>
                <div>{field.name}</div>
                <small className='font-italic'>Артикул 1С8: {field.term}</small>
              </div>
              <div className='col-lg-4 font-weight-bold'>
                {field.norm} {field.unit}
              </div>
            </div>
            <If condition={field.comment}>
              <div className='d-flex'>
                <div className='col-lg'>Коментар автора:</div>
              </div>
              <div className='d-flex'>
                <div className='col-lg'>
                  <div className='font-italic'>{field.comment}</div>
                </div>
              </div>
            </If>
          </div>
        </For>
      </>
    );
  }

  static defaultProps = {
    field_name: '---',
    module: {},
    costRates: {}
  };
}

export default CostRates;
