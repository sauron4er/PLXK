'use strict';
import React, {useState, useEffect} from 'react';
import VacationsTable from "accounts/templates/accounts/vacations/vacations_table";
import Vacation from "accounts/templates/accounts/vacations/vacation";

function Vacations() {
  const [vacations, setVacations] = useState([]);
  const [clickedId, setClickedId] = useState(0);

  useEffect(() => {
    setVacations(window.vacations);
  }, []);

  function onRowClick(row) {
  
  }
  
  function reloadVacations() {
  
  }

  return (
    <>
      <div className="d-flex">
        <div className='col-lg-4'>
          <VacationsTable />
        </div>
        <div className="col-lg-8">
          <Vacation id={clickedId} reloadVacations={reloadVacations} />
        </div>
      </div>
    </>
  );
}

export default Vacations;
