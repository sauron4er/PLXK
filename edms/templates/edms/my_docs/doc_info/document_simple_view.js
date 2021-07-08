'use strict';
import * as React from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import Info from './info';
import Path from './path';
import DocumentPrint from './document_print';
import './document.css';
import 'static/css/loader_style.css';
import 'static/css/files_uploader.css';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import { LoaderSmall } from "templates/components/loaders";

class DocumentSimpleView extends React.Component {
  state = {
    info: [],
    comment: '',
    resolutions: [],
    new_files: [],
    updated_files: [],
    deleted_files: [],
    old_files: [],
    new_path_id: '', // для повернення в компонент Resolutions і посту резолюцій
    deletable: true,
    clicked_button: '', // ід натиснутої кнопки (для модульного вікна коментарю)
    show_resolutions_area: false,
    show_aquaints_area: false,
    show_files_change_area: false,
    modal_open: false,
    comment_modal_open: false, // модальне вікно, яке просить користувача ввести коментар
    ready_for_render: true // при false рендериться loader
  };

  componentDidMount() {
    if (this.props.doc_id) this.getDoc(this.props.doc_id);
  }

  // функція для отримання з бази докладної інфи про документ
  getDoc = (doc_id) => {
    this.setState({ready_for_render: false});

    let formData = new FormData();
    formData.append('employee_seat', localStorage.getItem('my_seat'));

    axiosPostRequest('get_doc/' + doc_id + '/', formData)
      .then((response) => {
        // Отримуємо інформацію щодо конкретних видів документів
        this.setState({
          info: response,
          ready_for_render: true
        });
      })
      .catch((error) => notify(error));

    return 0;
  };

  render() {
    const {ready_for_render} = this.state;
    const {doc_id} = this.props;
  
    if (ready_for_render === true) {
      if (doc_id !== 0) {
        const {info} = this.state;
  
        return (
          <Choose>
            <When condition={info.access_granted}>
              <div className='css_main'>
                <div className='d-flex justify-content-between mr-2'>
                  <div>
                    <small>Посилання: http://plhk.com.ua/edms/my_docs/{doc_id}</small>
                    <div>Обраний документ:</div>
                  </div>
                  <div>
                    <DocumentPrint info={info} />
                  </div>
                </div>

                {/*Початкова інфа про документ:*/}
                <div className='css_border bg-light p-2 mt-2 mr-1'>
                  <Info info={info} />
                </div>

                {/*Історія документа*/}
                <Path path={info.path} onAnswerClick={this.onAnswerClick} />
                
              </div>
            </When>
            <Otherwise>
              <div>Документ № {doc_id}</div>
              <div>
                У вас немає доступу до цього документа. Зверніться до його автора, щоб він відправив вам цей документ на ознайомлення
              </div>
            </Otherwise>
          </Choose>
        );
      }  else {
        // якщо не вибрано жоден документ
        return <div> </div>;
      }
    } else {
      return (
        <LoaderSmall/>
      );
    }
  }

  static defaultProps = {
    doc: [],
    doc_id: 0,
    directSubs: [],
    removeRow: () => {},
    archived: false,
    opened_in_modal: false,
  };
}

export default DocumentSimpleView;
