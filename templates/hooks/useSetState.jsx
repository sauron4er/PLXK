import React, {useState} from 'react';

function useSetState(props_state) {
  const [state, setState] = useState({...props_state});

  function setMultipleState(newState) {
    setState((prevState) => ({
      ...prevState,
      ...newState
    }));
  }

  return [state, setMultipleState]
}

export default useSetState;