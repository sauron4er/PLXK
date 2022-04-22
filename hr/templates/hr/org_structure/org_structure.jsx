import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/accordion.css';
import Accordion from 'templates/components/accordion';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Modal from 'react-responsive-modal';

function OrgStructure() {
  const [state, setState] = useSetState({
    departments: [...window.departments],
    deps_first_part: [],
    deps_second_part: [],
    deps_third_part: [],
    filter: '',
    modal_type: 'new_dep',
    modal_opened: false
  });

  // console.log(window.departments);

  function onFilterChange(e) {
    const filter_lc = e.target.value.toLowerCase();

    let departments = [...window.departments];
    departments = departments.filter((item) => {
      return item.name.toLowerCase().indexOf(filter_lc) !== -1;
    });
  
    console.log(departments);
  
    setState({
      filter: e.target.value,
      departments: [...departments]
    });
  }
  
  useEffect(() => {
    getListPortions()
  }, [state.departments]);

  function openModal(type) {
    setState({
      modal_type: type,
      modal_opened: true
    });
  }

  function closeModal(type) {
    setState({
      modal_type: '',
      modal_opened: false
    });
  }
  
  function getListPortions() {
    let m, n, first, second, third;
    
    m = Math.ceil(state.departments.length / 3);
    n = Math.ceil(2 * state.departments.length / 3);
    
    first = state.departments.slice(0, m);
    second = state.departments.slice(m, n);
    third = state.departments.slice(n, state.departments.length);
    
    setState({
      deps_first_part: first,
      deps_second_part: second,
      deps_third_part: third
    })
  }
  
  useEffect(() => {
    getListPortions()
  }, []);
  

  return (
    <>
      <div className='mt-1 d-flex'>
        <div>
          <SubmitButton className='btn-outline-info' text='Додати новий відділ' onClick={() => openModal('new_dep')} timeout={0} />
        </div>
        <div className='ml-auto'>
          <TextInput text={state.filter} disabled={false} placeholder='Фільтр' maxLength={100} onChange={onFilterChange} className='mt-2' />
        </div>
      </div>

      {/*<div className='css_accordion_container'>*/}
      {/*  <For each='dep' of={state.departments} index='dep_idx'>*/}
      {/*    <Accordion key={dep_idx} title={dep.name} content={dep.seats} />*/}
      {/*  </For>*/}
      {/*</div>*/}

      <div className='d-flex mb-3'>
        <div className='col-lg-4'>
          <For each='dep' of={state.deps_first_part} index='dep_idx'>
            <Accordion key={dep_idx} title={dep.name} content={dep.seats}>
              111
            </Accordion>
          </For>
        </div>
        <div className='col-lg-4'>
          <For each='dep' of={state.deps_second_part} index='dep_idx'>
            <Accordion key={dep_idx} title={dep.name} content={dep.seats}>
              111
            </Accordion>
          </For>
        </div>
        <div className='col-lg-4'>
          <For each='dep' of={state.deps_third_part} index='dep_idx'>
            <Accordion key={dep_idx} title={dep.name} content={dep.seats}>
              111
            </Accordion>
          </For>
        </div>
      </div>

      <Modal
        open={state.modal_opened}
        onClose={closeModal}
        showCloseIcon={true}
        closeOnOverlayClick={true}
        styles={{modal: {marginTop: 100}}}
      >
        123
      </Modal>
    </>
  );
}

export default OrgStructure;
