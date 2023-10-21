'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';

import { notify } from "templates/components/my_extras";
import { useEffect, useState } from "react";
import EditClientRequirement
  from "edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/client_requirements/edit_client_requirement";
import docInfoStore from "edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store";


function EditClientRequirements(props) {
  const [comment, setComment] = useState('')
  const [newCR, setNewCR] = useState(props.oldCR)
  const [newAR, setNewAR] = useState(props.oldAR)
  const [newCRList, setnewCRList] = useState(Object.entries(props.oldCR))
  const [newARList, setnewARList] = useState(Object.entries(props.oldAR))

  useEffect(() => {
    console.log(newARList);
  }, [])

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
    cr_list[index][1] = new_value
    setnewCRList(cr_list)
  }

  function onCommentChange(e) {
    setComment(e.target.value);
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
        <For each='cr' of={newCRList} index='index'>
          <If condition={cr[1].length}>
            <EditClientRequirement
              name={cr[0]}
              label={client_requirements_names_and_labels[cr[0]]}
              value={cr[1]}
              index={index}
              key={index}
              onChange={onCRChange}
            />
          </If>
        </For>
      </div>

      <div className='modal-footer'>
        <label htmlFor='comment_modal'>Прокоментуйте зміни:</label>
          <textarea
            name='comment'
            className='form-control'
            rows='3'
            id='comment_modal'
            onChange={onCommentChange}
            value={comment}
          />
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
    "TU": "ТУ",
    "appearance": "Зовнішній вигляд",
    "bag_name": "Назва мішка, ТМ",
    "benzol_ppm": "Бензол, ppm, не більше",
    "binding": "Зв’язуюче",
    "brand_of_resin": "Марка смоли",
    "color": "Колір, одиниці Хазена, не більше",
    "color_APHA": "Колір, АРНА, не більше",
    "conditional_viscosity": "Умовна в’язкість при 20,0 ± 0,5°С, сек.",
    "density": "Густина",
    "dry_residue": "Сухий залишок після випарювання, %, не більше",
    "ethylmethyl_ketone_ppm": "Етилметилкетон, ppm, не більше",
    "gelatinization_time": "Час желатині зації при 100°С, сек.",
    "granulation_lt5": "Грануляційний склад, фракція, < 5 мм",
    "granulation_lt10": "Грануляційний склад, фракція, < 10 мм",
    "granulation_lt20": "Грануляційний склад, фракція, < 20 мм",
    "granulation_lt25": "Грануляційний склад, фракція, < 25 мм",
    "granulation_lt40": "Грануляційний склад, фракція, < 40 мм",
    "granulation_mt20": "Грануляційний склад, фракція, > 20 мм",
    "granulation_mt60": "Грануляційний склад, фракція, > 60 мм",
    "granulation_mt80": "Грануляційний склад, фракція, > 80 мм",
    "hydrogen_ions": "Концентрація водневих іонів, рН",
    "isopropanol_ppm": "Ізопропанол, ppm, не більше",
    "main_faction": "Основна фракція",
    "methanol_ppm": "Метанол, ppm, не більше",
    "mf_acids": "Масова частка кислот в перерахунку на оцтову кислоту, %, не більше",
    "mf_ash": "Масова частка золи в перерахунку на суху речовину, %",
    "mf_basic": "Масова частка основної речовини, %,  не менше",
    "mf_dry_residue": "Масова частка сухого залишку, % не менше",
    "mf_ethanol": "Масова частка етилового спирту, %,  не більше",
    "mf_ethanol_ppm": "Масова частка етилового спирту, ppm, не більше",
    "mf_evaporable": "Масова частка летких в перерахунку на суху речовину, %",
    "mf_free_formaldehyde": "Масова частка вільного формальдегіду, % не більше",
    "mf_not_evaporable_carbon": "Масова частка нелеткого вуглецю в перерахунку на суху речовину, %",
    "mf_not_evaporable_residue": "Масова частка нелеткого залишку, %, не більше",
    "mf_water": "Масова частка води, W,%",
    "miscibility_with_water": "Змішуваність з водою, при 20 ± 1°С",
    "other_identified_impurities_ppm": "Інші ідентифіковані домішки, ppm, не більше",
    "smell": "Запах",
    "toluene_ppm": "Толуол, ppm, не більше",
    "unidentified_impurities_ppm": "Не ідентифіковані домішки, ppm, не більше",
    "warranty_period": "Гарантійний термін зберігання, днів при 20°С",
    "weight_kg": "Вага, кг",
}
