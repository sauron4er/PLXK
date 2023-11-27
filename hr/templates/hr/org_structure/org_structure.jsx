import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/accordion.css';
import Accordion from 'templates/components/accordion';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Modal from 'react-responsive-modal';
import Department from 'hr/templates/hr/org_structure/department';
import NewDepartment from 'hr/templates/hr/org_structure/new_department';
import CompanyChoose from "templates/components/form_modules/company_choose";

function OrgStructure() {
  const [state, setState] = useSetState({
    departments: [...window.departments],
    deps_first_part: [],
    deps_second_part: [],
    deps_third_part: [],
    filter: '',
    modal_opened: false,
    company: 'ТДВ'
  });

  //TODO Деактивація відділу
  //TODO Додавання посади
  //TODO Деакт. посади (якщо нема працівників)
  //TODO Перегляд положення про відділ
  //TODO Перегляд інструкції посади
  //TODO Перегляд працівників на посаді

  
  useEffect(() => {
    getListPortions();
  }, [state.departments]);
  
  useEffect(() => {
    getListPortions();
  }, []);
  
  useEffect(() => {
    filterList(state.filter);
  }, [state.company]);
  
  useEffect(() => {
    filterList(state.filter);
  }, [state.filter]);
  

  function filterList(filter_string) {
    const departments = [...window.departments];
    
    const departments_filtered_by_company = departments.filter(item => {
      return item.company === state.company
    })
    
    const departments_filtered = departments_filtered_by_company.filter((item) => {
      return item.name.toLowerCase().indexOf(filter_string) !== -1;
    });

    setState({
      departments: [...departments_filtered]
    });
  }

  function openModal() {
    setState({modal_opened: true});
  }

  function closeModal() {
    setState({modal_opened: false});
  }

  function getListPortions() {
    let m, n, first, second, third;

    m = Math.ceil(state.departments.length / 3);
    n = Math.ceil((2 * state.departments.length) / 3);

    first = state.departments.slice(0, m);
    second = state.departments.slice(m, n);
    third = state.departments.slice(n, state.departments.length);

    setState({
      deps_first_part: first,
      deps_second_part: second,
      deps_third_part: third
    });
  }

  function onCompanyChange(company) {
    setState({company});
  }
  
  function onFilterChange(e) {
    setState({filter: e.target.value.toLowerCase()});
  }

  return (
    <>
      <div className='mt-1 d-flex'>
        {/*<If condition={window.edit_enabled}>*/}
        {/*  <SubmitButton className='btn-outline-info' text='Додати новий відділ' onClick={openModal} timeout={0} />*/}
        {/*</If>*/}
        <div className='d-flex mt-2 w-100'>
          <SubmitButton className='btn-outline-primary ml-2' onClick={openModal} text='Додати відділ' />
          <div className='ml-auto'>
            <CompanyChoose fieldName='Підприємство' onChange={onCompanyChange} company={state.company} both={true} id='org_str' />
          </div>
          <div className='ml-auto'>
            <TextInput
              text={state.filter}
              disabled={false}
              placeholder='Фільтр'
              maxLength={100}
              onChange={e => onFilterChange(e)}
            />
          </div>
        </div>
      </div>

      <div className='d-flex mb-3'>
        <div className='col-lg-4'>
          <For each='dep' of={state.deps_first_part} index='dep_idx'>
            <Accordion key={dep_idx} title={dep.name} content={dep.seats}>
              <Department dep={dep} />
            </Accordion>
          </For>
        </div>
        <div className='col-lg-4'>
          <For each='dep' of={state.deps_second_part} index='dep_idx'>
            <Accordion key={dep_idx} title={dep.name} content={dep.seats}>
              <Department dep={dep} />
            </Accordion>
          </For>
        </div>
        <div className='col-lg-4'>
          <For each='dep' of={state.deps_third_part} index='dep_idx'>
            <Accordion key={dep_idx} title={dep.name} content={dep.seats}>
              <Department dep={dep} />
            </Accordion>
          </For>
        </div>
      </div>

      <Modal
        open={state.modal_opened}
        onClose={closeModal}
        showCloseIcon={true}
        closeOnOverlayClick={true}
        styles={{modal: {marginTop: 100, width: '500px'}}}
      >
        <NewDepartment />
      </Modal>
    </>
  );
}

export default OrgStructure;
