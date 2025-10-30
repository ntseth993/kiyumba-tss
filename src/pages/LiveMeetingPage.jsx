import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveMeeting from '../components/LiveMeeting';
import { useParams } from 'react-router-dom';
import './LiveMeetingPage.css';

const LiveMeetingPage = () => {
  const { meetingId } = useParams();

  return (
    <div className="live-meeting-page">
      <Navbar minimal />
      <LiveMeeting meetingId={meetingId} />
      <Footer minimal />
    </div>
  );
};

export default LiveMeetingPage;