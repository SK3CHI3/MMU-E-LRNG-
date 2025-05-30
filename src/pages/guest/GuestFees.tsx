import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, DollarSign, Receipt, Lock } from 'lucide-react';

const GuestFees = () => {
  const mockFeeData = {
    totalRequired: 120000,
    totalPaid: 75000,
    balance: 45000,
    paymentProgress: 62.5
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Fees & Payments</h1>
          <p className="text-muted-foreground">Manage your fee payments and view statements</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Balance: KSh {mockFeeData.balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Required</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {mockFeeData.totalRequired.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KSh {mockFeeData.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Payments made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KSh {mockFeeData.balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Amount due</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
          <CardDescription>Your fee payment status for the current semester</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span>{mockFeeData.paymentProgress}%</span>
            </div>
            <Progress value={mockFeeData.paymentProgress} className="h-3" />
          </div>
          <div className="text-sm text-muted-foreground">
            You have paid KSh {mockFeeData.totalPaid.toLocaleString()} out of KSh {mockFeeData.totalRequired.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Make Payment
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          View Statement
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestFees;
