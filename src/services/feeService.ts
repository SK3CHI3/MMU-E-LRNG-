import { supabase } from '@/lib/supabaseClient';

export interface FeesSummary {
  totalFees: number | null;
  amountPaid: number | null;
  percentagePaid: number | null;
  dueDate: string | null;
  registrationThreshold: number | null;
  canRegisterUnits: boolean;
  semester: string | null;
  academicYear: string | null;
  studentId: string;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: 'approved' | 'pending' | 'failed';
  description: string;
  transactionId?: string;
}

export interface PaymentRequest {
  studentId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'bank' | 'card';
  phoneNumber?: string;
  accountNumber?: string;
  description: string;
}

// Get student fees summary
export const getStudentFeesSummary = async (studentId: string): Promise<FeesSummary | null> => {
  try {
    // This would query the fees table in Supabase
    const { data: feesData, error: feesError } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .single();

    if (feesError && feesError.code !== 'PGRST116') {
      throw feesError;
    }

    // If no fees record exists, return null instead of creating default data
    if (!feesData) {
      console.log('No fees record found for student:', studentId);
      return {
        totalFees: null,
        amountPaid: null,
        percentagePaid: null,
        dueDate: null,
        registrationThreshold: null,
        canRegisterUnits: false,
        semester: null,
        academicYear: null,
        studentId
      };
    }

    const percentagePaid = feesData.total_fees > 0
      ? Math.round((feesData.amount_paid / feesData.total_fees) * 100)
      : 0;

    return {
      totalFees: feesData.total_fees,
      amountPaid: feesData.amount_paid,
      percentagePaid,
      dueDate: feesData.due_date,
      registrationThreshold: feesData.registration_threshold,
      canRegisterUnits: feesData.registration_threshold
        ? percentagePaid >= feesData.registration_threshold
        : false,
      semester: feesData.semester,
      academicYear: feesData.academic_year,
      studentId
    };
  } catch (error) {
    console.error('Error fetching fees summary:', error);
    return null;
  }
};

// Get payment history for a student
export const getPaymentHistory = async (studentId: string): Promise<PaymentHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(payment => ({
      id: payment.id,
      date: payment.created_at,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      reference: payment.reference_number,
      status: payment.status,
      description: payment.description,
      transactionId: payment.transaction_id
    })) || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

// Process a new payment
export const processPayment = async (paymentRequest: PaymentRequest): Promise<{ success: boolean; reference?: string; error?: string }> => {
  try {
    // Generate a unique reference number
    const reference = `MMU${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        student_id: paymentRequest.studentId,
        amount: paymentRequest.amount,
        payment_method: paymentRequest.paymentMethod,
        reference_number: reference,
        status: 'pending',
        description: paymentRequest.description,
        phone_number: paymentRequest.phoneNumber,
        account_number: paymentRequest.accountNumber
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Here you would integrate with actual payment gateways
    if (paymentRequest.paymentMethod === 'mpesa') {
      // Integrate with Daraja API for M-Pesa payments
      const mpesaResult = await processMpesaPayment(paymentRequest, reference);
      if (!mpesaResult.success) {
        // Update payment status to failed
        await supabase
          .from('payment_history')
          .update({ status: 'failed' })
          .eq('id', paymentData.id);

        return { success: false, error: mpesaResult.error };
      }
    } else if (paymentRequest.paymentMethod === 'card') {
      // Integrate with card payment gateway
      const cardResult = await processCardPayment(paymentRequest, reference);
      if (!cardResult.success) {
        await supabase
          .from('payment_history')
          .update({ status: 'failed' })
          .eq('id', paymentData.id);

        return { success: false, error: cardResult.error };
      }
    }

    return { success: true, reference };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: 'Payment processing failed' };
  }
};

// Simulate M-Pesa payment processing (replace with actual Daraja API integration)
const processMpesaPayment = async (paymentRequest: PaymentRequest, reference: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would be replaced with actual Daraja API calls
    // For now, simulate a successful payment

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate
    const isSuccessful = Math.random() > 0.1;

    if (isSuccessful) {
      return { success: true };
    } else {
      return { success: false, error: 'M-Pesa transaction failed' };
    }
  } catch (error) {
    return { success: false, error: 'M-Pesa service unavailable' };
  }
};

// Simulate card payment processing
const processCardPayment = async (paymentRequest: PaymentRequest, reference: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would be replaced with actual payment gateway integration
    // For now, simulate a successful payment

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 95% success rate
    const isSuccessful = Math.random() > 0.05;

    if (isSuccessful) {
      return { success: true };
    } else {
      return { success: false, error: 'Card payment declined' };
    }
  } catch (error) {
    return { success: false, error: 'Payment gateway unavailable' };
  }
};

// Update payment status (called by webhook or manual verification)
export const updatePaymentStatus = async (
  paymentId: string,
  status: 'approved' | 'failed',
  transactionId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payment_history')
      .update({
        status,
        transaction_id: transactionId,
        verified_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) throw error;

    // If payment is approved, update the student's fees
    if (status === 'approved') {
      const { data: paymentData } = await supabase
        .from('payment_history')
        .select('student_id, amount')
        .eq('id', paymentId)
        .single();

      if (paymentData) {
        await updateStudentFeesBalance(paymentData.student_id, paymentData.amount);
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
};

// Update student fees balance after successful payment
const updateStudentFeesBalance = async (studentId: string, paymentAmount: number): Promise<void> => {
  try {
    const { data: currentFees, error: fetchError } = await supabase
      .from('student_fees')
      .select('amount_paid')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .single();

    if (fetchError) throw fetchError;

    const newAmountPaid = (currentFees?.amount_paid || 0) + paymentAmount;

    const { error: updateError } = await supabase
      .from('student_fees')
      .update({
        amount_paid: newAmountPaid,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating student fees balance:', error);
  }
};

// Generate fee statement
export const generateFeeStatement = async (studentId: string): Promise<Blob | null> => {
  try {
    // This would generate a PDF statement
    // For now, return null and implement later
    console.log('Generating fee statement for student:', studentId);
    return null;
  } catch (error) {
    console.error('Error generating fee statement:', error);
    return null;
  }
};

// Check if student can register for units
export const canRegisterForUnits = async (studentId: string): Promise<boolean> => {
  try {
    const feesSummary = await getStudentFeesSummary(studentId);
    return feesSummary?.canRegisterUnits || false;
  } catch (error) {
    console.error('Error checking unit registration eligibility:', error);
    return false;
  }
};
