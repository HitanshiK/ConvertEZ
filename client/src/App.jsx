import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Upload from './Upload';
import MergePDF from './MergePDF';
import SplitPDF from './SplitPDF';
import CompressPDF from './CompressPDF';
import Footer from './Footer';

const App = () => {
 /* useEffect(() => {
    const apiBaseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://convertez.onrender.com';

    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);*/

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/merge" element={<MergePDF />} />
        <Route path="/split" element={<SplitPDF />} />
        <Route path="/compress" element={<CompressPDF />} />
        <Route path="/" element={<Upload />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
