import {store} from '@risingstack/react-easy-state';
import {getIndex} from 'templates/components/my_extras';

const counterpartyStore = store({
  type: 'provider', // , client
  edit_access: false,
  counterparty: {
    id: 0,
    name: '',
    legal_address: '',
    actual_address: '',
    country: '',
    edrpou: '',
    bank_details: '',
    contacts: '',
    added_date: '',
    scope: '',
    scope_id: '',
    author: '',
    responsible: '',
    responsible_id: '',
    product: '',
    product_id: '',
    commentary: '',
    old_bag_scheme_files: [],
    is_active: true
  },
  new_bag_scheme_files: [], // Виведено окремо, щоб не відправлялося разом з іншою інфою в post_counterparty
  scopes: [],
  employees: [],
  certificate: {
    id: -1, // -1 - Не відображається нічого, 0 - створення сертифікату.
    production_groups: '',
    certification_type_id: 0,
    certification_type: '',
    number: '',
    declaration: '',
    start: '',
    end: '',
    old_plhk_number: '',
    pauses: [{id: 0, start: '', end: ''}],
    is_active: true
  },
  certification_types: [],
  certificates: [],
  clearCertificate: () => {
    counterpartyStore.certificate = {
      id: 0,
      production_groups: '',
      certification_type_id: 0,
      certification_type: '',
      number: '',
      declaration: '',
      start: '',
      end: '',
      old_plhk_number: '',
      pauses: [],
      is_active: true
    };
  },
  changeCertificates: () => {
    const cert_index = getIndex(counterpartyStore.certificate.id, counterpartyStore.certificates);
    let certificates = [...counterpartyStore.certificates];
    if (cert_index === -1) {
      certificates.push(counterpartyStore.certificate);
    } else {
      certificates[cert_index] = counterpartyStore.certificate;
    }
    counterpartyStore.certificates = [...certificates];
  },
  changeCertificateStatus: () => {
    for (const i in counterpartyStore.certificate.pauses) {
      const pause = {...counterpartyStore.certificate.pauses[i]};
      const certificate = {...counterpartyStore.certificate};
      const today = new Date();
      const cert_start = new Date(certificate.start);
      const cert_end = new Date(certificate.end);
      const pause_start = new Date(pause.start);

      if (cert_start > today) {
        certificate.status = 'paused';
        counterpartyStore.certificate = {...certificate};
        counterpartyStore.changeCertificates();
        break;
      } else if (certificate.end !== '' && cert_end < today) {
        certificate.status = 'ended';
        counterpartyStore.certificate = {...certificate};
        counterpartyStore.changeCertificates();
        break;
      } else if (pause_start <= today) {
        const pause_end = new Date(pause.end);
        if (pause.end === '' || pause_end >= today) {
          certificate.status = 'paused';
          counterpartyStore.certificate = {...certificate};
          counterpartyStore.changeCertificates();
          break;
        }
      } else {
        certificate.status = 'ok';
        counterpartyStore.certificate = {...certificate};
        counterpartyStore.changeCertificates();
      }
    }
  }
});

export default counterpartyStore;
