import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';

export const areBagTestFieldsFilled = () => {
  return true;

  const fields = newDocStore.new_document.bag_test_fields;

  if (!fields.provider ||
    !fields.client ||
    !fields.bag_type ||
    !fields.name ||
    !fields.tech_conditions_file ||
    !fields.sanitary_conclusion_tu_file ||
    !fields.sanitary_conclusion_product_file ||
    !fields.quality_certificate_file ||
    !fields.glue_certificate_file ||
    !fields.paint_certificate_file ||
    !fields.length ||
    !fields.width ||
    !fields.depth ||
    !fields.density ||
    !fields.weight ||
    !fields.material ||
    !fields.layers ||
    !fields.color ||
    !fields.deadline ||
    !fields.samples_are_available) {return false}

  if (fields.add_manual_CR) {
    return !!(fields.cr_bag_name &&
        fields.cr_weight_kg &&
        fields.cr_mf_water &&
        fields.cr_mf_ash &&
        fields.cr_mf_evaporable &&
        fields.cr_mf_not_evaporable_carbon &&
        fields.cr_main_faction &&
        fields.cr_granulation_lt5 &&
        fields.cr_granulation_lt10 &&
        fields.cr_granulation_lt20 &&
        fields.cr_granulation_lt25 &&
        fields.cr_granulation_lt40 &&
        fields.cr_granulation_mt20 &&
        fields.cr_granulation_mt60 &&
        fields.cr_granulation_mt80);
  } else {
    return !!fields.client_requirements
  }


};
