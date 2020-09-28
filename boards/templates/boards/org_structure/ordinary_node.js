import React, { memo } from 'react';

export default memo(({ data }) => {
  console.log(data);
  return (
    <div className='border border-dark rounded p-2'>
      <div>{data.label}</div>
    </div>
  );
});