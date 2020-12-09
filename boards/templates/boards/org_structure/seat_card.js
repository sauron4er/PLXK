import * as React from 'react';
import {LoaderSmall} from 'templates/components/loaders';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import {view, store} from '@risingstack/react-easy-state';
import orgStructureStore from './org_structure_store';

class SeatCard extends React.Component {
  state = {
    info_loaded: false,
    seat: '',
    old_file: null,
    is_dep_chief: false,
    new_file: []
  };

  componentDidMount() {
    this.getSeatInfo();
  }

  getSeatInfo = () => {
    axiosGetRequest('get_seat_info/' + orgStructureStore.clicked_seat_id + '/')
      .then((response) => {
        this.setState({
          seat: response.seat,
          old_file: response.old_file,
          is_dep_chief: response.is_dep_chief,
          info_loaded: true
        });
      })
      .catch((error) => notify(error));
  };

  onFileChange = (e) => {
    this.setState({new_file: e.target.value});
  };

  postInstruction = () => {
    const {new_file} = this.state;
    const {clicked_seat_id} = orgStructureStore;
    if (new_file) {
      let formData = new FormData();
      formData.append('seat_id', clicked_seat_id);
      formData.append('instructions_file', new_file[0]);
      axiosPostRequest('post_instruction/', formData)
        .then((response) => {})
        .catch((error) => notify(error));
    }
  };

  render() {
    const {seat, info_loaded, old_file, new_file, is_dep_chief} = this.state;
    

    if (old_file) {
      const arr = old_file.split('/');
      const last_href_piece = arr[arr.length - 1];
    }

    return (
      <div style={{width: 400}}>
        <Choose>
          <When condition={info_loaded}>
            <h5>{seat}</h5>
            <If condition={is_dep_chief}>
              <div>Керівник відділу</div>
            </If>
            <hr />
            <Choose>
              <When condition={old_file}>
                <a href={'../../media/' + old_file} target='_blank'>
                  {/*{old_file.split('/').slice(-1)[0]}*/}
                  Посадова інструкція
                </a>
                <button className='float-sm-right btn btn-sm btn-outline-info' onClick={() => this.setState({old_file: ''})}>
                  Замінити
                </button>
              </When>
              <Otherwise>
                <div>Додати посадову інструкцію:</div>
                <FilesUpload onChange={this.onFileChange} files={new_file} fieldName={''} multiple={false} />
                <button className='float-sm-right btn btn-sm btn-info' onClick={this.postInstruction}>
                  Зберегти
                </button>
              </Otherwise>
            </Choose>
            <hr />
          </When>
          <Otherwise>
            <LoaderSmall />
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

export default view(SeatCard);
