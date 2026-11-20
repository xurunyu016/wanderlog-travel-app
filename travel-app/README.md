# 🌍 WanderLog - React Travel Companion Web Application

**Module Code:** COMP10013 - Dynamic Web Technologies  
**Project Type:** Individual Coursework Assessment (CW01)

## 📌 Project Overview
**WanderLog** is a responsive, mobile-first React web application designed for travellers to plan upcoming trips and document visited destinations. The application demonstrates client-side state management, persistent on-device storage (full CRUD operations), and native browser/hardware API integrations.

## ✨ Key Technical Features
1. **Persistent On-Device Storage & Full CRUD (`localStorage`)**:
   - **Create**: Add new travel logs with destination details, dates, GPS coordinates, photos, and notes.
   - **Read**: View all saved trips, filter by status (`All`, `Planned`, `Visited`), and perform real-time keyword searches.
   - **Update**: Edit existing trip details seamlessly with automatic form population.
   - **Delete**: Remove unwanted trip entries with confirmation prompts.
   - **Persistence**: All data is automatically synchronised with the browser's `localStorage` via React `useEffect`, ensuring data remains intact after closing or refreshing the application.
2. **Device API 1 - HTML5 Geolocation API (`navigator.geolocation`)**:
   - Retrieves the user's real-time latitude and longitude coordinates with high accuracy and comprehensive permission/error handling.
3. **Device API 2 - MediaDevices Camera API (`navigator.mediaDevices.getUserMedia`)**:
   - Accesses the device's hardware camera to stream live video and capture on-the-spot travel snapshots via an HTML5 `<canvas>`, encoding images into Base64 strings for persistent local storage.
4. **Responsive UI/UX & Extra Features**:
   - Adaptive CSS Grid layout supporting both mobile viewports and desktop screens.
   - Real-time trip statistics dashboard (Total, Visited, and Planned counts).

---

## 🛠️ Prerequisites & Dependencies
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (included with Node.js)
- **Web Browser**: Modern browser supporting HTML5 Geolocation and MediaDevices APIs (Google Chrome, Microsoft Edge, Firefox, or Safari).

---

## 🚀 Installation & Setup Instructions

Follow these steps to clone, install, and run the project locally:

1. **Clone the GitHub Repository**:
   ```bash
   git clone [https://github.com/YOUR-USERNAME/travel-app.git](https://github.com/YOUR-USERNAME/travel-app.git)