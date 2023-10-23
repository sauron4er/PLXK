'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';

import {notify} from 'templates/components/my_extras';
import {useEffect, useState} from 'react';
import EditClientRequirement from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/client_requirements/edit_client_requirement';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';

function EditClientRequirements(props) {
  const [comment, setComment] = useState('');
  const [newCR, setNewCR] = useState(props.oldCR);
  const [newAR, setNewAR] = useState(props.oldAR);
  const [newCRList, setnewCRList] = useState(Object.entries(props.oldCR));
  const [newARList, setnewARList] = useState(Object.entries(props.oldAR));

  useEffect(() => {
  }, []);

  // TODO редагування додаткових вимог
  // TODO видалення додаткових вимог
  // TODO додавання нових додаткових вимог
  // TODO відправка цього всього на сервер
  // TODO опрацювання запиту на сервері
  // TODO відправка документа по новому кругу (+ автору, якщо це не його зміни)

  function onSubmit() {
    if (props.oldCR === JSON.stringify(newCR)) {
      notify('Ви нічого не змінили.');
    } else {
      props.onSubmit(comment);
    }
  }

  function onClose() {
    props.onCloseModal();
  }

  function onCRChange(name, new_value, index) {
    const cr_list = [...newCRList];
    cr_list[index][1] = new_value;
    setnewCRList(cr_list);
  }

  function onCommentChange(e) {
    setComment(e.target.value);
  }

  function onARNameChange(e, index) {
    const ar_list = [...newARList];
    ar_list[index][1].name = e.target.value;
    setnewARList(ar_list);
  }

  function onARRequirementChange(e, index) {
    const ar_list = [...newARList];
    ar_list[index][1].requirement = e.target.value;
    ar_list[index][1].status = 'changed';
    setnewARList(ar_list);
  }

  function delAR(e, id) {
    const ar_list = [...newARList];

    for (const [index, value] of ar_list.entries()) {
      if (value[1].id == id) {
        if (ar_list[index][1].status === 'new') {
          ar_list.splice(index, 1);
        } else ar_list[index][1].status = 'delete';
      }
    }
    setnewARList(ar_list);
  }

  function addBlankAdditionalRequirement() {
    const ar_list = [...newARList];
    ar_list.push(['', {id: 0, name: '', requirement: '', status: 'new'}]);
    console.log(ar_list);
    setnewARList(ar_list);
  }

  return (
    <>
      <div className='modal-header d-flex justify-content-between'>
        <h5 className='modal-title font-weight-bold'>Редагування вимог клієнта</h5>
        <button className='btn btn-link' onClick={onClose}>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div className='modal-body'>
        <div className='row'>
          <For each='cr' of={newCRList} index='index'>
            <If condition={cr[1].length}>
              <div key={index} className='col-md-4'>
                <EditClientRequirement
                  name={cr[0]}
                  label={client_requirements_names_and_labels[cr[0]]}
                  value={cr[1]}
                  index={index}
                  onChange={onCRChange}
                />
              </div>
            </If>
          </For>
        </div>
        <div>
          <div className='font-weight-bold'>Додаткові вимоги:</div>
          <For each='ar' of={newARList} index='ar_index'>
            <div className="d-none">{ar[1].status} // Лінь розбиратися, чому без цього не оновлює нормально список при видаленні
            </div>
            <If condition={ar[1].status !== 'delete'}>
              <div key={ar_index} className='d-flex'>
                <TextInput
                  className='mr-1'
                  text={ar[1].name}
                  fieldName='Назва'
                  onChange={(e) => onARNameChange(e, ar_index)}
                  maxLength={200}
                  disabled={false}
                />
                <TextInput
                  className='mr-1'
                  text={ar[1].requirement}
                  fieldName='Показник'
                  onChange={(e) => onARRequirementChange(e, ar_index)}
                  maxLength={50}
                  disabled={false}
                />
                <SubmitButton className='btn-outline-danger' text='Видалити' onClick={(e) => delAR(e, ar[1].id)} />
              </div>
              <hr className='mb-1 mt-0' />
            </If>
          </For>
          <button className='btn btn-sm btn-outline-primary' onClick={() => addBlankAdditionalRequirement()}>
            Додати вимоги
          </button>
        </div>
      </div>

      <div className='modal-footer'>
        <label htmlFor='comment_modal'>Прокоментуйте зміни:</label>
        <textarea name='comment' className='form-control' rows='3' id='comment_modal' onChange={onCommentChange} value={comment} />
        <small>При збереженні змін даний електронний документ буде знов запропоновано на розгляд візуючим</small>
        <button className='btn btn-outline-info ml-1' onClick={onSubmit}>
          Зберегти зміни
        </button>
      </div>
    </>
  );
}

