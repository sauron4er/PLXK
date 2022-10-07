import {store} from '@risingstack/react-easy-state';
import {getIndex} from 'templates/components/my_extras';

const counterpartyLettersStore = store({
  letters: [],
  letter: {
    id: 0,
    name: '',
    text: '',
    date: '',
    counterparty_mail: '',
    comment: '',
    old_files: [],
    new_files: [],
  },
  clearLetter: () => {
    counterpartyLettersStore.letter = {
      id: 0,
      name: '',
      text: '',
      date: '',
      counterparty_mail: '',
      comment: '',
      old_files: [],
      new_files: []
    }
  }
  
});

export default counterpartyLettersStore;
