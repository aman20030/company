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

  // Map modal
  const [showMap, setShowMap] = useState(false);
  const [markerPos, setMarkerPos] = useState([20.5937, 78.9629]);
   const [selectedAddress, setSelectedAddress] = useState("");
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "billingTerms" || name === "invoiceProcessing") && !/^\d*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "logo") {
      if (!file.type.startsWith("image/")) { alert("❌ Only image files allowed"); return; }
      if (file.size > 1 * 1024 * 1024) { alert("❌ Max 1MB"); return; }
      setClientLogo(file);
    } else if (type === "contract") {
      if (file.type !== "application/pdf") { alert("❌ Only PDF allowed"); return; }
      if (file.size > 5 * 1024 * 1024) { alert("❌ Max 5MB"); return; }
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
    if (formData.contractEnd && formData.contractStart && formData.contractEnd < formData.contractStart) {
      alert("❌ Contract End Date must be after Start Date!");
      return;
    }
    console.log(formData, clientLogo, contractFile, branches);
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

  // Save location into form
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

      {/* Floating button for current location */}
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
            <input type="text" name="clientName" placeholder="Client Name" value={formData.clientName} onChange={handleChange} />
            <input type="text" name="clientType" placeholder="Client Type" value={formData.clientType} onChange={handleChange} />
          </div>

          <div className="form-row">
            <input type="text" name="accountManager" placeholder="Account Manager" value={formData.accountManager} onChange={handleChange} />
            <div style={{ flex: 1.1 }}>
              <PhoneInput country={"us"} placeholder="Phone" value={formData.phone} onChange={(phone) => setFormData({ ...formData, phone })} inputClass="phone-field" />
            </div>
            <input type="text" name="address" placeholder="Address" value={formData.address} readOnly onClick={() => setShowMap(true)} />
            <input type="text" name="geoLocation" placeholder="Geo Location" value={formData.geoLocation} readOnly />
          </div>

          <div className="form-row">
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
          </div>

          <div className="form-row">
            <input type="number" name="billingTerms" placeholder="Billing Terms" value={formData.billingTerms} onChange={handleChange} />
            <div className="upload-input-wrapper">
              <input type="text" placeholder="Upload Client Logo" readOnly value={clientLogo ? clientLogo.name : ""} onClick={() => document.getElementById("logoFile").click()} />
              <input type="file" id="logoFile" style={{ display: "none" }} onChange={(e) => handleFileChange(e, "logo")} />
              <button type="button" onClick={() => document.getElementById("logoFile").click()}>Upload</button>
            </div>
          </div>

          <div className="form-row">
            <input type={!startFocus ? "text" : "date"} placeholder="Contract Start Date" name="contractStart" value={formData.contractStart} onChange={handleChange} onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)} />
            <input type={!endFocus ? "text" : "date"} placeholder="Contract End Date" name="contractEnd" value={formData.contractEnd} min={formData.contractStart} onChange={handleChange} onFocus={() => setEndFocus(true)} onBlur={() => setEndFocus(false)} />
          </div>

          <div className="form-row">
            <input type="number" name="invoiceProcessing" placeholder="Invoice Processing" value={formData.invoiceProcessing} onChange={handleChange} />
            <div className="upload-input-wrapper">
              <input type="text" placeholder="Contract Upload (PDF)" readOnly value={contractFile ? contractFile.name : ""} onClick={() => document.getElementById("contractFile").click()} />
              <input type="file" id="contractFile" style={{ display: "none" }} onChange={(e) => handleFileChange(e, "contract")} />
              <button type="button" onClick={() => document.getElementById("contractFile").click()}>Upload</button>
            </div>
          </div>

          <div className="branch-buttons">
            <button type="button" onClick={() => setShowBranchList(true)}>View Branches</button>
            <button type="button" onClick={() => setShowBranchForm(true)}>Add Branch +</button>
          </div>

          <div className="sla-section">
            <label><b>SLA</b></label>
            <textarea name="sla" value={formData.sla} onChange={handleChange} placeholder="SLA"></textarea>
          </div>

          <div className="btn-wrapper">
            <div className="submit-btn">
              <button type="submit">Submit</button>
              <button type="button" onClick={handleClear} style={{ marginLeft: "10px", background: "yellow" }}>Clear</button>
            </div>
          </div>
        </form>
      </div>

      {/* Branch Form */}
      {showBranchForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3>Add Branch</h3>
              <button style={{ backgroundColor: "#f44336", color: "white", padding: "6px 15px", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={() => setShowBranchForm(false)}>Close</button>
            </div>
            <BranchForm onAddBranch={handleAddBranch} />
          </div>
        </div>
      )}

      {/* Branch List */}
      {showBranchList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3>All Branches</h3>
              <button style={{ backgroundColor: "#f44336", color: "white", padding: "6px 15px", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={() => setShowBranchList(false)}>Close</button>
            </div>
            {branches.length === 0 ? <p>No branches added yet.</p> : <ul>{branches.map((b, i) => <li key={i}><b>{b.branchName}</b> - {b.branchPOC} ({b.phone})</li>)}</ul>}
          </div>
        </div>
      )}

      {/* Map Modal */}
       {showMap && (
        <div className="modal-overlay">
          <div className="modal-content location-modal">
           <div className="modal-header-bar">
        <h3>📍 Select Location</h3>
        <button className="close-btn" onClick={() => setShowMap(false)}>×</button>
      </div>

             {/* Map with Search */}
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

            {/* Selected Address */}
            <div className="selected-address">
              <b>Selected Location:</b>
              <p>{selectedAddress}</p>
            </div>

            {/* Actions */}
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
