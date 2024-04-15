export const addBagTestResultFiles = (formData, bag_test_results) => {

  bag_test_results.meets_dimensions_files.map((file) => {
    formData.append('meets_dimensions_files', file);
  });

  bag_test_results.meets_density_files.map((file) => {
    formData.append('meets_density_files', file);
  });

  bag_test_results.tech_conditions_are_in_certificate_files.map((file) => {
    formData.append('tech_conditions_are_in_certificate_files', file);
  });

  return formData;
};
