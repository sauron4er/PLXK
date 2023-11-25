import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';

function DepWorkInstructions(props) {
  const [state, setState] = useSetState({});

  return (
    <If condition={props.files.length > 0}>
      <div className='css_department_regulation'>
        <div className='font-weight-bold'>Робочі інструкції:</div>
        <For each='file' index='instr_file_index' of={props.files}>
          <li key={instr_file_index}>
            <a href={'../../media/' + file.file} target='_blank'>
              {file.name}{' '}
            </a>
          </li>
        </For>
      </div>
    </If>
  );
}

DepWorkInstructions.defaultProps = {
  files: []
};

export default DepWorkInstructions;
