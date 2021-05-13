'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import 'static/css/fancy_radio.css';
import ClientRequirementsItem from 'edms/templates/edms/my_docs/new_doc_modules/client_requirements_item';

class ClientRequirements extends React.Component {
  onChange = (e) => {
    newDocStore.new_document.client_requirements[e.target.id] = e.target.value;
  };

  render() {
    const {module_info} = this.props;
    const {sub_product_type_name, client_requirements} = newDocStore.new_document;

    return (
      <div className='col'>
        <div>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </div>
        <div className='row mt-1'>
          <Choose>
            <When condition={sub_product_type_name === 'Деревне вугілля'}>
              <div className='row'>
                <ClientRequirementsItem name='bag_name' label='Назва мішка, ТМ' />
                <ClientRequirementsItem name='weight_kg' label='Вага, кг' />
                <ClientRequirementsItem name='mf_water' label='Масова частка води, W,%' />
                <ClientRequirementsItem name='mf_ash' label='Масова частка золи в перерахунку на суху речовину, %' />
                <ClientRequirementsItem name='mf_evaporable' label='Масова частка летких в перерахунку на суху речовину, %' />
                <ClientRequirementsItem
                  name='mf_not_evaporable_carbon'
                  label='Масова частка нелеткого вуглецю в перерахунку на суху речовину, %'
                />
                <ClientRequirementsItem name='main_faction' label='Основна фракція' />
                <ClientRequirementsItem name='granulation_lt5' label='Грануляційний склад, фракція, < 5 мм' />
                <ClientRequirementsItem name='granulation_lt10' label='Грануляційний склад, фракція, < 10 мм' />
                <ClientRequirementsItem name='granulation_lt20' label='Грануляційний склад, фракція, < 20 мм' />
                <ClientRequirementsItem name='granulation_lt25' label='Грануляційний склад, фракція, < 25 мм' />
                <ClientRequirementsItem name='granulation_lt40' label='Грануляційний склад, фракція, < 40 мм' />
                <ClientRequirementsItem name='granulation_mt20' label='Грануляційний склад, фракція, > 20 мм' />
                <ClientRequirementsItem name='granulation_mt60' label='Грануляційний склад, фракція, > 60 мм' />
                <ClientRequirementsItem name='granulation_mt80' label='Грануляційний склад, фракція, > 80 мм' />
              </div>
            </When>
            <When condition={sub_product_type_name === 'Деревновугільні брикети'}>
              <div className='row'>
                <ClientRequirementsItem name='bag_name' label='Назва мішка, ТМ' />
                <ClientRequirementsItem name='weight_kg' label='Вага, кг.' />
                <ClientRequirementsItem name='mf_water' label='Масова частка води, W,%' />
                <ClientRequirementsItem name='mf_ash' label='Масова частка золи в перерахунку на суху речовину, %' />
                <ClientRequirementsItem
                  name='mf_not_evaporable_carbon'
                  label='Масова частка нелеткого вуглецю в перерахунку на суху речовину, %'
                />
                <ClientRequirementsItem name='granulation_lt20' label='Грануляційний склад, фракція, < 20мм' />
              </div>
            </When>
            <When condition={sub_product_type_name === 'ЕТА'}>
              <div className='row'>
                <small className='col-12 mb-1 font-weight-bold'>Основні вимоги</small>
                <ClientRequirementsItem name='appearance' label='Зовнішній вигляд' />
                <ClientRequirementsItem name='color' label='Колір, одиниці Хазена, не більше' />
                <ClientRequirementsItem name='density' label={["Густина, при 200°С, г/см", <sup>3</sup>]} />
                <ClientRequirementsItem name='mf_basic' label='Масова частка основної речовини, %,  не менше' />
                <ClientRequirementsItem name='mf_ethanol' label='Масова частка етилового спирту, %,  не більше' />
                <ClientRequirementsItem name='mf_acids' label='Масова частка кислот в перерахунку на оцтову кислоту, %, не більше' />
                <ClientRequirementsItem name='mf_not_evaporable_residue' label='Масова частка нелеткого залишку, %, не більше' />
                <ClientRequirementsItem name='mf_water' label='Масова частка води, %, не більше' />
                <ClientRequirementsItem name='smell' label='Запах' />
              </div>
              <div className='row'>
                <small className='col-12 mb-1 font-weight-bold'>Додаткові вимоги</small>
                <ClientRequirementsItem name='color_APHA' label='Колір, АРНА, не більше' notRequired />
                <ClientRequirementsItem name='dry_residue' label='Сухий залишок після випарювання, %, не більше' notRequired />
                <ClientRequirementsItem name='mf_ethanol_ppm' label='Масова частка етилового спирту, ppm, не більше' notRequired />
                <ClientRequirementsItem name='methanol_ppm' label='Метанол, ppm, не більше' notRequired />
                <ClientRequirementsItem name='isopropanol_ppm' label='Ізопропанол, ppm, не більше' notRequired />
                <ClientRequirementsItem name='benzol_ppm' label='Бензол, ppm, не більше' notRequired />
                <ClientRequirementsItem name='toluene_ppm' label='Толуол, ppm, не більше' notRequired />
                <ClientRequirementsItem name='ethylmethyl_ketone_ppm' label='Етилметилкетон, ppm, не більше' notRequired />
                <ClientRequirementsItem name='other_identified_impurities_ppm' label='Інші ідентифіковані домішки, ppm, не більше' notRequired />
                <ClientRequirementsItem name='unidentified_impurities_ppm' label='Не ідентифіковані домішки, ppm, не більше' notRequired />
                
              </div>
            </When>
            <When condition={['КФС', 'МКФС'].includes(sub_product_type_name)}>
              <div className='row'>
                <ClientRequirementsItem name='brand_of_resin' label='Марка смоли' />
                <ClientRequirementsItem name='mf_dry_residue' label='Масова частка сухого залишку, % не менше' />
                <ClientRequirementsItem name='mf_free_formaldehyde' label='Масова частка вільного формальдегіду, % не більше' />
                <ClientRequirementsItem name='conditional_viscosity' label='Умовна в’язкість при 20,0 ± 0,5°С, сек.' />
                <ClientRequirementsItem name='hydrogen_ions' label='Концентрація водневих іонів, рН' />
                <ClientRequirementsItem name='gelatinization_time' label='Час желатині зації при 100°С, сек.' />
                <ClientRequirementsItem name='density' label='Густина' />
                <ClientRequirementsItem name='miscibility_with_water' label='Змішуваність з водою, при 20 ± 1°С' />
                <ClientRequirementsItem name='warranty_period' label='Гарантійний термін зберігання, днів при 20°С' />
                <ClientRequirementsItem name='TU' label='ТУ' />
              </div>
            </When>
            <Otherwise>
              <div className='font-italic'>Оберіть підтип продукції</div>
            </Otherwise>
          </Choose>
        </div>
      </div>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(ClientRequirements);
