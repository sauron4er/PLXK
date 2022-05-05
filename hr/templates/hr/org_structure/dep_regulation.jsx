import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';

function DepRegulation(props) {
  const [state, setState] = useSetState({});

  return (
    <div className='css_department_regulation'>
      <Choose>
        <When condition={props.files.length > 0}>
          <div className='font-weight-bold'>Положення про відділ:</div>
          <For each='file' index='file_index' of={props.files}>
            <div key={file_index}>
              <a href={'../../media/' + file.file} target='_blank'>
                {file.name}{' '}
              </a>
            </div>
          </For>
        </When>
        <Otherwise>
          <div className='font-weight-bold'>Положення про відділ не внесено в базу</div>
        </Otherwise>
      </Choose>
    </div>
  );
}

DepRegulation.defaultProps = {
  regulation_files: []
};

export default DepRegulation;
