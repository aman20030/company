import React, { useState, useEffect } from "react";
import "./AdminConsole.css";
import BrandCard from "./BrandCard";
import { FaBell, FaUserCircle, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminConsole() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [clients, setClients] = useState([]);
  
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [expandedBranchKey, setExpandedBranchKey] = useState(null);

  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    setClients(storedClients);
  }, []);

  const updateLocalStorageAndState = (updatedClients) => {
    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));
  };
  
  const handleDeleteClient = (clientIdToDelete) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      const updatedClients = clients.filter((client) => client.id !== clientIdToDelete);
      updateLocalStorageAndState(updatedClients);
    }
  };

  const handleEditClient = (clientIdToEdit) => {
    navigate(`/client/edit/${clientIdToEdit}`);
  };

  // 👉 [NAYA FUNCTION 1] Branch ko delete karne ke liye
  const handleDeleteBranch = (clientId, branchIndexToDelete) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                // Sahi client milne par, uski branches ko filter karein
                const updatedBranches = client.branches.filter((_, index) => index !== branchIndexToDelete);
                // Client object ko nayi branches ke saath update karein
                return { ...client, branches: updatedBranches };
            }
            return client;
        });
        updateLocalStorageAndState(updatedClients);
    }
  };

  // 👉 [NAYA FUNCTION 2] API ko delete karne ke liye
  const handleDeleteApi = (clientId, branchIndex, apiIndexToDelete) => {
      if (window.confirm("Are you sure you want to delete this API?")) {
          const updatedClients = clients.map(client => {
              if (client.id === clientId) {
                  const updatedBranches = client.branches.map((branch, bIndex) => {
                      if (bIndex === branchIndex) {
                          // Sahi branch milne par, uske APIs ko filter karein
                          const updatedApis = branch.apis.filter((_, aIndex) => aIndex !== apiIndexToDelete);
                          // Branch object ko naye APIs ke saath update karein
                          return { ...branch, apis: updatedApis };
                      }
                      return branch;
                  });
                  return { ...client, branches: updatedBranches };
              }
              return client;
          });
          updateLocalStorageAndState(updatedClients);
      }
  };

  const handleToggleExpand = (clientId) => {
    setExpandedClientId(prevId => (prevId === clientId ? null : clientId));
    if (expandedClientId === clientId) {
      setExpandedBranchKey(null);
    }
  };

  const handleToggleBranchExpand = (clientId, branchIndex) => {
    const key = `${clientId}-${branchIndex}`;
    setExpandedBranchKey(prevKey => (prevKey === key ? null : key));
  };


  return (
    <div className="admin-container">
      {/* Topbar, Search, Buttons... No Changes Here */}
      <div className="topbar-admin">
        <h2 className="lo">Admin</h2>
        <div className="topbar-icons-admin"><FaBell className="icon bell" /><FaUserCircle className="icon user-admin" /></div>
      </div>
      <input type="text" placeholder="Search" className="search-bar-admin" value={search} onChange={(e) => setSearch(e.target.value)}/>
      <div className="button-row-admin">
        <button className="add-btn-admin" onClick={() => navigate("/client")}>+ Add Brand</button>
        <button className="view-btn-admin" onClick={() => setShowDetails((prev) => !prev)}>
          {showDetails ? "🙈 Hide Added Details" : "👁️ View Added Details"}
        </button>
      </div>
      <div className="brand-grid-admin">
        {clients.length > 0 ? (
          clients.map((client) => (<BrandCard key={client.id} name={client.clientName} logo={client.clientLogoUrl} />))
        ) : ( <p>No brands added yet. Click on "+ Add Brand" to start.</p> )}
      </div>

      {showDetails && (
        <div className="details-table-container">
          <h3>Client Details</h3>
          {clients.length > 0 ? (
            <div className="table-scroll-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Client Type</th>
                    <th>Manager</th>
                    <th>Phone</th>
                    <th>Country</th>
                    <th>Branches</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.filter(c => c.clientName.toLowerCase().includes(search.toLowerCase()))
                    .map((client) => (
                      <React.Fragment key={client.id}>
                        <tr className="main-client-row">
                          <td>{client.clientName}</td>
                          <td>{client.clientType}</td>
                          <td>{client.accountManager}</td>
                          <td>{client.phone}</td>
                          <td>{client.country}</td>
                          <td>
                            {client.branches && client.branches.length > 0 ? (
                              <button className="view-branches-btn" onClick={() => handleToggleExpand(client.id)}>
                                {expandedClientId === client.id ? <FaChevronUp/> : <FaChevronDown/>}
                                View ({client.branches.length})
                              </button>
                            ) : ( "N/A" )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="edit-btn-table" title="Edit" onClick={() => handleEditClient(client.id)}><FaEdit /></button>
                              <button className="delete-btn-table" title="Delete" onClick={() => handleDeleteClient(client.id)}><FaTrash /></button>
                            </div>
                          </td>
                        </tr>

                        {expandedClientId === client.id && (
                          <tr className="branch-details-row">
                            <td colSpan="7">
                              <div className="branch-details-wrapper">
                                <h4>Branches for {client.clientName}</h4>
                                <table className="branch-inner-table">
                                  <thead>
                                    <tr>
                                      <th>Branch Name</th>
                                      <th>POC Name</th>
                                      <th>Phone</th>
                                      <th>City</th>
                                      <th>APIs</th>
                                      {/* 👉 NAYA COLUMN: Branch Actions */}
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {client.branches.map((branch, index) => {
                                      const branchKey = `${client.id}-${index}`;
                                      const isBranchExpanded = expandedBranchKey === branchKey;
                                      return (
                                        <React.Fragment key={index}>
                                          <tr>
                                            <td>{branch.branchName}</td>
                                            <td>{branch.branchPOC}</td>
                                            <td>{branch.phone}</td>
                                            <td>{branch.city}</td>
                                            <td>
                                              {branch.apis && branch.apis.length > 0 ? (
                                                <button className="view-api-btn" onClick={() => handleToggleBranchExpand(client.id, index)}>
                                                  {isBranchExpanded ? <FaChevronUp/> : <FaChevronDown/>}
                                                   ({branch.apis.length}) APIs
                                                </button>
                                              ) : "No APIs"}
                                            </td>
                                            {/* 👉 NAYE BUTTONS: Branch Edit/Delete */}
                                            <td>
                                              <div className="action-buttons">
                                                  <button className="edit-btn-table" title="Edit Branch" onClick={() => handleEditClient(client.id)}><FaEdit /></button>
                                                  <button className="delete-btn-table" title="Delete Branch" onClick={() => handleDeleteBranch(client.id, index)}><FaTrash /></button>
                                              </div>
                                            </td>
                                          </tr>
                                          
                                          {isBranchExpanded && (
                                              <tr className="api-details-row">
                                                  <td colSpan="6">
                                                      <div className="api-details-wrapper">
                                                          <h5>API Details for {branch.branchName}</h5>
                                                          <table className="api-inner-table">
                                                              <thead>
                                                                  <tr>
                                                                      <th>API Name</th>
                                                                      <th>API URL</th>
                                                                      {/* 👉 NAYA COLUMN: API Actions */}
                                                                      <th>Actions</th>
                                                                  </tr>
                                                              </thead>
                                                              <tbody>
                                                                  {branch.apis.map((api, apiIndex) => (
                                                                      <tr key={apiIndex}>
                                                                          <td>{api.apiName}</td>
                                                                          <td>{api.apiUrl}</td>
                                                                          {/* 👉 NAYE BUTTONS: API Edit/Delete */}
                                                                          <td>
                                                                            <div className="action-buttons">
                                                                                <button className="edit-btn-table" title="Edit API" onClick={() => handleEditClient(client.id)}><FaEdit /></button>
                                                                                <button className="delete-btn-table" title="Delete API" onClick={() => handleDeleteApi(client.id, index, apiIndex)}><FaTrash /></button>
                                                                            </div>
                                                                          </td>
                                                                      </tr>
                                                                  ))}
                                                              </tbody>
                                                          </table>
                                                      </div>
                                                  </td>
                                              </tr>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          ) : ( <p className="no-data-msg">No client data found.</p> )}
        </div>
      )}
    </div>
  );
}