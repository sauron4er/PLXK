'use strict';
import React from 'react';
import ReactDOM from 'react-dom';


class SubDocs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                react sub_docs
            </div>
        )
    }
}

ReactDOM.render(
    <SubDocs />,
    document.getElementById('sub_docs')
);