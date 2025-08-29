import React, { useState, useEffect } from "react";
import "./ClientOnboarding.css";
import {
  FaBell,
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUpload,
  FaEye,
} from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import BranchForm from "./BranchForm";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import axios from "axios";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const provider = new OpenStreetMapProvider();

export default function ClientOnboarding() {
  const [formData, setFormData] = useState({
    clientName: "",
    clientType: "",
    accountManager: "",
    phone: "",
    address: "",
    geoLocation: "",
    state: "",
    city: "",
    country: "",
    billingTerms: "",
    contractStart: "",
    contractEnd: "",
    invoiceProcessing: "",
    sla: "",
  });

  const [clientLogo, setClientLogo] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [startFocus, setStartFocus] = useState(false);
  const [endFocus, setEndFocus] = useState(false);

  const [branches, setBranches] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showBranchList, setShowBranchList] = useState(false);
  const [branchFormData, setBranchFormData] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [markerPos, setMarkerPos] = useState([20.5937, 78.9629]);
  const [selectedAddress, setSelectedAddress] = useState("");

  // 🌍 Country → State → City data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Load countries
  useEffect(() => {
    axios
      .get("https://countriesnow.space/api/v0.1/countries")
      .then((res) => {
        setCountries(res.data.data.map((c) => c.country));
      })
      .catch((err) => console.error("Country fetch error:", err));
  }, []);

  // When country changes → fetch states
  const handleCountryChange = async (e) => {
    const country = e.target.value;
    setFormData({ ...formData, country, state: "", city: "" });
    setCities([]);
    try {
      const res = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          country,
        }
      );
      setStates(res.data.data.states.map((s) => s.name));
    } catch (err) {
      console.error("State fetch error:", err);
    }
  };

  // When state changes → fetch cities
  const handleStateChange = async (e) => {
    const state = e.target.value;
    setFormData({ ...formData, state, city: "" });
    try {
      const res = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          country: formData.country,
          state,
        }
      );
      setCities(res.data.data);
    } catch (err) {
      console.error("City fetch error:", err);
    }
  };

  // When city changes
  const handleCityChange = (e) => {
    setFormData({ ...formData, city: e.target.value });
  };

  // Handle normal input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "billingTerms" || name === "invoiceProcessing") &&
      !/^\d*$/.test(value)
    )
      return;

    setFormData({ ...formData, [name]: value });
  };

  // File Upload
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "logo") {
      if (!file.type.startsWith("image/")) {
        alert("Only image files allowed");
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert("Max 1MB");
        return;
      }
      setClientLogo(file);
    } else if (type === "contract") {
      if (file.type !== "application/pdf") {
        alert("Only PDF allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Max 5MB");
        return;
      }
      setContractFile(file);
    }
  };

  // Branch Functions
  const handleAddBranch = (branchData) => {
    setBranches([...branches, branchData]);
    setShowBranchForm(false);
    setBranchFormData(null);
  };

  const handleDeleteBranch = (index) => {
    const updatedBranches = [...branches];
    updatedBranches.splice(index, 1);
    setBranches(updatedBranches);
  };

  const handleEditBranch = (index) => {
    const branchToEdit = branches[index];
    setBranchFormData(branchToEdit);
    setBranches(branches.filter((_, i) => i !== index));
    setShowBranchList(false);
    setShowBranchForm(true);
  };

  const handleClear = () => window.location.reload();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.contractEnd &&
      formData.contractStart &&
      formData.contractEnd < formData.contractStart
    ) {
      alert("Contract End Date must be after Start Date!");
      return;
    }
    console.log(formData, clientLogo, contractFile, branches);
  };

  // Reverse geocode fetch
  useEffect(() => {
    const fetchAddress = async () => {
      const [lat, lon] = markerPos;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        setSelectedAddress(data.display_name || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddress();
  }, [markerPos]);

  const saveLocation = () => {
    setFormData((prev) => ({
      ...prev,
      address: selectedAddress,
      latitude: markerPos[0],
      longitude: markerPos[1],
    }));
    setShowMap(false);
  };

  // Map Search
  function MapSearch({ markerPos, setMarkerPos }) {
    const map = useMapEvents({});
    useEffect(() => {
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        showMarker: true,
        showPopup: false,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        searchLabel: " Search location...",
      });

      map.addControl(searchControl);
      map.on("geosearch/showlocation", (e) => {
        const { x, y } = e.location;
        setMarkerPos([y, x]);
      });
      return () => map.removeControl(searchControl);
    }, [map, setMarkerPos]);

    const goToCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setMarkerPos([latitude, longitude]);
            map.flyTo([latitude, longitude], 14);
          },
          (err) => alert("Unable to fetch location: " + err.message),
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation not supported in this browser!");
      }
    };

    return (
      <>
        <Marker
          position={markerPos}
          draggable={true}
          eventHandlers={{
            dragend: (e) =>
              setMarkerPos([
                e.target.getLatLng().lat,
                e.target.getLatLng().lng,
              ]),
          }}
        />
        <button
          onClick={goToCurrentLocation}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            background: "#1c9ba5",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          📍
        </button>
      </>
    );
  }

  return (
    <>
      <div className="onboard-header">
        <h2>Client Onboarding</h2>
        <div className="actions">
          <FaBell />
          <FaUserCircle />
        </div>
      </div>

      <div className="client-onboarding">
        <form onSubmit={handleSubmit}>
          {/* Client Name + Type */}
          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder=""
                required
              />
              <label>Client Name</label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                required
              />
              <label>Client Type</label>
            </div>
          </div>

          {/* Manager + Phone + Address */}
          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                name="accountManager"
                value={formData.accountManager}
                onChange={handleChange}
                required
              />
              <label>Account Manager</label>
            </div>
            <div style={{ flex: 1.1 }}>
              <div className="input-group phone-input-group">
                <PhoneInput
                  country={"in"}
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  inputClass="phone-field"
                />
                <label>Phone</label>
              </div>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="address"
                value={formData.address}
                readOnly
                onClick={() => setShowMap(true)}
              />
              <label>Address</label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="geoLocation"
                value={formData.geoLocation}
                readOnly
              />
              <label>Geo Location</label>
            </div>
          </div>

          {/* 🌍 Country → State → City */}
          <div className="form-row">
            <div className="input-group">
              <select
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                required
              >
                <option value="">Select Country</option>
                {countries.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label>Country</label>
            </div>

            <div className="input-group">
              <select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                disabled={!states.length}
                required
              >
                <option value="">Select State</option>
                {states.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label>State</label>
            </div>

            <div className="input-group">
              <select
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                disabled={!cities.length}
                required
              >
                <option value="">Select City</option>
                {cities.map((ct, i) => (
                  <option key={i} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
              <label>City</label>
            </div>
          </div>

          {/* Billing + Logo */}
          <div className="form-row">
            <div className="input-group">
              <input
                type="number"
                name="billingTerms"
                value={formData.billingTerms}
                onChange={handleChange}
                required
              />
              <label>Billing Terms (Days)</label>
            </div>
            <div className="input-group upload-input-wrapper">
              <input
                type="text"
                readOnly
                value={clientLogo ? clientLogo.name : ""}
                onClick={() => document.getElementById("logoFile").click()}
                required
              />
              <label>Upload Client Logo</label>
              <input
                type="file"
                id="logoFile"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "logo")}
              />
              <button
                type="button"
                title="Upload Logo"
                onClick={() => document.getElementById("logoFile").click()}
              >
                <FaUpload />
              </button>
            </div>
          </div>

          {/* Contract Dates */}
          <div className="form-row">
            <div className="input-group">
              <input
                type={!startFocus ? "text" : "date"}
                placeholder="Contract Start Date"
                name="contractStart"
                value={formData.contractStart}
                onChange={handleChange}
                onFocus={() => setStartFocus(true)}
                onBlur={() => setStartFocus(false)}
              />
              <label>Contract Start Date</label>
            </div>
            <div className="input-group">
              <input
                type={!endFocus ? "text" : "date"}
                placeholder="Contract End Date"
                name="contractEnd"
                value={formData.contractEnd}
                min={formData.contractStart}
                onChange={handleChange}
                onFocus={() => setEndFocus(true)}
                onBlur={() => setEndFocus(false)}
              />
              <label>Contract End Date</label>
            </div>
          </div>

          {/* Invoice + Contract Upload */}
          <div className="form-row">
            <div className="input-group">
              <input
                type="number"
                name="invoiceProcessing"
                value={formData.invoiceProcessing}
                onChange={handleChange}
                required
              />
              <label>Invoice Processing Days</label>
            </div>
            <div className="input-group upload-input-wrapper">
              <input
                type="text"
                readOnly
                value={contractFile ? contractFile.name : ""}
                onClick={() => document.getElementById("contractFile").click()}
                required
              />
              <label>Contract Upload (PDF)</label>
              <input
                type="file"
                id="contractFile"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "contract")}
              />
              <button
                type="button"
                title="Upload Contract"
                onClick={() => document.getElementById("contractFile").click()}
              >
                <FaUpload />
              </button>
            </div>
          </div>

          {/* SLA */}
          <div className="sla-section">
            <div className="input-group">
              <textarea
              name="sla"
              value={formData.sla}
              onChange={handleChange}
              placeholder=""
            ></textarea>
             <label htmlFor="sla">SLA</label>
            </div>
            
          </div>

          {/* Additional Branches Section */}
          <div className="additional-branches-section">
            <h3>
              Additional Branches{" "}
              {branches.length > 0 && (
                <span className="branch-count-badge">({branches.length})</span>
              )}
            </h3>

            <div className="branch-buttons">
              <button type="button" onClick={() => setShowBranchList(true)}>
                <FaEye /> View/Edit Branches
              </button>
              <button
                type="button"
                onClick={() => {
                  setBranchFormData(null);
                  setShowBranchForm(true);
                }}
              >
                + Add Branch
              </button>
            </div>
          </div>

          {/* Submit + Clear */}
          <div className="btn-wrapper">
            <div className="button-row">
              <button type="submit" className="submit-btn">
                Submit
              </button>
              <button type="button" className="clear-btn" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Branch Form */}
      {showBranchForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-bar">
              <h3>{branchFormData ? "Edit Branch" : "Add Branch"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowBranchForm(false);
                  setBranchFormData(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="branch-form-container">
              <BranchForm
                onAddBranch={handleAddBranch}
                initialData={branchFormData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Branch List */}
      {showBranchList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-bar">
              <h3>All Branches</h3>
              <div className="header-actions">
                <button
                  className="add-branch-header-btn"
                  onClick={() => {
                    setShowBranchList(false);
                    setBranchFormData(null);
                    setShowBranchForm(true);
                  }}
                >
                  + Add Branch
                </button>
                <button
                  className="close-btn"
                  onClick={() => setShowBranchList(false)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
             {/* 👇 Ye naya add karna hai */}
      <div className="branch-summary">
  <div className="summary-box">
    <div className="summary-title">Total Branches</div>
    <div className="summary-count">{1 + branches.length}</div>
  </div>
  <div className="summary-box">
    <div className="summary-title">Additional Branches</div>
    <div className="summary-count">{branches.length}</div>
  </div>
</div>

            {branches.length === 0 ? (
              <div className="empty-state">
                <p>No branches added yet.</p>
                <button
                  className="add-first-branch-btn"
                  onClick={() => {
                    setShowBranchList(false);
                    setBranchFormData(null);
                    setShowBranchForm(true);
                  }}
                >
                  + Add First Branch
                </button>
              </div>
            ) : (
              <div className="branch-list-scroll">
                <table className="branch-table">
                  <thead>
                    <tr>
                      <th>Branch Name</th>
                      <th>POC Name</th>
                      <th>Phone</th>
                      <th>Store Phone</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Country</th>
                      <th>Geo Location</th>
                      <th>APIs</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch, index) => (
                      <tr key={index}>
                        <td>{branch.branchName}</td>
                        <td>{branch.branchPOC}</td>
                        <td>{branch.phone}</td>
                        <td>{branch.storePhone}</td>
                        <td>{branch.address}</td>
                        <td>{branch.city}</td>
                        <td>{branch.state}</td>
                        <td>{branch.country}</td>
                        <td>{branch.geoLocation}</td>
                        <td>
                          {branch.apis &&
                            branch.apis.map((api) => api.apiName).join(", ")}
                        </td>
                        <td>
                          <div className="branch-actions-table">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditBranch(index)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteBranch(index)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && (
        <div className="modal-overlay">
          <div className="modal-content location-modal">
            <div className="modal-header-bar">
              <h3>📍 Select Location</h3>
              <button className="close-btn" onClick={() => setShowMap(false)}>
                ×
              </button>
            </div>

            <div className="map-wrapper">
              <MapContainer
                center={markerPos}
                zoom={5}
                style={{ height: "500px", borderRadius: "8px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapSearch markerPos={markerPos} setMarkerPos={setMarkerPos} />
              </MapContainer>
            </div>

            <div className="selected-address">
              <b>Selected Location:</b>
              <p>{selectedAddress}</p>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowMap(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={saveLocation} className="btn-select">
                Select Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
