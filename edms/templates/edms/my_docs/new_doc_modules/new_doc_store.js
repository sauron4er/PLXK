import {store} from '@risingstack/react-easy-state';

const newDocStore = store({
  mockup_type_loading: true,
  new_document: {
    doc_version: 0, // Версія документа, впливає на список отримувачів на візування у випадку Вимог клієнта
    text: [],
    mockup_type: 0,
    mockup_type_name: '',
    mockup_product_type: 0,
    mockup_product_type_name: '',
    product_type: 0,
    product_type_name: '',
    sub_product_type: 0,
    sub_product_type_name: '',
    scope: 0,
    scope_name: '',
    client: 0,
    client_name: '',
    counterparty: 0,
    counterparty_name: '',
    counterparty_input: '',
    packaging_type: {
      queue: -1,
      text: ''
    },
    dimensions: [],
    contract_link: 0,
    contract_link_name: '',
    company: 'ТДВ',
    select: [],
    client_requirements: {
      bag_name: '',
      weight_kg: '',
      mf_water: '',
      mf_ash: '',
      mf_evaporable: '',
      mf_not_evaporable_carbon: '',
      main_faction: '',
      granulation_lt5: '',
      granulation_lt10: '',
      granulation_lt20: '',
      granulation_lt25: '',
      granulation_lt40: '',
      granulation_mt20: '',
      granulation_mt60: '',
      granulation_mt80: '',
      appearance: '',
      color: '',
      density: '',
      mf_basic: '',
      mf_ethanol: '',
      mf_acids: '',
      mf_not_evaporable_residue: '',
      smell: '',
      color_APHA: '',
      dry_residue: '',
      mf_ethanol_ppm: '',
      methanol_ppm: '',
      isopropanol_ppm: '',
      benzol_ppm: '',
      toluene_ppm: '',
      ethylmethyl_ketone_ppm: '',
      other_identified_impurities_ppm: '',
      other_unidentified_impurities_ppm: '',
      brand_of_resin: '',
      mf_dry_residue: '',
      mf_free_formaldehyde: '',
      conditional_viscosity: '',
      hydrogen_ions: '',
      gelatinization_time: '',
      miscibility_with_water: '',
      warranty_period: '',
      TU: ''
    }
  },
  clean_fields: () => {
    newDocStore.new_document = {
      doc_version: 0, // Версія документа, впливає на список отримувачів на візування у випадку Вимог клієнта
      text: [],
      mockup_type: 0,
      mockup_type_name: '',
      mockup_product_type: 0,
      mockup_product_type_name: '',
      product_type: 0,
      product_type_name: '',
      scope: 0,
      scope_name: '',
      sub_product_type: 0,
      sub_product_type_name: '',
      client: 0,
      client_name: '',
      counterparty: 0,
      counterparty_name: '',
      counterparty_input: '',
      packaging_type: {
        queue: -1,
        text: ''
      },
      dimensions: [],
      contract_link: 0,
      contract_link_name: '',
      company: 'ТДВ',
      select: [],
      client_requirements: {
        bag_name: '',
        weight_kg: '',
        mf_water: '',
        mf_ash: '',
        mf_evaporable: '',
        mf_not_evaporable_carbon: '',
        main_faction: '',
        granulation_lt5: '',
        granulation_lt10: '',
        granulation_lt20: '',
        granulation_lt25: '',
        granulation_lt40: '',
        granulation_mt20: '',
        granulation_mt60: '',
        granulation_mt80: '',
        appearance: '',
        color: '',
        density: '',
        mf_basic: '',
        mf_ethanol: '',
        mf_acids: '',
        mf_not_evaporable_residue: '',
        smell: '',
        color_APHA: '',
        dry_residue: '',
        mf_ethanol_ppm: '',
        methanol_ppm: '',
        isopropanol_ppm: '',
        benzol_ppm: '',
        toluene_ppm: '',
        ethylmethyl_ketone_ppm: '',
        other_identified_impurities_ppm: '',
        unidentified_impurities_ppm: '',
        brand_of_resin: '',
        mf_dry_residue: '',
        mf_free_formaldehyde: '',
        conditional_viscosity: '',
        hydrogen_ions: '',
        gelatinization_time: '',
        miscibility_with_water: '',
        warranty_period: '',
        TU: ''
      }
    };
  },
  clean_client_requirements: () => {
    newDocStore.new_document.client_requirements = {
      bag_name: '',
      weight_kg: '',
      mf_water: '',
      mf_ash: '',
      mf_evaporable: '',
      mf_not_evaporable_carbon: '',
      main_faction: '',
      granulation_lt5: '',
      granulation_lt10: '',
      granulation_lt20: '',
      granulation_lt25: '',
      granulation_lt40: '',
      granulation_mt20: '',
      granulation_mt60: '',
      granulation_mt80: '',
      appearance: '',
      color: '',
      density: '',
      mf_basic: '',
      mf_ethanol: '',
      mf_acids: '',
      mf_not_evaporable_residue: '',
      smell: '',
      color_APHA: '',
      dry_residue: '',
      mf_ethanol_ppm: '',
      methanol_ppm: '',
      isopropanol_ppm: '',
      benzol_ppm: '',
      toluene_ppm: '',
      ethylmethyl_ketone_ppm: '',
      other_identified_impurities_ppm: '',
      unidentified_impurities_ppm: '',
      brand_of_resin: '',
      mf_dry_residue: '',
      mf_free_formaldehyde: '',
      conditional_viscosity: '',
      hydrogen_ions: '',
      gelatinization_time: '',
      miscibility_with_water: '',
      warranty_period: '',
      TU: ''
    };
  },
  areRequirementsFilled: () => {
    const cr = newDocStore.new_document.client_requirements;

    switch (newDocStore.new_document.sub_product_type_name) {
      case 'Деревне вугілля':
        if (
          cr.bag_name &&
          cr.weight_kg &&
          cr.mf_water &&
          cr.mf_ash &&
          cr.mf_evaporable &&
          cr.mf_not_evaporable_carbon &&
          cr.main_faction &&
          cr.granulation_lt5 &&
          cr.granulation_lt10 &&
          cr.granulation_lt20 &&
          cr.granulation_lt25 &&
          cr.granulation_lt40 &&
          cr.granulation_mt20 &&
          cr.granulation_mt60 &&
          cr.granulation_mt80
        )
          return true;
        break;
      case 'Деревновугільні брикети':
        if (cr.bag_name && cr.weight_kg && cr.mf_water && cr.mf_ash && cr.mf_not_evaporable_carbon && cr.granulation_lt20) return true;
        break;
      case 'ЕТА':
        if (
          cr.appearance &&
          cr.color &&
          cr.density &&
          cr.mf_basic &&
          cr.mf_ethanol &&
          cr.mf_acids &&
          cr.mf_not_evaporable_residue &&
          cr.mf_water &&
          cr.smell
        )
          return true;
        break;
      case 'КФС':
      case 'МКФС':
        if (
          cr.brand_of_resin &&
          cr.mf_dry_residue &&
          cr.mf_free_formaldehyde &&
          cr.conditional_viscosity &&
          cr.hydrogen_ions &&
          cr.gelatinization_time &&
          cr.density &&
          cr.miscibility_with_water &&
          cr.warranty_period &&
          cr.TU
        )
          return true;
        break;
    }
    return false;
  },
});

export default newDocStore;
