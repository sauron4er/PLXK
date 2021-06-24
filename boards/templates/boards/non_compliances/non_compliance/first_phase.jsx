'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';
import Files from 'templates/components/form_modules/files';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {isBlankOrZero, notify} from 'templates/components/my_extras';
import Modal from 'react-responsive-modal';
import Selector from 'templates/components/form_modules/selector';
import NumberInput from 'templates/components/form_modules/number_input';
import MultiSelectorWithAxios from 'templates/components/form_modules/multi_selector_with_axios';

class NCFirstPhase extends React.Component {
  state = {
    editable: false,
    decisions_choose_modal_open: false
  };

  componentDidMount() {
    if (nonComplianceStore.non_compliance.phase < 2 && ['author', 'dep_chief', 'director'].includes(nonComplianceStore.user_role)) {
      this.setState({editable: true});
    }
  }

  onProductChange = (e) => {
    nonComplianceStore.non_compliance.product = e.id;
    nonComplianceStore.non_compliance.product_name = e.name;
  };

  onProviderChange = (e) => {
    nonComplianceStore.non_compliance.provider = e.id;
    nonComplianceStore.non_compliance.provider_name = e.name;
  };

  onIdentifiedByChange = (e) => {
    nonComplianceStore.non_compliance.identified_by = e.id;
    nonComplianceStore.non_compliance.identified_by_name = e.name;
  };

  onFilesChange = (e) => {
    nonComplianceStore.non_compliance.new_files = e.target.value;
  };

  areFirstPhaseFieldsFilled = () => {
    const first_phase_fields = {
      date_added: 'Дата',
      name: 'Назва продукції',
      product: 'Вид продукції',
      party_number: 'Номер партії',
      manufacture_date: 'Дата виготовлення',
      order_number: 'Номер замовлення',
      total_quantity: 'Кількість товару в партії',
      nc_quantity: 'Кількість невідповідного товару',
      packing_type: 'Тип фасування',
      provider: 'Постачальник',
      reason: 'Причина невідповідності',
      status: 'Статус',
      classification: 'Класифікація невідповідності',
      defect: 'Дефект',
      analysis_results: 'Результати аналізу',
      sector: 'Сектор'
    };

    for (const [key, value] of Object.entries(first_phase_fields)) {
      if (isBlankOrZero(nonComplianceStore.non_compliance[key])) {
        notify(`Заповніть поле "${value}"`);
        return false;
      }
    }

    if (isBlankOrZero(nonComplianceStore.non_compliance.new_files) && isBlankOrZero(nonComplianceStore.non_compliance.old_files)) {
      notify(`Додайте фото чи документи`);
      return false;
    }

    if (parseInt(nonComplianceStore.non_compliance.nc_quantity) > parseInt(nonComplianceStore.non_compliance.total_quantity)) {
      notify(`Кількість невідповідного товару не може бути більшою за загальну кількість товару.`);
      return false;
    }

    return true;
  };

  postNonCompliance = () => {
    if (this.areFirstPhaseFieldsFilled()) {
      let formData = new FormData();
      formData.append('non_compliance', JSON.stringify(nonComplianceStore.non_compliance));
      if (nonComplianceStore.non_compliance.new_files?.length > 0) {
        nonComplianceStore.non_compliance.new_files.map((file) => {
          formData.append('new_files', file);
        });
      }

      axiosPostRequest('post_non_compliance', formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => notify(error));
    }
  };

  openDecisionsModal = () => {
    this.setState({decisions_choose_modal_open: true});
  };

  postDepChiefApproval = (approved) => {
    const {id, decisions} = nonComplianceStore.non_compliance;

    let formData = new FormData();
    formData.append('nc_id', id);
    formData.append('approved', approved);
    formData.append('decisions', decisions ? JSON.stringify(decisions) : JSON.stringify([]));

    axiosPostRequest('dep_chief_approval', formData)
      .then((response) => {
        // nonComplianceStore.non_compliance.dep_chief_approved = approved;
        // this.setState({decisions_choose_modal_open: false});
        location.reload();
      })
      .catch((error) => notify(error));
  };

