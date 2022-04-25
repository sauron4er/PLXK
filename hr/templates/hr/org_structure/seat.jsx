import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';

function Seat(props) {
  const [state, setState] = useSetState({});

  return (
    <>
      <Choose>
        <When condition={props.id}>
          <div className='css_os_seat'>
            <span className={props.is_chief ? 'font-weight-bold' : null} key={1}>
              {props.name}
            </span>
            <span key={2} className='css_os_seat_arrow'>
              >
            </span>
          </div>
        </When>
        <Otherwise>
          <div className='font-weight-bold'>{props.name}</div>
        </Otherwise>
      </Choose>
    </>
  );
}

export default Seat;
