import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./Pages/homePage/HomePage";
import 'bootstrap/dist/css/bootstrap.css';



function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* voeg hier extra routes toe als je die hebt */}
        </Routes>
      </Router>
  );
}

export default App;
