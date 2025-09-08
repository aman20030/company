import React, { useState, useEffect } from "react";
import "./AdminConsole.css";
import BrandCard from "./BrandCard"; // Make sure this component exists
import { FaBell, FaUserCircle, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminConsole() {
    // State management
    const [search, setSearch] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [expandedClientId, setExpandedClientId] = useState(null);
    const [expandedBranchKey, setExpandedBranchKey] = useState(null);
    const navigate = useNavigate();

    // Load initial data from localStorage
    useEffect(() => {
        const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
        setClients(storedClients);
    }, []);

    // Helper function to update state and localStorage
    const updateLocalStorageAndState = (updatedClients) => {
        setClients(updatedClients);
        localStorage.setItem("clients", JSON.stringify(updatedClients));
    };

    // --- Event Handlers ---

    const handleCardClick = (clientId) => {
        setSelectedClientId(clientId); // Set the selected client
        setShowDetails(true);      // Automatically show the details table
    };
    
    const handleShowAll = () => {
        setSelectedClientId(null); // Clear the selection
    };

    const handleEditClient = (clientIdToEdit) => {
        navigate(`/client/edit/${clientIdToEdit}`);
    };

    const handleDeleteClient = (clientIdToDelete) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            const updatedClients = clients.filter((client) => client.id !== clientIdToDelete);
            updateLocalStorageAndState(updatedClients);
            // If the deleted client was the selected one, clear the selection
            if (selectedClientId === clientIdToDelete) {
                setSelectedClientId(null);
            }
        }
    };

    const handleDeleteBranch = (clientId, branchIndexToDelete) => {
        if (window.confirm("Are you sure you want to delete this branch?")) {
            const updatedClients = clients.map(client => {
                if (client.id === clientId) {
                    const updatedBranches = client.branches.filter((_, index) => index !== branchIndexToDelete);
                    return { ...client, branches: updatedBranches };
                }
                return client;
            });
            updateLocalStorageAndState(updatedClients);
        }
    };

    const handleDeleteApi = (clientId, branchIndex, apiIndexToDelete) => {
        if (window.confirm("Are you sure you want to delete this API?")) {
            const updatedClients = clients.map(client => {
                if (client.id === clientId) {
                    const updatedBranches = client.branches.map((branch, bIndex) => {
                        if (bIndex === branchIndex) {
                            const updatedApis = branch.apis.filter((_, aIndex) => aIndex !== apiIndexToDelete);
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
            setExpandedBranchKey(null); // Close inner accordions when parent closes
        }
    };

    const handleToggleBranchExpand = (clientId, branchIndex) => {
        const key = `${clientId}-${branchIndex}`;
        setExpandedBranchKey(prevKey => (prevKey === key ? null : key));
    };

    // --- Filtering Logic ---

    // 1. Filter clients based on the search input. This list is used for the Brand Cards.
    const searchFilteredClients = clients.filter(c =>
        c.clientName.toLowerCase().includes(search.toLowerCase())
    );

    // 2. Further filter the search results based on which card is selected. This list is for the table.
    const tableClients = searchFilteredClients.filter(c =>
        selectedClientId ? c.id === selectedClientId : true
    );

    // --- Render JSX ---

    return (
        <div className="admin-container">
            {/* Topbar */}
            <div className="topbar-admin">
                <h2 className="lo">Admin</h2>
                <div className="topbar-icons-admin">
                    <FaBell className="icon bell" />
                    <FaUserCircle className="icon user-admin" />
                </div>
            </div>

            {/* Search and Action Buttons */}
            <input 
                type="text" 
                placeholder="Search Brands..." 
                className="search-bar-admin" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
            <div className="button-row-admin">
                <button className="add-btn-admin" onClick={() => navigate("/client")}>+ Add Brand</button>
                <button className="view-btn-admin" onClick={() => setShowDetails((prev) => !prev)}>
                    {showDetails ? "🙈 Hide Details" : "👁️ View Details"}
                </button>
                {selectedClientId && showDetails && (
                    <button className="view-btn-admin" onClick={handleShowAll}>
                        Show All Clients
                    </button>
                )}
            </div>
            
            {/* Brand Cards Grid */}
            <div className="brand-grid-admin">
                {searchFilteredClients.length > 0 ? (
                    searchFilteredClients.map((client) => (
                        <div key={client.id} onClick={() => handleCardClick(client.id)} style={{ cursor: 'pointer' }}>
                            <BrandCard 
                                name={client.clientName} 
                                logo={client.clientLogoUrl} 
                            />
                        </div>
                    ))
                ) : (
                    <p>No brands found matching your search.</p>
                )}
            </div>

            {/* Details Section (Table) */}
            {showDetails && (
                <div className="details-table-container">
                    <h3>Client Details</h3>
                    {tableClients.length > 0 ? (
                        <div className="table-scroll-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Client Name</th>
                                        <th>Client Type</th>
                                        <th>Manager</th>
                                        <th>Phone</th>
                                        <th>Country</th>
                                        <th>Address</th>
                                        <th>Billing (Days)</th>
                                        <th>Contract Start</th>
                                        <th>Contract End</th>
                                        <th>Branches</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableClients.map((client) => (
                                        <React.Fragment key={client.id}>
                                            {/* Main Client Row */}
                                            <tr className="main-client-row">
                                                <td>{client.clientName}</td>
                                                <td>{client.clientType}</td>
                                                <td>{client.accountManager}</td>
                                                <td>{client.phone}</td>
                                                <td>{client.country}</td>
                                                <td title={client.address}>{client.address ? `${client.address.substring(0, 20)}...` : 'N/A'}</td>
                                                <td>{client.billingTerms}</td>
                                                <td>{client.contractStart}</td>
                                                <td>{client.contractEnd}</td>
                                                <td>
                                                    {client.branches && client.branches.length > 0 ? (
                                                        <button className="view-branches-btn" onClick={() => handleToggleExpand(client.id)}>
                                                            {expandedClientId === client.id ? <FaChevronUp /> : <FaChevronDown />}
                                                            View ({client.branches.length})
                                                        </button>
                                                    ) : "N/A"}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="edit-btn-table" title="Edit Client" onClick={() => handleEditClient(client.id)}><FaEdit /></button>
                                                        <button className="delete-btn-table" title="Delete Client" onClick={() => handleDeleteClient(client.id)}><FaTrash /></button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Row for Branches */}
                                            {expandedClientId === client.id && (
                                              <tr className="branch-details-row">
                                                <td colSpan="11">
                                                    <div className="branch-details-wrapper">
                                                        <h4>Branches for {client.clientName}</h4>
                                                        <div className="table-scroll-wrapper">
                                                            <table className="branch-inner-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Branch Name</th>
                                                                        <th>POC Name</th>
                                                                        <th>Phone</th>
                                                                        <th>Store Phone</th>
                                                                        <th>Address</th>
                                                                        <th>Country</th>
                                                                        <th>Geo Location</th>
                                                                        <th>APIs</th>
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
                                                                                    <td>{branch.storePhone}</td>
                                                                                    <td title={branch.address}>{branch.address ? `${branch.address.substring(0, 20)}...` : 'N/A'}</td>
                                                                                    <td>{branch.country}</td>
                                                                                    <td>{branch.geoLocation}</td>
                                                                                    <td>
                                                                                        {branch.apis && branch.apis.length > 0 ? (
                                                                                            <button className="view-api-btn" onClick={() => handleToggleBranchExpand(client.id, index)}>
                                                                                                {isBranchExpanded ? <FaChevronUp/> : <FaChevronDown/>}
                                                                                                ({branch.apis.length}) APIs
                                                                                            </button>
                                                                                        ) : "No APIs"}
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="action-buttons">
                                                                                            <button className="edit-btn-table" title="Edit Branch"><FaEdit /></button>
                                                                                            <button className="delete-btn-table" title="Delete Branch" onClick={() => handleDeleteBranch(client.id, index)}><FaTrash /></button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                
                                                                                {/* Expanded Row for APIs */}
                                                                                {isBranchExpanded && (
                                                                                    <tr className="api-details-row">
                                                                                        <td colSpan="9">
                                                                                            <div className="api-details-wrapper">
                                                                                                <h5>API Details for {branch.branchName}</h5>
                                                                                                <div className="table-scroll-wrapper">
                                                                                                    <table className="api-inner-table">
                                                                                                        <thead>
                                                                                                            <tr>
                                                                                                                <th>API Name</th>
                                                                                                                <th>API URL</th>
                                                                                                                <th>Actions</th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            {branch.apis.map((api, apiIndex) => (
                                                                                                                <tr key={apiIndex}>
                                                                                                                    <td>{api.apiName}</td>
                                                                                                                    <td>{api.apiUrl}</td>
                                                                                                                    <td>
                                                                                                                        <div className="action-buttons">
                                                                                                                            <button className="edit-btn-table" title="Edit API"><FaEdit /></button>
                                                                                                                            <button className="delete-btn-table" title="Delete API" onClick={() => handleDeleteApi(client.id, index, apiIndex)}><FaTrash /></button>
                                                                                                                        </div>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            ))}
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </div>
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
                                                    </div>
                                                </td>
                                              </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data-msg">
                            {selectedClientId ? "This client has been deleted or cannot be found." : "No client data found."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}