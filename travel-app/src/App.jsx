import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // ==================== 1. STATE & ON-DEVICE STORAGE (localStorage) ====================
  // Load initial trips from localStorage to ensure data persistence across browser restarts
  const [trips, setTrips] = useState(() => {
    const savedTrips = localStorage.getItem('wanderlog_trips_en');
    return savedTrips
      ? JSON.parse(savedTrips)
      : [
          {
            id: '1',
            destination: 'Edinburgh Castle, Scotland',
            date: '2026-11-15',
            category: 'Visited',
            notes: 'Amazing historic fortress. Arrive before 9:00 AM to beat the queue.',
            location: 'Lat: 55.9486, Lng: -3.1999',
            photo: null,
          },
        ];
  });

  // Form input states
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Planned');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState(null);

  // Edit mode state for Update operation
  const [editingId, setEditingId] = useState(null);

  // Extra features: Filter by status & Search query
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Device API states & refs
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Synchronise state changes with localStorage automatically
  useEffect(() => {
    localStorage.setItem('wanderlog_trips_en', JSON.stringify(trips));
  }, [trips]);

  // ==================== 2. DEVICE API 1: GEOLOCATION API ====================
  const handleGetLocation = () => {
    setLocLoading(true);
    setLocError('');

    if (!navigator.geolocation) {
      setLocError('Geolocation API is not supported by your browser.');
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        setLocLoading(false);
      },
      (error) => {
        setLocError(`Location error: ${error.message}`);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ==================== 3. DEVICE API 2: CAMERA / MEDIADEVICES API ====================
  const startCamera = async () => {
    setCameraError('');
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer rear camera on mobile devices
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(`Camera access denied or unavailable: ${err.message}`);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 320;
      canvasRef.current.height = videoRef.current.videoHeight || 240;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Convert canvas image to Base64 data URL for localStorage persistence
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7);
      setPhoto(imageDataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // ==================== 4. CRUD OPERATIONS ====================
  // CREATE & UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim() || !date) {
      alert('Please enter both a destination name and a date.');
      return;
    }

    const tripData = {
      id: editingId ? editingId : Date.now().toString(),
      destination,
      date,
      category,
      notes,
      location: location || 'No GPS coordinates recorded',
      photo,
    };

    if (editingId) {
      // UPDATE existing trip
      setTrips(trips.map((item) => (item.id === editingId ? tripData : item)));
      setEditingId(null);
    } else {
      // CREATE new trip
      setTrips([tripData, ...trips]);
    }

    resetForm();
  };

  // Populate form for UPDATE
  const handleEdit = (trip) => {
    setEditingId(trip.id);
    setDestination(trip.destination);
    setDate(trip.date);
    setCategory(trip.category);
    setNotes(trip.notes);
    setLocation(trip.location);
    setPhoto(trip.photo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // DELETE trip
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this trip entry?')) {
      setTrips(trips.filter((trip) => trip.id !== id));
    }
  };

  const resetForm = () => {
    setDestination('');
    setDate('');
    setCategory('Planned');
    setNotes('');
    setLocation('');
    setPhoto(null);
    setEditingId(null);
    stopCamera();
  };

  // READ: Filter and search trips
  const filteredTrips = trips.filter((trip) => {
    const matchesCategory = filter === 'All' || trip.category === filter;
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Statistics Calculation (Extra Feature)
  const totalCount = trips.length;
  const visitedCount = trips.filter((t) => t.category === 'Visited').length;
  const plannedCount = trips.filter((t) => t.category === 'Planned').length;

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <h1>🌍 WanderLog Travel Companion</h1>
        <p>Smart Trip Planner & Check-In Journal with Geolocation and Camera APIs</p>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">{totalCount}</span>
            <span className="stat-label">Total Trips</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{visitedCount}</span>
            <span className="stat-label">Visited</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{plannedCount}</span>
            <span className="stat-label">Planned</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Left/Top Section: Form for Create & Update */}
        <section className="card form-section">
          <h2>{editingId ? '✏️ Edit Trip Entry' : '➕ Add New Trip'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Destination Name *</label>
              <input
                type="text"
                placeholder="e.g., Isle of Skye, London Eye"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Travel Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Planned">📌 Planned</option>
                  <option value="Visited">✅ Visited</option>
                </select>
              </div>
            </div>

            {/* Device API 1: Geolocation */}
            <div className="form-group">
              <label>📍 GPS Coordinates (Geolocation API)</label>
              <div className="api-input-group">
                <input
                  type="text"
                  placeholder="Click button to fetch current GPS"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleGetLocation}
                  disabled={locLoading}
                >
                  {locLoading ? 'Locating...' : 'Get GPS'}
                </button>
              </div>
              {locError && <small className="error-text">{locError}</small>}
            </div>

            {/* Device API 2: Camera */}
            <div className="form-group">
              <label>📷 Travel Snapshot (Camera API)</label>
              {!cameraActive ? (
                <div className="camera-controls">
                  <button type="button" className="btn-secondary" onClick={startCamera}>
                    Open Camera
                  </button>
                  {photo && (
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={() => setPhoto(null)}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              ) : (
                <div className="camera-box">
                  <video ref={videoRef} autoPlay playsInline className="video-preview"></video>
                  <div className="camera-actions">
                    <button type="button" className="btn-primary" onClick={capturePhoto}>
                      📸 Capture Photo
                    </button>
                    <button type="button" className="btn-secondary" onClick={stopCamera}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              {cameraError && <small className="error-text">{cameraError}</small>}
              {photo && (
                <div className="photo-preview">
                  <img src={photo} alt="Captured Travel Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Travel Notes & Tips</label>
              <textarea
                rows="3"
                placeholder="Write down ticket prices, transport tips, or memories..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Trip (Save)' : 'Create Trip (Add)'}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right/Bottom Section: Trip List for Read & Delete */}
        <section className="list-section">
          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search destinations or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="filter-buttons">
              {['All', 'Planned', 'Visited'].map((tab) => (
                <button
                  key={tab}
                  className={filter === tab ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="empty-state">
              No trips found. Use the form to add your first adventure!
            </div>
          ) : (
            <div className="trip-grid">
              {filteredTrips.map((trip) => (
                <div key={trip.id} className="card trip-card">
                  {trip.photo && (
                    <img src={trip.photo} alt={trip.destination} className="trip-image" />
                  )}
                  <div className="trip-card-body">
                    <div className="trip-header">
                      <h3>{trip.destination}</h3>
                      <span
                        className={`badge ${
                          trip.category === 'Visited' ? 'badge-done' : 'badge-plan'
                        }`}
                      >
                        {trip.category}
                      </span>
                    </div>
                    <p className="trip-meta">📅 Date: {trip.date}</p>
                    <p className="trip-meta">📍 GPS: {trip.location}</p>
                    {trip.notes && <p className="trip-notes">{trip.notes}</p>}
                    <div className="trip-actions">
                      <button className="btn-edit" onClick={() => handleEdit(trip)}>
                        Edit (Update)
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(trip.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;