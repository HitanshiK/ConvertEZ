// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Upload from './Upload';
import MergePDF from './MergePDF';
import SplitPDF from './SplitPDF';
import CompressPDF from './CompressPDF';
import Footer from './Footer';

const App = () => {
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