EditClientRequirements.defaultProps = {
  oldCR: [],
  oldAR: [],
  onCloseModal: {},
  onSubmit: {}
};

export default EditClientRequirements;

const client_requirements_names_and_labels = {
  TU: 'ТУ',
  appearance: 'Зовнішній вигляд',
  bag_name: 'Назва мішка, ТМ',
  benzol_ppm: 'Бензол, ppm, не більше',
  binding: 'Зв’язуюче',
  brand_of_resin: 'Марка смоли',
  color: 'Колір, одиниці Хазена, не більше',
  color_APHA: 'Колір, АРНА, не більше',
  conditional_viscosity: 'Умовна в’язкість при 20,0 ± 0,5°С, сек.',
  density: 'Густина',
  dry_residue: 'Сухий залишок після випарювання, %, не більше',
  ethylmethyl_ketone_ppm: 'Етилметилкетон, ppm, не більше',
  gelatinization_time: 'Час желатині зації при 100°С, сек.',
  granulation_lt5: 'Грануляційний склад, фракція, < 5 мм',
  granulation_lt10: 'Грануляційний склад, фракція, < 10 мм',
  granulation_lt20: 'Грануляційний склад, фракція, < 20 мм',
  granulation_lt25: 'Грануляційний склад, фракція, < 25 мм',
  granulation_lt40: 'Грануляційний склад, фракція, < 40 мм',
  granulation_mt20: 'Грануляційний склад, фракція, > 20 мм',
  granulation_mt60: 'Грануляційний склад, фракція, > 60 мм',
  granulation_mt80: 'Грануляційний склад, фракція, > 80 мм',
  hydrogen_ions: 'Концентрація водневих іонів, рН',
  isopropanol_ppm: 'Ізопропанол, ppm, не більше',
  main_faction: 'Основна фракція',
  methanol_ppm: 'Метанол, ppm, не більше',
  mf_acids: 'Масова частка кислот в перерахунку на оцтову кислоту, %, не більше',
  mf_ash: 'Масова частка золи в перерахунку на суху речовину, %',
  mf_basic: 'Масова частка основної речовини, %,  не менше',
  mf_dry_residue: 'Масова частка сухого залишку, % не менше',
  mf_ethanol: 'Масова частка етилового спирту, %,  не більше',
  mf_ethanol_ppm: 'Масова частка етилового спирту, ppm, не більше',
  mf_evaporable: 'Масова частка летких в перерахунку на суху речовину, %',
  mf_free_formaldehyde: 'Масова частка вільного формальдегіду, % не більше',
  mf_not_evaporable_carbon: 'Масова частка нелеткого вуглецю в перерахунку на суху речовину, %',
  mf_not_evaporable_residue: 'Масова частка нелеткого залишку, %, не більше',
  mf_water: 'Масова частка води, W,%',
  miscibility_with_water: 'Змішуваність з водою, при 20 ± 1°С',
  other_identified_impurities_ppm: 'Інші ідентифіковані домішки, ppm, не більше',
  smell: 'Запах',
  toluene_ppm: 'Толуол, ppm, не більше',
  unidentified_impurities_ppm: 'Не ідентифіковані домішки, ppm, не більше',
  warranty_period: 'Гарантійний термін зберігання, днів при 20°С',
  weight_kg: 'Вага, кг'
};
