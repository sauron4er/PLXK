'use strict';
import React from 'react'
import Form from "react-validation/build/form"
import Textarea from "react-validation/build/textarea"
import {required} from "../../../validations"
import {FileUploader} from "devextreme-react"
import Button from "react-validation/build/button"
import Modal from "react-awesome-modal"
import 'react-drag-list/assets/index.css'
import Articles from "./articles";
import Input from "react-validation/build/input";

class Decree extends React.Component {

    state = {
        open: true,
        name: '',
        text: '',
        files: [],
    };

    onChange = (event) => {
        this.setState({[event.target.name]:event.target.value});
    };

    newDecree = (e) => {
        e.preventDefault();
        console.log('hey!!!!');
    };

    onCloseModal = () => {
        // Передаємо вверх інфу, що модальне вікно закрите
        this.props.onCloseModal();
        this.setState({
            open: false,
        });
    };

    render() {
        return <Modal visible={this.state.open} width='45%' effect="fadeInUp" onClickAway={this.onCloseModal} >
            <div className='css_modal_scroll'>
                <Form onSubmit={this.newDecree}>
                <div className="modal-body">
                    <h4 className="modal-title">Новий проект наказу</h4>
                    <br/>
                    <label className="full_width">Назва:
                        <Textarea className="form-control full_width" value={this.state.name} name='name'
                                  onChange={this.onChange} maxLength={4000} validations={[required]}/>
                    </label> <br />
                    <label className="full_width">Преамбула:
                        <Textarea className="form-control full_width" value={this.state.text} name='text'
                                  onChange={this.onChange} maxLength={4000} validations={[required]}/>
                    </label> <br />

                    <Articles/>

                    <label className="full_width">На погодження:
                    </label> <br />
                    <label className="full_width">Додати файли:
                        <FileUploader
                            onValueChanged={(e) => this.setState({files: e.value})}
                            uploadMode='useForm'
                            multiple={true}
                            allowCanceling={true}
                            selectButtonText='Оберіть файл'
                            labelText='або перетягніть файл сюди'
                            readyToUploadMessage='Готово'
                        />
                    </label>
                </div>

                <div className="modal-footer">
                  <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
                </div>
                </Form>
            </div>
        </Modal>
    }
}

export default Decree;