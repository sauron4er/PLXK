'use strict';
import React from 'react';

class Path extends React.Component {
    // отримує історію документа в масиві path, рендерить її для doc_info

    render() {
        if (this.props.path) {
            return <div>Історія:
                <For each='path' index='id' of={this.props.path}>
                    <div key={path.id} className="css_path p-2 my-1 mr-1">
                        <div className="d-flex justify-content-between">
                            <span className="font-weight-bold">{path.emp}</span>
                            <span>{path.time}</span>
                        </div>
                        <div>{path.seat}</div>
                        <div className="css_mark">{path.mark}</div>
                        <If condition={path.comment !== '' && path.comment !== null}>
                            <div className="text-right">Коментар:</div>
                            <div className="css_comment">{path.comment}</div>
                        </If>
                        <If condition={path.resolutions}>
                            <ol className="list-group mt-1">
                                {path.resolutions.map((res) => {
                                    return <li className="list-group-item" key={res.id}>
                                        <div className="font-italic">{res.emp}, {res.seat}</div>
                                        <div>{res.comment}</div>
                                    </li>;
                                })}
                            </ol>
                        </If>
                        <If condition={path.files.length > 0}>
                            <ol className="list-group mt-1">Файли:
                                {path.files.map((file) => {
                                    return <div key={file.id}><a href={'../../media/' + file.file}
                                                                 download>{file.name}</a></div>;
                                })}
                            </ol>
                        </If>
                    </div>
                </For>
            </div>;
        }
        else {
            return (null)
        }
    }
}

export default Path;