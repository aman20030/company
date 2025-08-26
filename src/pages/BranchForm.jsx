import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./BranchForm.css";
import Select from "react-select";
import axios from "axios";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function BranchForm({ onAddBranch, initialData = null }) {
  const [branchData, setBranchData] = useState({
    branchName: "",
    branchPOC: "",
    phone: "",
    address: "",
    geoLocation: "",
    country: "",
    state: "",
    city: "",
    storePhone: "",
    apis: [{ apiName: "", apiUrl: "" }],
  });
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setBranchData(initialData);
      // If country is pre-selected, load states
      if (initialData.country) {
        loadStates(initialData.country);
      }
      // If state is pre-selected, load cities
      if (initialData.country && initialData.state) {
        loadCities(initialData.country, initialData.state);
      }
    }
  }, [initialData]);

  useEffect(() => {
    axios
      .get("https://countriesnow.space/api/v0.1/countries")
      .then((res) => {
        setCountryOptions(
          res.data.data.map((c) => ({ label: c.country, value: c.country }))
        );
      })
      .catch((err) => console.error("Country fetch error:", err));
  }, []);

  const loadStates = (country) => {
    axios
      .post("https://countriesnow.space/api/v0.1/countries/states", {
        country: country,
      })
      .then((res) => {
        setStateOptions(
          res.data.data.states.map((s) => ({ label: s.name, value: s.name }))
        );
      })
      .catch((err) => console.error("State fetch error:", err));
  };

  const loadCities = (country, state) => {
    axios
      .post("https://countriesnow.space/api/v0.1/countries/state/cities", {
        country: country,
        state: state,
      })
      .then((res) => {
        setCityOptions(
          res.data.data.map((city) => ({ label: city, value: city }))
        );
      })
      .catch((err) => console.error("City fetch error:", err));
  };

  useEffect(() => {
    if (!branchData.country) return;
    loadStates(branchData.country);
    setBranchData((prev) => ({ ...prev, state: "", city: "" }));
    setCityOptions([]);
  }, [branchData.country]);

  useEffect(() => {
    if (!branchData.country || !branchData.state) return;
    loadCities(branchData.country, branchData.state);
    setBranchData((prev) => ({ ...prev, city: "" }));
  }, [branchData.state, branchData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      ["branchName", "branchPOC", "country", "state", "city"].includes(name) &&
      !/^[a-zA-Z\s]*$/.test(value)
    ) {
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

  const removeApi = (index) => {
    const newApis = branchData.apis.filter((_, i) => i !== index);
    setBranchData({ ...branchData, apis: newApis });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddBranch(branchData);
    handleClear();
  };

  const handleClear = () => {
    setBranchData({
      branchName: "",
      branchPOC: "",
      phone: "",
      address: "",
      geoLocation: "",
      country: "",
      state: "",
      city: "",
      storePhone: "",
      apis: [{ apiName: "", apiUrl: "" }],
    });
    setStateOptions([]);
    setCityOptions([]);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3 className="form-title">{initialData ? "Edit Branch:" : "Add a Branch:"}</h3>

      {/* Row 1 */}
      <div className="form-row-3">
        <div className="input-group">
          <input
            type="text"
            name="branchName"
            value={branchData.branchName}
            onChange={handleChange}
            required
          />
          <label>Branch Name</label>
        </div>
        <div className="input-group">
          <input
            type="text"
            name="branchPOC"
            value={branchData.branchPOC}
            onChange={handleChange}
            required
          />
          <label>Branch POC</label>
        </div>
        <div className="phone-input-wrapper">
          <PhoneInput
            country={"in"}
            value={branchData.phone}
            onChange={handlePhoneChange}
            inputClass="phone-field"
          />
          <label>Phone Number</label>
        </div>
      </div>

      {/* Row 2 */}
      <div className="form-row-2">
        <div className="input-group">
          <input
            type="text"
            name="address"
            value={branchData.address}
            onChange={handleChange}
            required
          />
          <label>Address</label>
        </div>
        <div className="input-group">
          <input
            type="text"
            name="geoLocation"
            value={branchData.geoLocation}
            onChange={handleChange}
          />
          <label>Geo Location</label>
        </div>
      </div>

      {/* Row 3 - Country, State, City */}
      <div className="form-row">
        <div className="input-group select-wrapper">
          <Select
            options={countryOptions}
            value={
              countryOptions.find((c) => c.value === branchData.country) || null
            }
            onChange={(option) =>
              setBranchData({ ...branchData, country: option.value })
            }
            placeholder=""
            isSearchable
            classNamePrefix="react-select"
          />
          <label>Select Country</label>
        </div>
        <div className="input-group select-wrapper">
          <Select
            options={stateOptions}
            value={stateOptions.find((s) => s.value === branchData.state) || null}
            onChange={(option) =>
              setBranchData({ ...branchData, state: option.value })
            }
            placeholder=""
            isSearchable
            isDisabled={!branchData.country}
            classNamePrefix="react-select"
          />
          <label>Select State</label>
        </div>
        <div className="input-group select-wrapper">
          <Select
            options={cityOptions}
            value={cityOptions.find((c) => c.value === branchData.city) || null}
            onChange={(option) =>
              setBranchData({ ...branchData, city: option.value })
            }
            placeholder=""
            isSearchable
            isDisabled={!branchData.state}
            classNamePrefix="react-select"
          />
          <label>Select City</label>
        </div>
      </div>

      {/* Store Phone Number - Separate Row */}
      <div className="store-phone-row">
        <div className="phone-input-wrapper">
          <PhoneInput
            country={"in"}
            value={branchData.storePhone}
            onChange={handleStorePhoneChange}
            inputClass="phone-field"
          />
          <label>Store Phone Number</label>
        </div>
      </div>

      {/* API Section */}
      {branchData.apis.map((api, index) => (
        <div className="api-row" key={index}>
          <div className="input-group">
            <input
              type="text"
              value={api.apiName}
              onChange={(e) =>
                handleApiChange(index, "apiName", e.target.value)
              }
              required
            />
            <label>API Name</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              value={api.apiUrl}
              onChange={(e) => handleApiChange(index, "apiUrl", e.target.value)}
              required
            />
            <label>API URL</label>
          </div>
          {branchData.apis.length > 1 && (
            <button
              type="button"
              className="remove-api-btn"
              onClick={() => removeApi(index)}
            >
              <FaTimes />
            </button>
          )}
        </div>
      ))}

      <button type="button" className="add-btn" onClick={addNewApi}>
        + Add New API
      </button>

      <div className="button-row">
        <button type="submit" className="submit-btn">
          {initialData ? "Update" : "Submit"}
        </button>
        <button type="button" className="clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>
    </form>
  );
}