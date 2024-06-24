import * as React from 'react';

function Section(props) {
  return (
    <>
      <div className="text-center font-weight-bold">{props.name}</div>
    </>
  );
}

Boolean.defaultProps = {
  name: ''
};

export default Section;
