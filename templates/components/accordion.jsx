import React, {useState} from 'react';
import 'css/accordion.css';

const Accordion = ({title, content}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className='css_accordion mb-3'>
      <div className='css_accordion_title' onClick={() => setIsActive(!isActive)}>
        <p>{title} </p>
        <hr />
      </div>
      {isActive && (
        <div className='css_accordion_content'>
          {this.props.children}
          {/*<For each='item' of={content} index='item_idx'>*/}
          {/*  <div key={item_idx} className='css_accordion_content_item'>*/}
          {/*    <span className={item.chief ? "font-weight-bold" : null} key={1}>{item.name}</span>*/}
          {/*    <span key={2} className='css_accordion_content_item_arrow'>*/}
          {/*      >*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*</For>*/}
        </div>
      )}
    </div>
  );
};

export default Accordion;
