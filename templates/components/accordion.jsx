import React, {useState} from 'react';
import 'css/accordion.css';

function Accordion(props) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className='css_accordion mb-3'>
      <div className='css_accordion_title' onClick={() => setIsActive(!isActive)}>
        <p>{props.title} </p>
        <hr />
      </div>
      {isActive && (
        <div className='css_accordion_content'>
          {props.children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
