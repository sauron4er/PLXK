'use strict';
import React from 'react';

class Buttons extends React.Component {
    // отримує інформацію про документ в масиві doc та створює відповідні кнопки для doc_info

    render() {
        return <div>
            <Choose>
                {/* Якщо автор не я: */}
                <When condition={this.props.doc.author_seat_id !== parseInt(localStorage.getItem('my_seat'))}>
                    {/* Дивимось, яку позначку очікує flow і показуємо відповідні кнопки */}
                    <Choose>
                        <When condition={this.props.doc.expected_mark === 6}>{/* Не заперечую */}
                            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 6)}>Не заперечую</button>
                            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 3)}>Відмовити</button>
                            {/*<If condition={this.props.doc.type_id !== 1}>*/}
                                {/*<button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 5)}>На доопрацювання</button>*/}
                            {/*</If>*/}
                        </When>
                        <When condition={this.props.doc.expected_mark === 2}>{/* Погоджую */}
                            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 2)}>Погодити</button>
                            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 3)}>Відмовити</button>
                            {/*<If condition={this.props.doc.type_id !== 1}>*/}
                                {/*<button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 5)}>На доопрацювання</button>*/}
                            {/*</If>*/}
                            <If condition={this.props.doc.type_id === 3}>{/* Якщо це службова - додаємо резолюції */}
                                <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 10)}>Резолюція</button>
                            </If>
                        </When>
                        <When condition={this.props.doc.expected_mark === 8}>{/* Ознайомлений */}
                            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 8)}>Ознайомлений</button>
                        </When>
                        <When condition={this.props.doc.expected_mark === 11}>{/* Виконано */}
                            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 11)}>Виконано</button>
                            <If condition={this.props.is_chief === true}>{/* Якщо є підлеглі - додаємо резолюції */}
                                <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 10)}>Резолюція</button>
                            </If>
                        </When>
                    </Choose>
                </When>

                {/* Якщо автор я */}
                <Otherwise>
                    {/* Якщо ніхто не встиг відреагувати - можна видалити документ */}
                    <If condition={this.props.deletable === true}>
                        <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 13)}>Видалити</button>
                    </If>
                    {/* Додаємо кнопку Закрити */}
                    <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 7)}>Закрити</button>

                </Otherwise>
            </Choose>

            {/* Кнопки "коментар" та "файл" є завди */}
            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 4)}>Коментар</button>
            <button type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.props.onClick(e, 12)}>Файл</button>
        </div>
    }
}

export default Buttons;