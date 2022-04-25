import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';
import Seat from "hr/templates/hr/org_structure/seat";

function Department(props) {
  const [state, setState] = useSetState({
  
  });
  
  //TODO Додавання відділу
  //TODO Деактивація відділу
  //TODO Додавання посади
  //TODO Деакт. посади (якщо нема працівників)
  //TODO Перегляд положення про відділ
  //TODO Перегляд інструкції посади
  //TODO Перегляд працівників
  //TODO
  //TODO
  //TODO
  //TODO

  return (
    <>
      <For each='seat' of={props.dep.seats} index='seat_idx'>
        <Seat key={seat_idx} id={seat.id} is_chief={seat.is_chief} name={seat.name} />
      </For>
    </>
  );
}

export default Department;
