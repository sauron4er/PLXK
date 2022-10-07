'use strict';
import React, {useState, useEffect} from 'react';

function Vacations() {
  const [vacations, setVacations] = useState([]);

  useEffect(() => {
    setVacations(window.vacations);
  }, []);

  function onRowClick(row) {}

  return (
    <>
      <h2>Мої відпустки</h2>
    </>
  );
}

export default Vacations;
