
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Calendar, AlertCircle, CheckCircle, Receipt } from "lucide-react";

const Fees = () => {
  // This would come from an API in a real app
  const feesSummary = {
    totalFees: 120000,
    amountPaid: 72000,
    percentagePaid: 60,
    dueDate: "June 15, 2025",
    registrationThreshold: 60,
    canRegisterUnits: true,
  };

  const feeHistory = [
    {
      id: 1,
      date: "Jan 15, 2025",
      amount: 50000,
      paymentMethod: "Bank Transfer",
      reference: "MMU25-ST-1001",
      status: "approved"
    },
    {
      id: 2,
      date: "Mar 10, 2025",
      amount: 22000,
      paymentMethod: "Mobile Money",
      reference: "MMU25-ST-1254",
      status: "approved"
    },
    {
      id: 3,
      date: "May 05, 2025",
      amount: 15000,
      paymentMethod: "Credit Card",
      reference: "MMU25-ST-1432",
      status: "pending"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Fees</h1>
        <p className="text-muted-foreground">Manage your fee payments and track your balance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Balance</CardTitle>
            <CardDescription>Current Semester (Jan-May 2025)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Payment Progress</span>
                <span className="font-medium">{feesSummary.percentagePaid}%</span>
              </div>
              <Progress value={feesSummary.percentagePaid} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">KES {feesSummary.totalFees.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold">KES {feesSummary.amountPaid.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-red-500">
                  KES {(feesSummary.totalFees - feesSummary.amountPaid).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Due</p>
                <p className="text-base font-medium flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {feesSummary.dueDate}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {feesSummary.canRegisterUnits ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">Unit Registration Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {feesSummary.canRegisterUnits
                      ? `You have paid ${feesSummary.percentagePaid}% of your fees, which meets the ${feesSummary.registrationThreshold}% threshold required for unit registration.`
                      : `You need to pay at least ${feesSummary.registrationThreshold}% of your fees to register for units.`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button className="flex-1">
              <DollarSign className="mr-2 h-4 w-4" />
              Make Payment
            </Button>
            <Button variant="outline" className="flex-1">
              <Receipt className="mr-2 h-4 w-4" />
              Download Statement
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Add or manage your payment options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Bank Transfer</p>
                <p className="text-sm text-muted-foreground">Account: 1234-5678-9012</p>
              </div>
              <Button variant="ghost" size="sm">Copy</Button>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">M-Pesa Paybill</p>
                <p className="text-sm text-muted-foreground">Business No: 123456</p>
              </div>
              <Button variant="ghost" size="sm">Copy</Button>
            </div>
            
            <Button variant="outline" className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent fee payments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fees;
