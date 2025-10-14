import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import PaymentProcessing from '../components/PaymentProcessing';

const PaymentsPage = () => {
  return (
    <div className="payments-page">
      <Navbar />
      <PaymentProcessing />
      <Chat />
      <Footer />
    </div>
  );
};

export default PaymentsPage;
