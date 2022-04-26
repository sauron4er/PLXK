import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import Seat from "hr/templates/hr/org_structure/seat";

function Department(props) {
  const [state, setState] = useSetState({
  
  });
  

  return (
    <>
      <For each='seat' of={props.dep.seats} index='seat_idx'>
        <Seat key={seat_idx} id={seat.id} is_chief={seat.is_chief} name={seat.name} />
      </For>
    </>
  );
}

export default Department;
