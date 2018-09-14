'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.min.css';

import UserTable from './user_table';
import DepTable from './dep_table';
import SeatTable from './seat_table';
import '../my_styles.css'


class HR extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
    };

    notify = (message) => toast.error(
        message,
        {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        }
    );

    render() {
        return(
            <div>

                <div className="row">
                    <div className="col-lg-4" style={{padding: 10}}>
                        <UserTable message={this.notify}/>
                    </div>
                    <div className="col-lg-4" style={{padding: 10}}>
                        <DepTable/>
                    </div>
                    <div className="col-lg-4" style={{padding: 10}}>
                        <SeatTable/>
                    </div>

                    {/*Вспливаюче повідомлення*/}
                    <ToastContainer />

                </div>
            </div>


        )
    }
}

ReactDOM.render(
    <HR/>,
    document.getElementById('hr')
);