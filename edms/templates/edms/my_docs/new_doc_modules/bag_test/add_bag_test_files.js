import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';

export const addBagTestFiles = (formData) => {
  newDocStore.new_document.bag_test_fields.tech_conditions_file.map((file) => {
    formData.append('bt_tech_conditions_file', file);
  });

  newDocStore.new_document.bag_test_fields.sanitary_conclusion_tu_file.map((file) => {
    formData.append('bt_sanitary_conclusion_tu_file', file);
  });

  newDocStore.new_document.bag_test_fields.sanitary_conclusion_product_file.map((file) => {
    formData.append('bt_sanitary_conclusion_product_file', file);
  });

  newDocStore.new_document.bag_test_fields.quality_certificate_file.map((file) => {
    formData.append('bt_quality_certificate_file', file);
  });

  newDocStore.new_document.bag_test_fields.glue_certificate_file.map((file) => {
    formData.append('bt_glue_certificate_file', file);
  });

  newDocStore.new_document.bag_test_fields.paint_certificate_file.map((file) => {
    formData.append('bt_paint_certificate_file', file);
  });

  newDocStore.new_document.bag_test_fields.material_certificate_file.map((file) => {
    formData.append('bt_material_certificate_file', file);
  });

  newDocStore.new_document.bag_test_fields.sample_design_file.map((file) => {
    formData.append('bt_sample_design_file', file);
  });

  return formData;
};
