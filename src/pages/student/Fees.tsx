
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Receipt, Download, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";

const Fees = () => {
  const [selectedSemester, setSelectedSemester] = useState("current");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Mock data
  const feeStructure = {
    tuition: 45000,
    accommodation: 15000,
    meals: 8000,
    library: 2000,
    medical: 3000,
    activities: 2000,
    technology: 3000,
    total: 78000
  };

  const payments = [
    {
      id: 1,
      date: "2024-01-10",
      amount: 25000,
      method: "Bank Transfer",
      reference: "PAY001234",
      status: "completed",
      description: "Semester 1 Partial Payment"
    },
    {
      id: 2,
      date: "2023-12-15",
      amount: 30000,
      method: "Mobile Money",
      reference: "MPE987654",
      status: "completed",
      description: "Registration Fee"
    },
    {
      id: 3,
      date: "2023-11-20",
      amount: 15000,
      method: "Cash",
      reference: "CSH567890",
      status: "completed",
      description: "Accommodation Deposit"
    }
  ];

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = feeStructure.total - totalPaid;
  const paymentProgress = (totalPaid / feeStructure.total) * 100;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock };
      case 'failed':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: Receipt };
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fees & Payments</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your fee payments and view statements
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Fee Statement
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Receipt className="h-4 w-4 mr-2" />
            Payment History
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              KSh {feeStructure.total.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">
              KSh {totalPaid.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Amount Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-red-600">
              KSh {balance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-purple-600">
              {Math.round(paymentProgress)}%
            </p>
            <p className="text-sm text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedSemester} onValueChange={setSelectedSemester} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Fees</TabsTrigger>
          <TabsTrigger value="payment">Make Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Payment Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Progress
              </CardTitle>
              <CardDescription>Current semester fee payment status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment Progress</span>
                  <span className="font-medium">
                    KSh {totalPaid.toLocaleString()} / KSh {feeStructure.total.toLocaleString()}
                  </span>
                </div>
                <Progress value={paymentProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {balance > 0 ? `KSh ${balance.toLocaleString()} remaining` : "Fully paid"}
                </p>
              </div>
              
              {balance > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Outstanding Balance
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        You have an outstanding balance of KSh {balance.toLocaleString()}. 
                        Please make a payment to avoid any academic holds.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of semester fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(feeStructure).map(([key, value]) => {
                  if (key === 'total') return null;
                  
                  const label = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm">KSh {value.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center py-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700 font-semibold">
                  <span>Total</span>
                  <span>KSh {feeStructure.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Make Payment
              </CardTitle>
              <CardDescription>Pay your fees using various payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (KSh)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    max={balance}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Outstanding balance: KSh {balance.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="cash">Cash (Bank Deposit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button className="w-full" disabled={!paymentMethod}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {payments.map((payment) => {
              const statusInfo = getStatusInfo(payment.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={payment.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <StatusIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h4 className="font-semibold">KSh {payment.amount.toLocaleString()}</h4>
                            <Badge className={statusInfo.color}>
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{payment.date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span>{payment.method}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Ref: {payment.reference}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {payments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No payment history</p>
                <p className="text-muted-foreground">
                  Your payment transactions will appear here once you make your first payment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fees;
