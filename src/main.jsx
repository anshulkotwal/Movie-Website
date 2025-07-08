import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import MovieDetail from './pages/MovieDetail.jsx'; // we'll create this
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/movie/:imdbID" element={<MovieDetail />} />
    </Routes>
  </Router>
);
