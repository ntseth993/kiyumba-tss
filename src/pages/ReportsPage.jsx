import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import ReportCardGenerator from '../components/ReportCardGenerator';

const ReportsPage = () => {
  return (
    <div className="reports-page">
      <Navbar />
      <ReportCardGenerator />
      <Chat />
      <Footer />
    </div>
  );
};

export default ReportsPage;
