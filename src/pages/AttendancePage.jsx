import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import AttendanceManagement from '../components/AttendanceManagement';

const AttendancePage = () => {
  return (
    <div className="attendance-page">
      <Navbar />
      <AttendanceManagement />
      <Chat />
      <Footer />
    </div>
  );
};

export default AttendancePage;
