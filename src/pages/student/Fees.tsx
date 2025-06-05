import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Receipt,
  Smartphone,
  Building,
  Copy,
  ExternalLink,
  Clock,
  Printer
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getStudentFeesSummary, getPaymentHistory, FeesSummary, PaymentHistory } from "@/services/feeService";

const Fees = () => {
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const [feesSummary, setFeesSummary] = useState<FeesSummary | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadFeesData();
    }
  }, [user?.id]);

  const loadFeesData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch real data from Supabase
      const [feesData, historyData] = await Promise.all([
        getStudentFeesSummary(user.id),
        getPaymentHistory(user.id)
      ]);

      setFeesSummary(feesData);
      setPaymentHistory(historyData);
    } catch (error) {
      console.error('Error loading fees data:', error);
      toast({
        title: "Error",
        description: "Failed to load fees information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all payment details.",
        variant: "destructive"
      });
      return;
    }

    try {
      // This would integrate with Daraja API for M-Pesa payments
      // or other payment gateways for card payments

      toast({
        title: "Payment Initiated",
        description: `Payment of KES ${paymentAmount} has been initiated. You will receive a confirmation shortly.`,
      });

      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentMethod("");

      // Reload fees data to reflect the new payment
      loadFeesData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Payment details copied to clipboard.",
    });
  };

  // Helper function to display values with proper N/A handling
  const displayValue = (value: any, type: 'text' | 'number' | 'currency' = 'text') => {
    if (value === null || value === undefined || value === '') return "N/A";
    if (type === 'number' && value === 0) return "0";
    if (type === 'currency') return value === 0 ? "KES 0" : `KES ${value.toLocaleString()}`;
    return value;
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 sm:px-0">
        <div>
          <Skeleton className="h-6 sm:h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 w-32" />
              <Skeleton className="h-3 sm:h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 sm:h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 w-32" />
              <Skeleton className="h-3 sm:h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 sm:h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!feesSummary) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Fees & Payments</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your fee payments and access payment information
          </p>
        </div>

        {/* No Data State with Helpful Information */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Fee Information Not Available</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Your fee structure hasn't been set up yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">What to do next:</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Contact the Finance Office to set up your fee structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ensure your student registration is complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Check back here once your fees have been processed</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full sm:w-auto" size="sm">
                <Building className="mr-2 h-4 w-4" />
                Contact Finance Office
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods Card - Always Show */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Available Payment Methods</CardTitle>
              <CardDescription className="text-sm">How to pay your fees when they become available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">M-Pesa Paybill</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Business No: 123456</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Account: {dbUser?.student_id || 'Your Student ID'}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard("123456")} className="flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Bank Transfer</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Account: 1234-5678-9012</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Bank: MMU Bank</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard("1234-5678-9012")} className="flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Online Payment</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Credit/Debit Cards accepted</p>
                </div>
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" />
              Important Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Payment Guidelines</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Always use your Student ID as the account reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Keep all payment receipts for your records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Payments may take 24-48 hours to reflect in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Contact finance office if payment doesn't reflect after 48 hours</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Finance Office: Main Campus, Block A, Room 101</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>Phone: +254 700 123 456</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>Email: finance@mmu.ac.ke</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Fees & Payments</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your fee payments and track your balance for {displayValue(feesSummary.semester)} - {displayValue(feesSummary.academicYear)}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} size="sm" className="w-full sm:w-auto">
          <Printer className="mr-2 h-4 w-4" />
          Print Statement
        </Button>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Fee Balance</CardTitle>
            <CardDescription className="text-sm">Current Semester ({displayValue(feesSummary.semester)})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feesSummary.totalFees !== null && feesSummary.amountPaid !== null ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Payment Progress</span>
                    <span className="font-medium">{displayValue(feesSummary.percentagePaid, 'number')}%</span>
                  </div>
                  <Progress value={feesSummary.percentagePaid || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-lg sm:text-2xl font-bold">{displayValue(feesSummary.totalFees, 'currency')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">{displayValue(feesSummary.amountPaid, 'currency')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-500">
                      {feesSummary.totalFees && feesSummary.amountPaid
                        ? displayValue(feesSummary.totalFees - feesSummary.amountPaid, 'currency')
                        : "N/A"
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Payment Due</p>
                    <p className="text-sm sm:text-base font-medium flex items-center">
                      <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{displayValue(feesSummary.dueDate)}</span>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-lg border p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                  <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-100">Fee Structure Pending</h3>
                  <p className="text-amber-800 dark:text-amber-200 mb-4">
                    Your fee information is being processed. This usually happens during:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 mb-4">
                    <li>• New student registration</li>
                    <li>• Semester transitions</li>
                    <li>• Programme changes</li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto">
                      <Building className="mr-2 h-4 w-4" />
                      Contact Finance Office
                    </Button>
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto" onClick={() => window.location.reload()}>
                      <Clock className="mr-2 h-4 w-4" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {feesSummary.totalFees !== null && (
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
                        ? `You have paid ${displayValue(feesSummary.percentagePaid, 'number')}% of your fees, which meets the ${displayValue(feesSummary.registrationThreshold, 'number')}% threshold required for unit registration.`
                        : `You need to pay at least ${displayValue(feesSummary.registrationThreshold, 'number')}% of your fees to register for units.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-3">
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:flex-1" size="sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Make Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Make Payment</DialogTitle>
                  <DialogDescription>
                    Choose your payment method and enter the amount you want to pay.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handlePayment} className="w-full" size="sm">
                    Proceed to Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full sm:flex-1" size="sm">
              <Receipt className="mr-2 h-4 w-4" />
              Download Statement
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <CardDescription className="text-sm">Available payment options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">M-Pesa Paybill</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Business No: 123456</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Account: {dbUser?.student_id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("123456")} className="flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">Bank Transfer</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Account: 1234-5678-9012</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Bank: MMU Bank</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("1234-5678-9012")} className="flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">Online Payment</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Credit/Debit Cards accepted</p>
              </div>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription className="text-sm">Recent fee payments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile-friendly payment history */}
          <div className="block sm:hidden space-y-3">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment) => (
                <div key={payment.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">KES {payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.date)}</p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Method:</span> {payment.paymentMethod}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Reference:</span> {payment.reference}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Description:</span> {payment.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No Payment History</p>
                <p className="text-sm">You haven't made any payments yet.</p>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Method</TableHead>
                  <TableHead className="text-xs">Reference</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium text-sm">KES {payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{payment.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                      <TableCell className="text-sm">{payment.description}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No Payment History</p>
                      <p className="text-sm">You haven't made any payments yet.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fees;
