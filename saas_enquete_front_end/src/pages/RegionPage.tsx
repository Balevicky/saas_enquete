import React from "react";
import RegionList from "../components/geo/RegionList";

const RegionPage: React.FC = () => (
  <div className="container mt-4">
    {/* <h2 className="ps-3">Region management</h2> */}
    <RegionList />
  </div>
);

export default RegionPage;
