import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import './styles/global.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}