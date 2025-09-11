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
  FaPlus,
  FaDownload,
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
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    invoiceProcessing: "",
    sla: "",
    clientLogoUrl: "",
    contracts: [
      {
        startDate: "",
        endDate: "",
        contractFileName: "",
        contractFileData: "",
      },
    ],
  });
  const { clientId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(clientId);

  const [clientLogo, setClientLogo] = useState(null);
  
  const [branches, setBranches] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showBranchList, setShowBranchList] = useState(false);
  const [branchFormData, setBranchFormData] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [markerPos, setMarkerPos] = useState([20.5937, 78.9629]);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      const allClients = JSON.parse(localStorage.getItem("clients")) || [];
      const clientToEdit = allClients.find((c) => c.id == clientId);
      if (clientToEdit) {
        const { branches, ...mainClientData } = clientToEdit;

        if (!mainClientData.contracts || mainClientData.contracts.length === 0) {
          mainClientData.contracts = [{ 
            startDate: "", 
            endDate: "", 
            contractFileName: "", 
            contractFileData: "" 
          }];
        }

        setFormData(mainClientData);

        if (branches && Array.isArray(branches)) {
          setBranches(branches);
        }
      }
    }
  }, [clientId, isEditMode]);

  useEffect(() => {
    axios
      .get("https://countriesnow.space/api/v0.1/countries")
      .then((res) => {
        setCountries(res.data.data.map((c) => c.country));
      })
      .catch((err) => console.error("Country fetch error:", err));
  }, []);

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

  const handleCityChange = (e) => {
    setFormData({ ...formData, city: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "billingTerms" || name === "invoiceProcessing") &&
      !/^\d*$/.test(value)
    )
      return;

    setFormData({ ...formData, [name]: value });
  };

  const handleContractChange = (index, event) => {
    const { name, value } = event.target;
    const updatedContracts = [...formData.contracts];
    updatedContracts[index][name] = value;
    setFormData({ ...formData, contracts: updatedContracts });
  };

  const handleContractFileChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for contracts.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { 
      toast.error("Contract file size cannot exceed 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedContracts = [...formData.contracts];
      updatedContracts[index].contractFileName = file.name;
      updatedContracts[index].contractFileData = reader.result;
      setFormData({ ...formData, contracts: updatedContracts });
    };
    reader.readAsDataURL(file);
  };

  const downloadContractFile = (index) => {
    const contract = formData.contracts[index];
    if (!contract.contractFileData) {
      toast.warn("No file available to download.");
      return;
    }

    const link = document.createElement('a');
    link.href = contract.contractFileData;
    link.download = contract.contractFileName || `contract_${index + 1}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addContractRow = () => {
    setFormData({
      ...formData,
      contracts: [
        ...formData.contracts,
        {
          startDate: "",
          endDate: "",
          contractFileName: "",
          contractFileData: "",
        },
      ],
    });
  };

  const removeContractRow = (index) => {
    if (formData.contracts.length <= 1) {
      toast.warn("You must have at least one contract period.");
      return;
    }
    const updatedContracts = formData.contracts.filter((_, i) => i !== index);
    setFormData({ ...formData, contracts: updatedContracts });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed for the logo.");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Logo file size cannot exceed 1MB.");
      return;
    }

    setClientLogo(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        clientLogoUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

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
    
    for (const contract of formData.contracts) {
      if (contract.endDate && contract.startDate && contract.endDate < contract.startDate) {
        return toast.error("Contract End Date must be after Start Date for all entries!");
      }
    }
    
    const allClients = JSON.parse(localStorage.getItem("clients")) || [];
    const finalClientData = { 
        ...formData, 
        branches 
    };

    if (isEditMode) {
      const updatedClients = allClients.map((client) =>
        client.id == clientId ? { ...finalClientData, id: client.id } : client
      );
      localStorage.setItem("clients", JSON.stringify(updatedClients));
      toast.success("Client details updated successfully!");
    } else {
      const newClient = { ...finalClientData, id: Date.now() };
      const updatedClients = [...allClients, newClient];
      localStorage.setItem("clients", JSON.stringify(updatedClients));
      toast.success("Client added successfully!");
    }
    navigate("/");
  };

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

  function MapSearch({ setMarkerPos }) {
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
          (err) => toast.error("Unable to fetch location: " + err.message),
          { enableHighAccuracy: true }
        );
      } else {
        toast.error("Geolocation not supported in this browser!");
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
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    
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

          {/* Country → State → City */}
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
                onChange={handleFileChange}
                accept="image/*"
              />
              <button
                type="button"
                title="Upload Logo"
                onClick={() => document.getElementById("logoFile").click()}
                className="gradient-upload-btn"
              >
                <FaUpload />
              </button>
            </div>
          </div>

          {/* FIXED: Contract Periods Section */}
          <h3 className="section-title-clientonboarding">Contract Periods</h3>
          <div className="contracts-container-clientonboarding">
            {formData.contracts.map((contract, index) => (
              <div key={index} className="contract-row-clientonboarding">
                <div className="input-group-clientonboarding">
                  <input
                    type="date"
                    name="startDate"
                    value={contract.startDate}
                    onChange={(e) => handleContractChange(index, e)}
                    required
                  />
                  <label>Contract Start Date</label>
                </div>

                <div className="input-group-clientonboarding">
                  <input
                    type="date"
                    name="endDate"
                    value={contract.endDate}
                    onChange={(e) => handleContractChange(index, e)}
                    required
                  />
                  <label>Contract End Date</label>
                </div>
                
                <div className="input-group file-upload-group-clientonboarding">
                  <input
                    type="file"
                    id={`contract-file-${index}`}
                    accept=".pdf"
                    onChange={(e) => handleContractFileChange(index, e)}
                    style={{ display: 'none' }}
                  />
                  <div className="file-upload-display">
                    <button
                      type="button"
                      className="file-upload-btn"
                      onClick={() => document.getElementById(`contract-file-${index}`).click()}
                    >
                      <FaUpload /> 
                      {contract.contractFileName ? contract.contractFileName : "Upload Contract PDF"}
                    </button>
                    {contract.contractFileName && (
                      <button
                        type="button"
                        className="download-file-btn"
                        onClick={() => downloadContractFile(index)}
                        title="Download Contract"
                      >
                        <FaDownload />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="remove-contract-btn-clientonboarding"
                  title="Remove Contract"
                  onClick={() => removeContractRow(index)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-contract-btn-clientonboarding"
              onClick={addContractRow}
            >
              <FaPlus /> Add Another Contract
            </button>
          </div>

          {/* Invoice Processing Days */}
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
              <button
                type="button"
                onClick={() => setShowBranchList(prev => !prev)}
                className="gradient-button"
              >
                <FaEye /> 
                {showBranchList ? "Hide Branches" : "View/Edit Branches"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBranchFormData(null);
                  setShowBranchForm(true);
                }}
                className="gradient-button"
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

        {/* Branch List */}
        {showBranchList && (
          <div className="inline-branch-list">
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
              </div>
            </div>
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
        )}
      </div>

      {/* Branch Form Modal */}
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