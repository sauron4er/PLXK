import * as React from 'react';
import {faPlus, faTimes, faSave} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import 'react-datetime/css/react-datetime.css';
import Datetime from 'react-datetime';
import moment from 'moment';
import 'moment/locale/uk';
import {notify} from 'templates/components/my_extras';
import {axiosPostRequest} from 'templates/components/axios_requests';

class FoyerRanges extends React.Component {
  state = {
    ranges: [],
    datetime_fields_rearranged: false
  };

  componentDidMount() {
    const {ranges} = this.props;
    if (ranges.length > 0) {
      const rearranged_ranges = ranges.map((range) => this.rearrangeDatetime(range));
      this.setState({
        ranges: rearranged_ranges,
        datetime_fields_rearranged: true
      });
    }
  }

  rearrangeDatetime = (range) => {
    range.out = new Date(range.out);
    range.in = new Date(range.in);
    return range;
  };

  rangeIsRight = (range) => {
    if (range.out === 'invalid' || range.in === 'invalid') {
      notify('Будь ласка, правильно заповніть поля входу/виходу');
      return false;
    }
    if (range.out !== '' && range.in !== '') {
      if ([1, 2].includes(this.props.doc_type_version && range.out >= range.in)) {
        // 1,2 - звільнююча
        notify('Час повернення не може бути меншим за час виходу.');
      return false;
      } else if ([3, 4].includes(this.props.doc_type_version) && range.in >= range.out) {
        // 3,4 - тимчасова, забув
        notify('Час виходу не може бути меншим за час входу.');
      return false;
      }
    }
    return true;
  };

  onOutChange = (e, index) => {
    const {ranges} = this.state;

    if (e instanceof moment && moment(e).isValid()) ranges[index].out = e.toDate();
    else ranges[index].out = 'invalid';

    ranges[index].saved = false;

    this.setState({ranges});
  };

  onInChange = (e, index) => {
    const {ranges} = this.state;

    if (e instanceof moment && moment(e).isValid()) ranges[index].in = e.toDate();
    else ranges[index].in = 'invalid';

    ranges[index].saved = false;

    this.setState({ranges});
  };

  addRange = (e) => {
    const ranges = [...this.state.ranges];
    ranges.push({out: '', in: '', saved: false});
    this.setState({ranges: [...ranges]});
  };

  delRange = (e, index) => {
    axiosPostRequest(`del_foyer_range/${this.state.ranges[index].id}`)
      .then((response) => {
        const ranges = [...this.state.ranges];
        ranges.splice(index, 1);
        this.setState({ranges: [...ranges]});
      })
      .catch((error) => {
        notify(error);
      });
  };

  saveRange = (e, index) => {
    if (this.rangeIsRight(this.state.ranges[index])) {
      let formData = new FormData();
      formData.append('range', JSON.stringify(this.state.ranges[index]));
      formData.append('doc_id', this.props.doc_id);
      formData.append('queue', this.props.queue);

      axiosPostRequest(`save_foyer_range`, formData)
        .then((response) => {
          const ranges = [...this.state.ranges];
          ranges[index].saved = true;
          ranges[index].id = response;
          this.setState({ranges: [...ranges]});
        })
        .catch((error) => {
          notify(error);
        });
    }
  };

  render() {
    const {ranges} = this.state;
    const {doc_type_version, editable} = this.props;
  
    if (editable) {
      return (
        <div className='mt-1'>
          День, час входу/виходу:
          <For each='time' of={ranges} index='index'>
            <div className='d-flex mt-1' key={index}>
              <Choose>
                <When condition={[1, 2].includes(doc_type_version)}>
                  {/*1, 2 - Звільнююча*/}
                  <span className='mr-1 font-weight-bold'>Вихід:</span>
                  <Datetime onChange={(e) => this.onOutChange(e, index)} value={ranges[index].out} />
                  <span className='mx-1'>Вхід:</span>
                  <Datetime onChange={(e) => this.onInChange(e, index)} value={ranges[index].in} />
                </When>
                <Otherwise>
                  {/*3, 4 - Забув, тимчасова*/}
                  <span className='mr-1'>Вхід:</span>
                  <Datetime onChange={(e) => this.onInChange(e, index)} value={ranges[index].in} />
                  <span className='mx-1 font-weight-bold'>Вихід:</span>
                  <Datetime onChange={(e) => this.onOutChange(e, index)} value={ranges[index].out} />
                </Otherwise>
              </Choose>
              <If condition={!time.saved}>
                <button id={index} onClick={(e) => this.saveRange(e, index)} className='btn btn-sm btn-outline-secondary ml-1'>
                  <FontAwesomeIcon icon={faSave} />
                </button>
              </If>
              <If condition={ranges.length > 1}>
                <button id={index} onClick={(e) => this.delRange(e, index)} className='btn btn-sm btn-outline-secondary ml-1'>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </If>
              <If condition={index === ranges.length - 1}>
                <button onClick={this.addRange} className='btn btn-sm btn-outline-secondary ml-1'>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </If>
            </div>
          </For>
        </div>
      );
    } else {
      return (
        <div className='mt-1'>
          День, час входу/виходу:
          <For each='time' of={ranges} index='index'>
            <div className='d-flex' key={index}>
              <Choose>
                <When condition={[1, 2].includes(doc_type_version)}>
                  {/*1, 2 - Звільнююча*/}
                  <div>
                    Вихід: <span className='css_note_text ml-1 mr-2'>{ranges[index].out_text}</span>
                  </div>
                  <div>
                    Вхід: <span className='css_note_text ml-1 mr-2'>{ranges[index].in_text}</span>
                  </div>
                </When>
                <Otherwise>
                  {/*3, 4 - Забув, тимчасова*/}
                  <div>
                    Вхід: <span className='css_note_text ml-1 mr-2'>{ranges[index].in_text}</span>
                  </div>
                  <div>
                    Вихід: <span className='css_note_text ml-1 mr-2'>{ranges[index].out_text}</span>
                  </div>
                </Otherwise>
              </Choose>
            </div>
          </For>
        </div>
      );
    }
  }

  static defaultProps = {
    ranges: [],
    doc_id: 0,
    queue: 0,
    doc_type_version: 0,
    editable: false
  };
}

export default FoyerRanges;
