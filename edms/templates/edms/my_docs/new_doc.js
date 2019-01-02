'use strict';
import React, {Fragment} from 'react'
import axios from 'axios'
import FreeTime from './doc_forms/free_time'
import CarryOut from './doc_forms/carry_out'
import WorkNote from './doc_forms/work_note'
import Decree from './doc_forms/decree/decree'
import '../my_styles.css'

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class NewDoc extends React.Component {

    state = {
        new_doc_type: 0,
    };

    onChange = (event) => {
        if (event.target.name === 'new_doc_type') { // беремо ід посади із <select>
            this.setState({
                new_doc_type: parseInt(event.target.value),
            });
        }
    };

    // обнуляє селект при закритті модального вікна
    onCloseModal = () => {
        this.setState({
            new_doc_type: 0,
        });
    };

    render() {
        const { new_doc_type } = this.state;
        return(
            <Fragment>
                <form className="form-inline">
                    <div className="form-group mb-1">
                    <label className='font-weight-bold'>Створити новий документ:<pre> </pre></label>
                    <select className="form-control" id='new-doc-type-select' name='new_doc_type' value={new_doc_type} onChange={this.onChange}>
                        <option key={0} value={0}>---------------------</option>
                        {
                            window.new_docs.map(doc => {
                                return <option key={doc.id} value={doc.id}>{doc.description}</option>;
                            })
                        }
                    </select>
                    </div>
                </form>
                <Choose>
                    <When condition={new_doc_type === 1}>
                        <FreeTime
                            addDoc={this.props.addDoc}
                            onCloseModal={this.onCloseModal}
                        />
                    </When>
                    <When condition={new_doc_type === 2}>
                        <CarryOut
                            addDoc={this.props.addDoc}
                            onCloseModal={this.onCloseModal}
                        />
                    </When>
                    <When condition={new_doc_type === 3}>
                        <WorkNote
                            addDoc={this.props.addDoc}
                            onCloseModal={this.onCloseModal}
                            chiefs={this.props.chiefs}
                        />
                    </When>
                    <When condition={new_doc_type === 4}>
                        <Decree
                            addDoc={this.props.addDoc}
                            onCloseModal={this.onCloseModal}
                        />
                    </When>
                    <Otherwise>

                    </Otherwise>
                </Choose>
            </Fragment>
        )
    }
}

export default NewDoc;