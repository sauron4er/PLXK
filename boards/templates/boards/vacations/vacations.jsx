'use strict';
import React, {useState, useEffect} from 'react';
import VacationsTable from "boards/templates/boards/vacations/vacations_table";
import Vacation from "boards/templates/boards/vacations/vacation";

function Vacations() {
  const [vacations, setVacations] = useState([]);

  useEffect(() => {
    setVacations(window.vacations);
  }, []);

  function onRowClick(row) {
  
  }

  return (
    <>
      <h4 className='text-center'>Мої відпустки</h4>
      <hr/>
      <div className="d-flex">
        <div className='col-lg-4'>
          <VacationsTable />
        </div>
        <div className="col-lg-8">
          <Vacation />
        </div>
      </div>
    </>
  );
}

export default Vacations;
