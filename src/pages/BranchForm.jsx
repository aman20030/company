import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./BranchForm.css";
import Select from "react-select";
import axios from "axios";

export default function BranchForm({ onAddBranch }) {
  const [branchData, setBranchData] = useState({
    branchName: "",
    branchPOC: "",
    phone: "",
    address: "",
    geoLocation: "",
     city: "",
    storePhone: "",
    apis: [{ apiName: "", apiUrl: "" }],
  });
  const [cityOptions, setCityOptions] = useState([]);
  useEffect(() => {
    axios
      .post("https://countriesnow.space/api/v0.1/countries/cities", {
        country: "India",
      })
      .then((res) => {
        setCityOptions(
          res.data.data.map((city) => ({ label: city, value: city }))
        );
      })
      .catch((err) => console.error("City fetch error:", err));
  }, []);
  const handleChange = (e) => {
  const { name, value } = e.target;

  // ✅ Only alphabets & spaces allowed for branchName, branchPOC & city
  if (["branchName", "branchPOC", "city"].includes(name) && !/^[a-zA-Z\s]*$/.test(value)) {
    return;
  }
   if (name === "geoLocation" && !/^[0-9.,]*$/.test(value)) {
    return;
  }

  setBranchData({ ...branchData, [name]: value });
};

  const handlePhoneChange = (value) => {
    setBranchData({ ...branchData, phone: value });
  };

  const handleStorePhoneChange = (value) => {
    setBranchData({ ...branchData, storePhone: value });
  };

  // API fields handlers
  const handleApiChange = (index, field, value) => {
    const newApis = [...branchData.apis];
    newApis[index][field] = value;
    setBranchData({ ...branchData, apis: newApis });
  };

  const addNewApi = () => {
    setBranchData({
      ...branchData,
      apis: [...branchData.apis, { apiName: "", apiUrl: "" }],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddBranch(branchData);
    handleClear(); // ✅ submit ke baad form reset
  };
  const handleClear = () => {
  setBranchData({
    branchName: "",
    branchPOC: "",
    phone: "",
    address: "",
    geoLocation: "",
    city: "",
    storePhone: "",
    apis: [{ apiName: "", apiUrl: "" }],
  });
};
  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3 className="form-title">Add a Branch:</h3>

      {/* Row 1 */}
      <div className="form-row-3">
        <input
          type="text"
          name="branchName"
          placeholder="Branch Name"
          value={branchData.branchName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="branchPOC"
          placeholder="Branch POC"
          value={branchData.branchPOC}
          onChange={handleChange}
        />
        <PhoneInput
          country={"in"}
          placeholder="Phone Number"
          value={branchData.phone}
          onChange={handlePhoneChange}
          inputClass="phone-field"
        />
      </div>

      {/* Row 2 */}
      <div className="form-row-2">
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={branchData.address}
          onChange={handleChange}
        />
        <input
          type="text"
          name="geoLocation"
          placeholder="Geo Location"
          value={branchData.geoLocation}
          onChange={handleChange}
        />
      </div> 

      
      {/* Row 3 → Address + Store Phone Number ek hi line me */}
<div className="form-row">
     <Select
          options={cityOptions}
          value={cityOptions.find((c) => c.value === branchData.city) || null}
          onChange={(option) =>
            setBranchData({ ...branchData, city: option.value })
          }
          placeholder="Select City"
          isSearchable
          className="city-dropdown"
        />
  <div className="phone-wrapper">
    <PhoneInput
      country={"in"}
      placeholder="Store Phone Number"
      value={branchData.storePhone}
      onChange={handleStorePhoneChange}
      inputClass="phone-field"
    />
  </div>
</div>

      {/* API Section */}
      {branchData.apis.map((api, index) => (
        <div className="form-row-2" key={index}>
          <input
            type="text"
            placeholder="API Name"
            value={api.apiName}
            onChange={(e) =>
              handleApiChange(index, "apiName", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Add API URL"
            value={api.apiUrl}
            onChange={(e) =>
              handleApiChange(index, "apiUrl", e.target.value)
            }
          />
        </div>
      ))}

      <button type="button" className="add-btn" onClick={addNewApi}>
        + Add New API
      </button>
      
           {/* ✅ Submit and Clear Buttons side by side */}
      <div className="button-row">
        <button
          type="submit"
          className="submit-btn"
        >
          Submit
        </button>
        <button
          type="button"
          className="clear-btn"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
      
    </form>
  );
}