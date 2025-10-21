// Payment Processing Service
// Handles payment transactions, receipts, and payment tracking

const initializePayments = () => {
  const existing = localStorage.getItem('paymentTransactions');
  if (!existing) {
    localStorage.setItem('paymentTransactions', JSON.stringify([]));
  }
};

export const paymentService = {
  // Process a payment
  async processPayment(paymentData) {
    try {
      initializePayments();
      const transactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
      
      const transaction = {
        id: Date.now(),
        studentId: paymentData.studentId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod, // 'cash', 'mobile_money', 'bank_transfer', 'card'
        reference: paymentData.reference || `PAY-${Date.now()}`,
        description: paymentData.description || 'Tuition Fee Payment',
        status: 'completed', // 'pending', 'completed', 'failed', 'refunded'
        processedBy: paymentData.processedBy || 'system',
        processedAt: new Date().toISOString(),
        receiptNumber: `RCP-${Date.now()}`,
        academicYear: paymentData.academicYear || '2024',
        term: paymentData.term || 'Term 1',
        metadata: paymentData.metadata || {}
      };
      
      transactions.push(transaction);
      localStorage.setItem('paymentTransactions', JSON.stringify(transactions));
      
      // Update student payment record
      await this.updateStudentPaymentRecord(paymentData.studentId, paymentData.amount);
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Update student payment record in comprehensive students service
  async updateStudentPaymentRecord(studentId, amount) {
    try {
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      const studentIndex = students.findIndex(s => s.id === studentId);
      
      if (studentIndex !== -1) {
        const student = students[studentIndex];
        if (!student.payments) {
          student.payments = {
            tuitionFee: 500000,
            paidAmount: 0,
            balance: 500000,
            status: 'Unpaid',
            lastPayment: null
          };
        }
        
        student.payments.paidAmount += amount;
        student.payments.balance = student.payments.tuitionFee - student.payments.paidAmount;
        student.payments.lastPayment = new Date().toISOString().split('T')[0];
        
        if (student.payments.balance === 0) {
          student.payments.status = 'Paid';
        } else if (student.payments.paidAmount > 0) {
          student.payments.status = 'Partial';
        }
        
        students[studentIndex] = student;
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
        
        return { success: true, student };
      }
      
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('Error updating student payment record:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all transactions
  async getAllTransactions() {
    try {
      initializePayments();
      return JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  // Get student payments (alias for getStudentTransactions for consistency)
  async getStudentPayments(studentId) {
    return this.getStudentTransactions(studentId);
  },

  // Get transactions for a student
  async getStudentTransactions(studentId) {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.filter(t => t.studentId === studentId);
    } catch (error) {
      console.error('Error fetching student transactions:', error);
      return [];
    }
  },

  // Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.find(t => t.id === transactionId);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  },

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate) {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.filter(t => {
        const transactionDate = t.processedAt.split('T')[0];
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }
  },

  // Get payment statistics
  async getPaymentStatistics(startDate = null, endDate = null) {
    try {
      let transactions = await this.getAllTransactions();
      
      if (startDate && endDate) {
        transactions = transactions.filter(t => {
          const transactionDate = t.processedAt.split('T')[0];
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }
      
      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = transactions.length;
      const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;
      
      const byMethod = {
        cash: transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0),
        mobile_money: transactions.filter(t => t.paymentMethod === 'mobile_money').reduce((sum, t) => sum + t.amount, 0),
        bank_transfer: transactions.filter(t => t.paymentMethod === 'bank_transfer').reduce((sum, t) => sum + t.amount, 0),
        card: transactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.amount, 0)
      };
      
      return {
        totalRevenue,
        transactionCount,
        averageTransaction,
        byMethod,
        transactions
      };
    } catch (error) {
      console.error('Error calculating payment statistics:', error);
      return {
        totalRevenue: 0,
        transactionCount: 0,
        averageTransaction: 0,
        byMethod: { cash: 0, mobile_money: 0, bank_transfer: 0, card: 0 },
        transactions: []
      };
    }
  },

  // Generate receipt data
  async generateReceipt(transactionId) {
    try {
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }
      
      // Get student details
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      const student = students.find(s => s.id === transaction.studentId);
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }
      
      const receipt = {
        receiptNumber: transaction.receiptNumber,
        date: transaction.processedAt,
        student: {
          id: student.studentId,
          name: student.name,
          class: student.class,
          department: student.department
        },
        payment: {
          amount: transaction.amount,
          method: transaction.paymentMethod,
          reference: transaction.reference,
          description: transaction.description
        },
        balance: student.payments?.balance || 0,
        processedBy: transaction.processedBy
      };
      
      return { success: true, receipt };
    } catch (error) {
      console.error('Error generating receipt:', error);
      return { success: false, error: error.message };
    }
  },

  // Refund a payment
  async refundPayment(transactionId, reason = '') {
    try {
      initializePayments();
      const transactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
      const transactionIndex = transactions.findIndex(t => t.id === transactionId);
      
      if (transactionIndex === -1) {
        return { success: false, error: 'Transaction not found' };
      }
      
      const transaction = transactions[transactionIndex];
      
      // Update transaction status
      transaction.status = 'refunded';
      transaction.refundedAt = new Date().toISOString();
      transaction.refundReason = reason;
      
      transactions[transactionIndex] = transaction;
      localStorage.setItem('paymentTransactions', JSON.stringify(transactions));
      
      // Update student payment record (subtract the amount)
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      const studentIndex = students.findIndex(s => s.id === transaction.studentId);
      
      if (studentIndex !== -1) {
        const student = students[studentIndex];
        student.payments.paidAmount -= transaction.amount;
        student.payments.balance = student.payments.tuitionFee - student.payments.paidAmount;
        
        if (student.payments.balance === 0) {
          student.payments.status = 'Paid';
        } else if (student.payments.paidAmount > 0) {
          student.payments.status = 'Partial';
        } else {
          student.payments.status = 'Unpaid';
        }
        
        students[studentIndex] = student;
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
      }
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error refunding payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get pending payments (students with balance)
  async getPendingPayments() {
    try {
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      return students.filter(s => s.payments && s.payments.balance > 0);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  },

  // Send payment reminder
  async sendPaymentReminder(studentId) {
    try {
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }
      
      // In a real application, this would send an email/SMS
      console.log(`Payment reminder sent to ${student.name} (${student.email})`);
      console.log(`Balance: ${student.payments?.balance || 0}`);
      
      return { 
        success: true, 
        message: `Reminder sent to ${student.name}`,
        student 
      };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return { success: false, error: error.message };
    }
  }
};
