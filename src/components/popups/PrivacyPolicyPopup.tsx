import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Mail,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

interface PrivacyPolicyPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyPopup: React.FC<PrivacyPolicyPopupProps> = ({ open, onOpenChange }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: <Eye className="h-4 w-4" /> },
    { id: 'collection', title: 'Data Collection', icon: <Database className="h-4 w-4" /> },
    { id: 'usage', title: 'How We Use Data', icon: <Share2 className="h-4 w-4" /> },
    { id: 'protection', title: 'Data Protection', icon: <Lock className="h-4 w-4" /> },
    { id: 'rights', title: 'Your Rights', icon: <Shield className="h-4 w-4" /> },
    { id: 'contact', title: 'Contact Us', icon: <Mail className="h-4 w-4" /> }
  ];

  const dataTypes = [
    {
      category: 'Personal Information',
      items: ['Full name', 'Date of birth', 'National ID/Passport', 'Contact details', 'Emergency contacts'],
      purpose: 'Student identification and communication',
      retention: '7 years after graduation'
    },
    {
      category: 'Academic Records',
      items: ['Grades', 'Course enrollment', 'Academic progress', 'Transcripts', 'Certificates'],
      purpose: 'Academic management and certification',
      retention: 'Permanent (as required by law)'
    },
    {
      category: 'Financial Information',
      items: ['Fee payments', 'Financial aid records', 'Billing information', 'Payment methods'],
      purpose: 'Financial administration and reporting',
      retention: '7 years for audit purposes'
    },
    {
      category: 'Technical Data',
      items: ['Login logs', 'IP addresses', 'Device information', 'Usage analytics'],
      purpose: 'System security and improvement',
      retention: '2 years'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Our Commitment to Privacy
              </h3>
              <p className="text-sm text-muted-foreground">
                Multimedia University of Kenya is committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and protect your data in compliance with Kenyan data protection laws.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    What We Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Protect your personal information</li>
                    <li>• Use data only for educational purposes</li>
                    <li>• Comply with data protection laws</li>
                    <li>• Provide transparent data practices</li>
                    <li>• Respect your privacy rights</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    What We Don't Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Sell your personal information</li>
                    <li>• Share data with unauthorized parties</li>
                    <li>• Use data for commercial purposes</li>
                    <li>• Store data longer than necessary</li>
                    <li>• Access data without proper authorization</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This privacy policy was last updated on January 15, 2024. We may update this policy periodically to reflect changes in our practices or legal requirements.
              </p>
            </div>
          </div>
        );

      case 'collection':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Types of Data We Collect</h3>
              <div className="space-y-4">
                {dataTypes.map((type, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{type.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Data Items</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {type.items.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Purpose</h4>
                          <p className="text-sm text-muted-foreground">{type.purpose}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Retention Period</h4>
                          <Badge variant="outline" className="text-xs">{type.retention}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Sensitive Information
              </h4>
              <p className="text-sm text-muted-foreground">
                We may collect sensitive personal information such as health records for accommodation purposes or disciplinary records for academic integrity. This information is handled with extra care and additional security measures.
              </p>
            </div>
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">How We Use Your Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Educational Services',
                    items: ['Course enrollment and management', 'Academic progress tracking', 'Degree and certificate issuance', 'Academic advising and support']
                  },
                  {
                    title: 'Administrative Purposes',
                    items: ['Student registration and records', 'Fee collection and financial aid', 'Campus security and safety', 'Communication and notifications']
                  },
                  {
                    title: 'Legal Compliance',
                    items: ['Regulatory reporting requirements', 'Audit and compliance activities', 'Legal proceedings if necessary', 'Government data requests']
                  },
                  {
                    title: 'Service Improvement',
                    items: ['System performance optimization', 'User experience enhancement', 'Educational program development', 'Research and analytics']
                  }
                ].map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {category.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'protection':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Data Protection Measures</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Technical Safeguards',
                    icon: <Lock className="h-5 w-5 text-blue-500" />,
                    measures: ['End-to-end encryption', 'Secure data transmission (SSL/TLS)', 'Regular security updates', 'Access controls and authentication', 'Automated backup systems']
                  },
                  {
                    title: 'Administrative Controls',
                    icon: <Shield className="h-5 w-5 text-green-500" />,
                    measures: ['Staff training on data protection', 'Regular security audits', 'Incident response procedures', 'Data access logging', 'Privacy impact assessments']
                  },
                  {
                    title: 'Physical Security',
                    icon: <Database className="h-5 w-5 text-purple-500" />,
                    measures: ['Secure data centers', 'Restricted physical access', 'Environmental controls', 'Surveillance systems', 'Secure disposal of hardware']
                  },
                  {
                    title: 'Compliance Framework',
                    icon: <FileText className="h-5 w-5 text-orange-500" />,
                    measures: ['Data Protection Act compliance', 'Regular policy reviews', 'Third-party security assessments', 'Vendor security requirements', 'Breach notification procedures']
                  }
                ].map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {category.icon}
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {category.measures.map((measure, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'rights':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Your Privacy Rights</h3>
              <div className="space-y-4">
                {[
                  {
                    right: 'Right to Access',
                    description: 'You can request a copy of the personal information we hold about you.',
                    action: 'Submit a data access request through the student portal or contact our Data Protection Officer.'
                  },
                  {
                    right: 'Right to Rectification',
                    description: 'You can request correction of inaccurate or incomplete personal information.',
                    action: 'Update your information through the student portal or contact the Registrar\'s Office.'
                  },
                  {
                    right: 'Right to Erasure',
                    description: 'You can request deletion of your personal information in certain circumstances.',
                    action: 'Note: Academic records may be retained as required by law and accreditation requirements.'
                  },
                  {
                    right: 'Right to Restrict Processing',
                    description: 'You can request limitation of how we process your personal information.',
                    action: 'Contact our Data Protection Officer with your specific concerns and requirements.'
                  },
                  {
                    right: 'Right to Data Portability',
                    description: 'You can request your data in a structured, machine-readable format.',
                    action: 'Submit a data portability request for transfer to another educational institution.'
                  },
                  {
                    right: 'Right to Object',
                    description: 'You can object to certain types of processing of your personal information.',
                    action: 'Contact us to discuss your objections and possible alternatives.'
                  }
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{item.right}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <p className="text-sm font-medium text-primary">{item.action}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Data Protection Officer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">dpo@mmu.ac.ke</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">+254 20 386 4000 Ext. 4025</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <span className="text-sm">Administration Block, Room 205<br />Multimedia University of Kenya</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Registrar's Office
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">registrar@mmu.ac.ke</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">+254 20 386 4000 Ext. 4010</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <span className="text-sm">Administration Block, Ground Floor<br />Multimedia University of Kenya</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Filing a Complaint</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  If you believe your privacy rights have been violated, you can file a complaint with:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Office of the Data Protection Commissioner</strong></p>
                  <p>Email: info@odpc.go.ke</p>
                  <p>Phone: +254 20 2628 000</p>
                  <p>Website: www.odpc.go.ke</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            Privacy Policy
          </DialogTitle>
          <DialogDescription>
            How we collect, use, and protect your personal information
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Navigation Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.icon}
                  {section.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto pr-4">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyPopup;
