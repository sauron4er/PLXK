'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from './doc_info_modules/doc_info_store';

class Buttons extends React.Component {
  // отримує інформацію про документ в масиві info та створює відповідні кнопки для doc_info

  onClick = (mark_id) => {
    docInfoStore.button_clicked = true;
    this.props.onClick(mark_id);
  };

  render() {
    const {info, isChief, deletable, archived} = this.props;
    const user_is_doc_responsible = info.responsible_seat_id === parseInt(localStorage.getItem('my_seat'));
    const {button_clicked} = docInfoStore;

    return (
      <>
        {/*Якщо є очікувана позначка:*/}
        <If condition={info.expected_mark}>
          {/* Дивимось, яку позначку очікує flow і показуємо відповідні кнопки */}
          <Choose>
            <When condition={info.expected_mark === 6}>
              {/* Не заперечую */}
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(6)} disabled={button_clicked}>
                Не заперечую
              </button>
              <If condition={!user_is_doc_responsible}>
                <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(3)} disabled={button_clicked}>
                  Відмовити
                </button>
              </If>
            </When>
            <When condition={info.expected_mark === 2}>
              {/* Погоджую */}
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(2)} disabled={button_clicked}>
                Погодити
              </button>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(3)} disabled={button_clicked}>
                {info.meta_type_id === 5 ? 'Запит на зміни' : 'Відмовити'}
              </button>
            </When>
            <When condition={info.expected_mark === 8}>
              {/* Ознайомлений */}
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(8)} disabled={button_clicked}>
                Ознайомлений
              </button>
            </When>
            <When condition={info.expected_mark === 11}>
              {/* Виконано */}
              <If condition={info.stage !== 'in work'}>
                <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(23)} disabled={button_clicked}>
                  Взяти в роботу
                </button>
              </If>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(11)} disabled={button_clicked}>
                Виконано
              </button>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(3)} disabled={button_clicked}>
                Відмовити
              </button>
              {/*<If condition={isChief === true}>*/}
              {/*  /!* Якщо є підлеглі - додаємо резолюції *!/*/}
              {/*  <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(10)} disabled={button_clicked}>*/}
              {/*    Резолюція*/}
              {/*  </button>*/}
              {/*</If>*/}
            </When>
            <When condition={info.expected_mark === 17}>
              {/* Віза */}
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(17)} disabled={button_clicked}>
                Візувати
              </button>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(3)} disabled={button_clicked}>
                {info.meta_type_id === 5 ? 'Запит на зміни' : 'Відмовити'}
              </button>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(25)} disabled={button_clicked}>
                Делегувати
              </button>
            </When>
            <When condition={info.expected_mark === 22}>
              {/* Скани підписаних документів */}
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(22)} disabled={button_clicked}>
                Додати скан-копії підписаних документів
              </button>
            </When>
            <When condition={info.expected_mark === 23}>
              {/* Договір взято у роботу */}
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(23)} disabled={button_clicked}>
                Взяти договір у роботу
              </button>
            </When>
            <When condition={info.expected_mark === 24}>
              {/* Підтвердження */}
              <Choose>
                <When condition={this.props.info.meta_type_id === 1}>
                  <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(24)} disabled={button_clicked}>
                    Підтвердити
                  </button>
                </When>
                <Otherwise>
                  <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(24)} disabled={button_clicked}>
                    Підтвердити виконання
                  </button>
                  <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(5)} disabled={button_clicked}>
                    На доопрацювання
                  </button>
                </Otherwise>
              </Choose>
            </When>
            <When condition={info.expected_mark === 27}>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(27)} disabled={button_clicked}>
                Зареєструвати
              </button>
            </When>
          </Choose>
        </If>

        <If condition={info.user_is_super_manager}>
          <If condition={!['done', 'confirm', 'denied'].includes(info?.stage)}>
            <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(11)} disabled={button_clicked}>
              Виконано
            </button>
            <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(3)} disabled={button_clicked}>
              Відмовити
            </button>
            <If condition={info?.stage != 'in work'}>
              <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(23)} disabled={button_clicked}>
                Взяти в роботу
              </button>
            </If>
          </If>
        </If>

        {/*Якщо це погоджений тендер, додаємо кнопку "Створити договір"*/}
        <If condition={info.meta_type_id === 9 && info.approved}>
          <button
            type='button'
            className='btn btn-secondary mr-1 mb-1'
            onClick={() => (docInfoStore.view = 'new_contract')}
            disabled={button_clicked}
          >
            Створити Договір
          </button>
        </If>

        {/*Якщо автор я - нова перевірка по ід користувача, а не людинопосади*/}
        {/*Якщо документ погоджено, його можна деактивувати (забрати позначку "Погоджено" - для is_deactivatable)*/}
        <If condition={info.is_deactivatable && info.viewer_is_author && info.approved}>
          <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(26)} disabled={button_clicked}>
            Деактивувати
          </button>
        </If>

        {/* Якщо автор я */}
        <If condition={user_is_doc_responsible}>
          {/*Якщо тип документа редагуємий*/}
          <If condition={docInfoStore?.info?.approved === false && docInfoStore?.info?.is_changeable && !info.archived}>
            <button
              type='button'
              className='btn btn-secondary mr-1 mb-1'
              onClick={() => (docInfoStore.view = 'new_document')}
              disabled={button_clicked}
            >
              Створити новий документ на основі цього
            </button>
          </If>
          {/* Якщо ніхто не встиг відреагувати (або це Договір) - можна видалити документ */}
          <If condition={deletable === true}>
            <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(13)} disabled={button_clicked}>
              Видалити
            </button>
          </If>
          {/* Додаємо кнопку Закрити */}
          <If condition={!archived && !info.archived}>
            {/*!archived - отримуємо з пропс, info.archived отримуємо з сервера, коли напряму шукаємо документ*/}
            <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(7)} disabled={button_clicked}>
              В архів
            </button>
          </If>
          {/* якщо це погоджений договір, додаємо кнопку "Відправити у роботу" */}
          <If condition={info.meta_type_id === 5 && docInfoStore?.info?.approved}>
            {/*!archived - отримуємо з пропс, info.archived отримуємо з сервера, коли напряму шукаємо документ*/}
            <button type='button' className='btn btn-secondary mr-1 mb-1'
                    onClick={() => this.onClick(31)}
                    disabled={button_clicked}>
              Повідомити про підписання договору
            </button>
          </If>
        </If>
        
        {/* Якщо це Договір або Тендер, додаємо кнопку "оновити файл" */}
        {/* В майбутньому переробити на перевірку використання модуля approvals і редагуємого поля Файли */}
        <If condition={[5, 9].includes(info.meta_type_id) && !archived && !info.archived}>
          <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(18)} disabled={button_clicked}>
            Додати/оновити файл(и)
          </button>
        </If>
        {/* Кнопки "коментар", "на ознайомлення" та "файл" є завжди */}
        <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(4)} disabled={button_clicked}>
          Коментар
        </button>
        <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(15)} disabled={button_clicked}>
          На ознайомлення
        </button>
        <If condition={info.meta_type_id === 12}>
          <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(28)} disabled={button_clicked}>
            На погодження
          </button>
        </If>
        <button type='button' className='btn btn-secondary mr-1 mb-1' onClick={() => this.onClick(12)} disabled={button_clicked}>
          Додати файл
        </button>
      </>
    );
  }

  static defaultProps = {
    isChief: false,
    deletable: false,
    onClick: () => {},
    info: [],
    archived: false
  };
}

export default view(Buttons);
