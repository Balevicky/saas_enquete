import React from "react";
import DepartementList from "../components/geo/DepartementList";

const DepartementPage: React.FC = () => (
  <div className="container mt-4">
    {/* <h2 className="ps-3">Departement management</h2> */}
    <DepartementList />
  </div>
);

export default DepartementPage;
