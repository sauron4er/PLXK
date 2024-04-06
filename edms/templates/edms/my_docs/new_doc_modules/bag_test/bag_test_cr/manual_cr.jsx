'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import BagTestField from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field';

function ManualCR() {
  return (
    <>
      <div className='row'>
        <BagTestField name='cr_bag_name' label='Назва мішка, ТМ' length={100} columns={12} />
        <BagTestField name='cr_weight_kg' label='Вага, кг' length={10} columns={4} />
        <BagTestField name='cr_mf_water' label='Масова частка води, W,%' length={10} columns={4} />
        <BagTestField name='cr_main_faction' label='Основна фракція' length={10} columns={4} />
        <BagTestField name='cr_mf_ash' label='Масова частка золи в перерахунку на суху речовину, %' length={10} columns={4} />
        <BagTestField name='cr_mf_evaporable' label='Масова частка летких в перерахунку на суху речовину, %' length={10} columns={4} />
        <BagTestField name='cr_mf_not_evaporable_carbon' label='Масова частка нелеткого вуглецю в перерахунку на суху речовину, %' length={10} columns={4} />
        <BagTestField name='cr_granulation_lt5' label='Грануляційний склад, фракція, < 5 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_lt10' label='Грануляційний склад, фракція, < 10 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_lt20' label='Грануляційний склад, фракція, < 20 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_lt25' label='Грануляційний склад, фракція, < 25 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_lt40' label='Грануляційний склад, фракція, < 40 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_mt20' label='Грануляційний склад, фракція, > 20 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_mt60' label='Грануляційний склад, фракція, > 60 мм' length={10} columns={3} />
        <BagTestField name='cr_granulation_mt80' label='Грануляційний склад, фракція, > 80 мм' length={10} columns={3} />
      </div>
    </>
  );
}

ManualCR.defaultProps = {};

export default view(ManualCR);
