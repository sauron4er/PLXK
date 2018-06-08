'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {GridForm, Fieldset, Row, Field} from 'react-gridforms'

class MyDocs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                <button type="button" className="btn btn-outline-secondary mb-1" data-toggle="modal" data-target="#modalNewFreePass" id="button_new_free_pass">Створити звільнюючу</button>

                {/*форма нової звільнюючої:*/}
                <div className="container">
                  <div className="modal fade" id="modalNewFreePass">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                      <div className="modal-content">


                        <div className="modal-header">
                          <h4 className="modal-title">Нова звільнююча</h4>
                          <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>


                        <div className="modal-body">
                            <GridForm>
                              <Fieldset legend="Add to inventory">
                                <Row>
                                  <Field span={3}>
                                    <label>Product Name</label>
                                    <input type="text" autoFocus/>
                                  </Field>
                                  <Field>
                                    <label>Tags</label>
                                    <input type="text"/>
                                  </Field>
                                </Row>
                              </Fieldset>
                            </GridForm>
                        </div>


                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" data-dismiss="modal">Відміна</button>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
            </div>



        )
    }
}

ReactDOM.render(
    <MyDocs />,
    document.getElementById('my_docs')
);