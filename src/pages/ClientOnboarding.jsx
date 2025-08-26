import React, { useState, useEffect } from "react";
import "./ClientOnboarding.css";
import { FaBell, FaUserCircle } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import BranchForm from "./BranchForm";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "billingTerms" || name === "invoiceProcessing") &&
      !/^\d*$/.test(value)
    )
      return;
    if (
      ["clientName", "clientType", "accountManager", "state", "city"].includes(
        name
      ) &&
      !/^[a-zA-Z\s]*$/.test(value)
    ) {
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "logo") {
      if (!file.type.startsWith("image/")) {
        alert("❌ Only image files allowed");
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert("❌ Max 1MB");
        return;
      }
      setClientLogo(file);
    } else if (type === "contract") {
      if (file.type !== "application/pdf") {
        alert("❌ Only PDF allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Max 5MB");
        return;
      }
      setContractFile(file);
    }
  };

  const handleAddBranch = (branchData) => {
    setBranches([...branches, branchData]);
    setShowBranchForm(false);
  };

  const handleClear = () => window.location.reload();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.contractEnd &&
      formData.contractStart &&
      formData.contractEnd < formData.contractStart
    ) {
      alert("❌ Contract End Date must be after Start Date!");
      return;
    }
    console.log(formData, clientLogo, contractFile, branches);
  };
// Delete function
const handleDeleteBranch = (index) => {
  const updatedBranches = [...branches];
  updatedBranches.splice(index, 1);
  setBranches(updatedBranches);
};

// Edit function
const handleEditBranch = (index) => {
  const branchToEdit = branches[index];
  setBranchFormData(branchToEdit);  // form me data bhar do
  setBranches(branches.filter((_, i) => i !== index)); // purana remove karo
  setShowBranchList(false); // list band karo
  setShowBranchForm(true); // form open karo
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
          (err) => alert("❌ Unable to fetch location: " + err.message),
          { enableHighAccuracy: true }
        );
      } else {
        alert("❌ Geolocation not supported in this browser!");
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
          <div className="form-row">
           <div className="input-group">
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
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
                country={"us"}
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
            <input
              type="text"
              name="geoLocation"
              placeholder="Geo Location"
              value={formData.geoLocation}
              readOnly
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
              <label>State</label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <label>City</label>
            </div>
          </div>

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
            <div className="upload-input-wrapper">
              <input
                type="text"
                placeholder="Upload Client Logo"
                readOnly
                value={clientLogo ? clientLogo.name : ""}
                onClick={() => document.getElementById("logoFile").click()}
              />
              <input
                type="file"
                id="logoFile"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "logo")}
              />
              <button
                type="button"
                onClick={() => document.getElementById("logoFile").click()}
              >
                Upload
              </button>
            </div>
          </div>

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
            <div className="upload-input-wrapper">
              <input
                type="text"
                placeholder="Contract Upload (PDF)"
                readOnly
                value={contractFile ? contractFile.name : ""}
                onClick={() => document.getElementById("contractFile").click()}
              />
              <input
                type="file"
                id="contractFile"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "contract")}
              />
              <button
                type="button"
                onClick={() => document.getElementById("contractFile").click()}
              >
                Upload
              </button>
            </div>
          </div>

          <div className="branch-buttons">
            <button type="button" onClick={() => setShowBranchList(true)}>
              View Branches
            </button>
            <button type="button" onClick={() => setShowBranchForm(true)}>
              Add Branch +
            </button>
          </div>

          <div className="sla-section">
            <label>
              <b>SLA</b>
            </label>
            <textarea
              name="sla"
              value={formData.sla}
              onChange={handleChange}
              placeholder="SLA"
            ></textarea>
          </div>

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <h3>Add Branch</h3>
              <button
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "10px 25px",
                  minWidth: "100px",
                  height: "40px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
                onClick={() => setShowBranchForm(false)}
              >
                Close
              </button>
            </div>
            <BranchForm onAddBranch={handleAddBranch} />
          </div>
        </div>
      )}

      {/* Branch List */}
      {showBranchList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <h3>All Branches</h3>
              <button
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "10px 25px",
                  minWidth: "100px",
                  height: "40px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
                onClick={() => setShowBranchList(false)}
              >
                Close
              </button>
            </div>
            {branches.length === 0 ? (
              <p>No branches added yet.</p>
            ) : (
              <div className="branch-list-scroll">
                <div className="branch-cards">
                  {branches.map((branch, index) => (
                    <div key={index} className="branch-card">
                      <h3>{branch.branchName}</h3>
                      <p>
                        <strong>POC:</strong> {branch.branchPOC}
                      </p>
                      <p>
                        <strong>Phone:</strong> {branch.phone}
                      </p>
                      <p>
                        <strong>Store Phone:</strong> {branch.storePhone}
                      </p>
                      <p>
                        <strong>Address:</strong> {branch.address}
                      </p>
                      <p>
                        <strong>Geo:</strong> {branch.geoLocation}
                      </p>
                      <p>
                        <strong>City:</strong> {branch.city}
                      </p>

                      <div>
                        <strong>APIs:</strong>
                        <ul>
                          {branch.apis.map((api, i) => (
                            <li key={i}>
                              {api.apiName} → {api.apiUrl}
                            </li>
                          ))}
                        </ul>
                      </div>


                       {/* ✅ Edit & Delete Buttons */}
    <div className="branch-actions">
      <button 
        className="edit-btn" 
        onClick={() => handleEditBranch(index)}
      >
        Edit
      </button>
      <button 
        className="delete-btn" 
        onClick={() => handleDeleteBranch(index)}
      >
        Delete
      </button>
    </div>
                    </div>
                  ))}
                </div>
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