  onCloseModal = () => {
    this.setState({decisions_choose_modal_open: false});
  };

  getNcPercentage = () => {
    const {total_quantity, nc_quantity} = nonComplianceStore.non_compliance;
    let percentage = '';

    if (nc_quantity && total_quantity) {
      percentage =
        (parseInt(nonComplianceStore.non_compliance.nc_quantity) / parseInt(nonComplianceStore.non_compliance.total_quantity)) * 100;
      percentage = +percentage.toFixed(1);
    }
    return percentage;
  };

  onAcquaintsChange = (list) => {
    nonComplianceStore.non_compliance.decisions = list;
  };

  render() {
    const {non_compliance, onFormChange, user_role} = nonComplianceStore;
    const {editable, decisions_choose_modal_open} = this.state;

    return (
      <div>
        <NCRow>
          <div className='col-lg-9 align-content-start p-0'>
            <NCRow>
              <NCItem cols='3' className='d-flex'>
                <DateInput
                  fieldName='Дата'
                  date={non_compliance.date_added}
                  disabled={!editable}
                  onChange={(e) => onFormChange(e, 'date_added')}
                />
              </NCItem>
              <NCItem cols='4'>
                <TextInput
                  fieldName='Назва продукції'
                  text={non_compliance.name}
                  maxLength={100}
                  disabled={!editable}
                  onChange={(e) => onFormChange(e, 'name')}
                />
              </NCItem>
              <NCItem cols='5'>
                Пірозділ-ініціатор:
                <div className='font-weight-bold'>{non_compliance.department_name}</div>
              </NCItem>
            </NCRow>
            <NCRow>
              <NCItem cols='4'>
                <SelectorWithFilterAndAxios
                  listNameForUrl='products'
                  fieldName='Вид продукції'
                  selectId='product_select'
                  value={{name: non_compliance.product_name, id: non_compliance.product}}
                  onChange={this.onProductChange}
                  disabled={!editable}
                />
              </NCItem>
              <NCItem cols='4'>
                <TextInput
                  fieldName='Номер партії'
                  text={non_compliance.party_number}
                  maxLength={10}
                  disabled={!editable}
                  onChange={(e) => onFormChange(e, 'party_number')}
                />
              </NCItem>
              <NCItem cols='4' className='d-flex'>
                <DateInput
                  fieldName='Дата виготовлення'
                  date={non_compliance.manufacture_date}
                  disabled={!editable}
                  onChange={(e) => onFormChange(e, 'manufacture_date')}
                />
              </NCItem>
            </NCRow>
          </div>
          <NCItem cols='3' style={non_compliance.dep_chief_approved === '' ? {background: 'Cornsilk'} : null}>
            Віза начальника підрозділу:
            <div className='font-weight-bold'>{non_compliance.dep_chief_name}</div>
            <Choose>
              <When condition={non_compliance.dep_chief_approved === true}>
                <div className='border border-success rounded p-1 mt-1 text-center text-success font-weight-bold'>Погоджено</div>
              </When>
              <When condition={non_compliance.dep_chief_approved === false}>
                <div className='border border-danger rounded p-1 mt-1 text-center text-danger font-weight-bold'>Відмовлено</div>
              </When>
              <Otherwise>
                <If condition={non_compliance.phase === 1 && user_role === 'dep_chief'}>
                  <SubmitButton className='btn-info' text='Погодити' onClick={this.openDecisionsModal} />
                  <SubmitButton className='btn-danger ml-1' text='Відмовити' onClick={(e) => this.postDepChiefApproval(false)} />
                </If>
              </Otherwise>
            </Choose>
          </NCItem>
        </NCRow>

        <NCRow>
          <NCItem cols='2'>
            <TextInput
              fieldName='Номер замовлення'
              text={non_compliance.order_number}
              maxLength={10}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'order_number')}
            />
          </NCItem>
          <NCItem cols='2'>
            <NumberInput
              fieldName='Кількість товару в партії'
              text={non_compliance.total_quantity}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'total_quantity')}
            />
          </NCItem>
          <NCItem cols='2'>
            <NumberInput
              fieldName='Кількість невідп. товару'
              text={non_compliance.nc_quantity}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'nc_quantity')}
            />
          </NCItem>
          <NCItem cols='1'>
            <div className='text-center'>
              <small>% невідп.</small>
            </div>
            <h4 className='text-center'>{this.getNcPercentage()}</h4>
            <div></div>
          </NCItem>
          <NCItem cols='2'>
            <TextInput
              fieldName='Тип фасування'
              text={non_compliance.packing_type}
              maxLength={15}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'packing_type')}
            />
          </NCItem>
          <NCItem cols='3'>
            <SelectorWithFilterAndAxios
              listNameForUrl='providers'
              fieldName='Постачальник'
              selectId='provider_select'
              value={{name: non_compliance.provider_name, id: non_compliance.provider}}
              onChange={this.onProviderChange}
              disabled={!editable}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='6'>
            <TextInput
              fieldName='Причина невідповідності'
              text={non_compliance.reason}
              maxLength={1000}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'reason')}
            />
          </NCItem>
          <NCItem cols='3'>
            <Selector
              list={[
                {id: 0, name: 'Не відповідає вимогам'},
                {id: 1, name: 'Карантин'},
                {id: 2, name: 'Допущено в роботу'},
                {id: 3, name: 'Інше'}
              ]}
              fieldName='Статус'
              valueField='name'
              selectId='status_select'
              selectedName={non_compliance.status}
              onChange={(e) => onFormChange(e, 'status')}
              disabled={!editable}
            />
          </NCItem>
          <NCItem cols='3'>
            <Files
              oldFiles={non_compliance.old_files}
              newFiles={non_compliance.new_files}
              fieldName='Фото чи документи'
              onChange={this.onFilesChange}
              onDelete={() => {}} // TODO зробити onDelete
              disabled={!editable}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='3'>
            <TextInput
              fieldName='Класифікація невідповідності'
              text={non_compliance.classification}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'classification')}
            />
          </NCItem>
          <NCItem cols='3'>
            <TextInput
              fieldName='Дефект'
              text={non_compliance.defect}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'defect')}
            />
          </NCItem>
          <NCItem cols='3'>
            <TextInput
              fieldName='Результати аналізу'
              text={non_compliance.analysis_results}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'analysis_results')}
            />
          </NCItem>
          <NCItem cols='3'>
            <TextInput
              fieldName='Сектор'
              text={non_compliance.sector}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'sector')}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols={9}>
            <small>Замітка: у випадку фасованого продукту, завершення виробництва та надання статусу «Карантин»</small>
            <div className='mb-1'>
              <small>
                Артикули: перевірити необхідність вважати залишок партії невідповідною – надати взірці та етикетки від постачальника
              </small>
            </div>
          </NCItem>
          <If condition={non_compliance.phase > 0}>
            <NCItem cols={3}>
              <div>Автор:</div>
              <div className='font-italic'>{non_compliance.author_name}</div>
            </NCItem>
          </If>
        </NCRow>
        <If condition={non_compliance.phase < 2 && ['author', 'dep_chief'].includes(user_role)}>
          <NCRow>
            <NCItem>
              <SubmitButton className='btn-info' text='Зберегти' onClick={this.postNonCompliance} />
            </NCItem>
          </NCRow>
        </If>
        <Modal
          open={decisions_choose_modal_open}
          onClose={this.onCloseModal}
          showCloseIcon={false}
          closeOnOverlayClick={false}
          styles={{modal: {marginTop: 50}}}
        >
          Оберіть список працівників, які повинні вирішити подальшу роботу з невідповідністю.
          <MultiSelectorWithAxios listNameForUrl='employees' onChange={this.onAcquaintsChange} disabled={!editable} />
          <If condition={non_compliance.decisions.length > 0}>
            <SubmitButton className='btn-info' text='Зберегти' onClick={(e) => this.postDepChiefApproval(true)} />
          </If>
        </Modal>
      </div>
    );
  }
}

export default view(NCFirstPhase);
