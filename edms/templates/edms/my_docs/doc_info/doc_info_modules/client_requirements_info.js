'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave, faCheck} from '@fortawesome/free-solid-svg-icons';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class ClientRequirementsInfo extends React.Component {
  getRequirementLine = (key, index) => {
    const {crs, sub_product} = this.props;
    const names = {
      bag_name: 'Назва мішка, ТМ',
      weight_kg: 'Вага, кг',
      mf_water: sub_product === 3 ? 'Масова частка води, %, не більше' : 'Масова частка води, W,%',
      mf_ash: 'Масова частка золи в перерахунку на суху речовину, %',
      mf_evaporable: 'Масова частка летких в перерахунку на суху речовину, %',
      mf_not_evaporable_carbon: 'Масова частка нелеткого вуглецю в перерахунку на суху речовину, %',
      main_faction: 'Основна фракція',
      granulation_lt5: 'Грануляційний склад, фракція, < 5 мм',
      granulation_lt10: 'Грануляційний склад, фракція, < 10 мм',
      granulation_lt20: 'Грануляційний склад, фракція, < 20 мм',
      granulation_lt25: 'Грануляційний склад, фракція, < 25 мм',
      granulation_lt40: 'Грануляційний склад, фракція, < 40 мм',
      granulation_mt20: 'Грануляційний склад, фракція, > 20 мм',
      granulation_mt60: 'Грануляційний склад, фракція, > 60 мм',
      granulation_mt80: 'Грануляційний склад, фракція, > 80 мм',
      appearance: 'Зовнішній вигляд',
      color: 'Колір, одиниці Хазена, не більше',
      density: sub_product === 3 ? ['Густина, при 200°С, г/см', <sup>3</sup>] : 'Густина',
      mf_basic: 'Масова частка основної речовини, %,  не менше',
      mf_ethanol: 'Масова частка етилового спирту, %,  не більше',
      mf_acids: 'Масова частка кислот в перерахунку на оцтову кислоту, %, не більше',
      mf_not_evaporable_residue: 'Масова частка нелеткого залишку, %, не більше',
      smell: 'Запах',
      color_APHA: 'Колір, АРНА, не більше',
      dry_residue: 'Сухий залишок після випарювання, %, не більше',
      mf_ethanol_ppm: 'Масова частка етилового спирту, ppm, не більше',
      methanol_ppm: 'Метанол, ppm, не більше',
      isopropanol_ppm: 'Ізопропанол, ppm, не більше',
      benzol_ppm: 'Бензол, ppm, не більше',
      toluene_ppm: 'Толуол, ppm, не більше',
      ethylmethyl_ketone_ppm: 'Етилметилкетон, ppm, не більше',
      other_identified_impurities_ppm: 'Інші ідентифіковані домішки, ppm, не більше',
      unidentified_impurities_ppm: 'Не ідентифіковані домішки, ppm, не більше',
      brand_of_resin: 'Марка смоли',
      mf_dry_residue: 'Масова частка сухого залишку, % не менше',
      mf_free_formaldehyde: 'Масова частка вільного формальдегіду, % не більше',
      conditional_viscosity: 'Умовна в’язкість при 20,0 ± 0,5°С, сек.',
      hydrogen_ions: 'Концентрація водневих іонів, рН',
      gelatinization_time: 'Час желатинізації при 100°С, сек.',
      miscibility_with_water: 'Змішуваність з водою, при 20 ± 1°С',
      warranty_period: 'Гарантійний термін зберігання, днів при 20°С',
      TU: 'ТУ',
      binding: 'Зв’язуюче'
    };

    return (
      <If condition={crs[key] && names[key]}>
        <tr key={index}>
          <td>{names[key]}</td>
          <td className='font-weight-bold'>{crs[key]}</td>
        </tr>
      </If>
    );
  };

  render() {
    const {fieldName, crs, ars} = this.props;

    return (
      <>
        <div>{fieldName}:</div>
        <div className='bg-white p-2 border rounded'>
          <table className='table table-hover'>
            <tbody>
              {Object.keys(crs).map((key, index) => this.getRequirementLine(key, index))}
              <If condition={ars.length > 0}>
                <For each='ar' of={ars} index='index'>
                  <tr key={index}>
                    <td>{ar.name}</td>
                    <td className='font-weight-bold'>{ar.requirement}</td>
                  </tr>
                </For>
              </If>
            </tbody>
          </table>
        </div>
      </>
    );
  }

  static defaultProps = {
    field_name: '---',
    crs: [],
    ars: [],
    sub_product: 0
  };
}

export default ClientRequirementsInfo;
