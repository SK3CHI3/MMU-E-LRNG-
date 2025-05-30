import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Mail,
  Phone,
  Scale,
  Lock,
  Eye,
  UserCheck,
  Ban,
  Gavel
} from 'lucide-react';

interface TermsOfUsePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsOfUsePopup: React.FC<TermsOfUsePopupProps> = ({ open, onOpenChange }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: <Eye className="h-4 w-4" /> },
    { id: 'acceptance', title: 'Acceptance', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'usage', title: 'Acceptable Use', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'prohibited', title: 'Prohibited Activities', icon: <Ban className="h-4 w-4" /> },
    { id: 'responsibilities', title: 'User Responsibilities', icon: <Users className="h-4 w-4" /> },
    { id: 'intellectual', title: 'Intellectual Property', icon: <Shield className="h-4 w-4" /> },
    { id: 'termination', title: 'Termination', icon: <Gavel className="h-4 w-4" /> },
    { id: 'legal', title: 'Legal Terms', icon: <Scale className="h-4 w-4" /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Terms of Use Agreement
              </h3>
              <p className="text-sm text-muted-foreground">
                These Terms of Use govern your access to and use of the Multimedia University of Kenya (MMU) Learning Management System and related services. By accessing or using our services, you agree to be bound by these terms.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    What This Covers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Student portal access and usage</li>
                    <li>• Academic services and resources</li>
                    <li>• Communication tools and platforms</li>
                    <li>• Digital learning materials</li>
                    <li>• Assessment and grading systems</li>
                    <li>• Mobile applications and APIs</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• These terms may be updated periodically</li>
                    <li>• Continued use implies acceptance</li>
                    <li>• Violations may result in account suspension</li>
                    <li>• Academic integrity policies apply</li>
                    <li>• University policies take precedence</li>
                    <li>• Kenyan law governs these terms</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Effective Date</span>
              </div>
              <p className="text-sm text-muted-foreground">
                These Terms of Use are effective as of January 15, 2024, and supersede all previous versions. Last updated: January 15, 2024.
              </p>
            </div>
          </div>
        );

      case 'acceptance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Acceptance of Terms</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      By Using Our Services, You Agree To:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Comply with all terms and conditions outlined in this agreement</li>
                      <li>• Follow MMU's academic integrity and conduct policies</li>
                      <li>• Respect the rights and privacy of other users</li>
                      <li>• Use the system only for legitimate educational purposes</li>
                      <li>• Maintain the confidentiality of your account credentials</li>
                      <li>• Report any security vulnerabilities or policy violations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Age and Capacity Requirements
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>You must be at least 18 years old or have reached the age of majority in your jurisdiction to use our services independently.</p>
                      <p>If you are under 18, you may only use our services under the supervision of a parent, guardian, or authorized educational representative.</p>
                      <p>You must have the legal capacity to enter into binding agreements.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-500" />
                      Modifications to Terms
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>MMU reserves the right to modify these terms at any time with reasonable notice.</p>
                      <p>Changes will be communicated through the student portal, email, or official university channels.</p>
                      <p>Continued use of services after changes constitutes acceptance of new terms.</p>
                      <p>If you disagree with changes, you must discontinue use of the services.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Acceptable Use Guidelines</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Academic Activities',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    items: [
                      'Accessing course materials and resources',
                      'Submitting assignments and assessments',
                      'Participating in online discussions',
                      'Communicating with instructors and peers',
                      'Viewing grades and academic progress',
                      'Registering for courses and programs'
                    ]
                  },
                  {
                    title: 'Administrative Functions',
                    icon: <Users className="h-5 w-5 text-blue-500" />,
                    items: [
                      'Updating personal information',
                      'Managing account settings',
                      'Accessing financial information',
                      'Downloading official documents',
                      'Scheduling appointments',
                      'Requesting academic services'
                    ]
                  },
                  {
                    title: 'Communication Guidelines',
                    icon: <Shield className="h-5 w-5 text-purple-500" />,
                    items: [
                      'Professional and respectful communication',
                      'Academic-related discussions only',
                      'Appropriate language and content',
                      'Respect for diverse perspectives',
                      'Constructive feedback and collaboration',
                      'Privacy and confidentiality awareness'
                    ]
                  },
                  {
                    title: 'Technical Compliance',
                    icon: <Lock className="h-5 w-5 text-orange-500" />,
                    items: [
                      'Using supported browsers and devices',
                      'Maintaining updated security software',
                      'Following password security guidelines',
                      'Reporting technical issues promptly',
                      'Avoiding system manipulation',
                      'Respecting bandwidth limitations'
                    ]
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

      case 'prohibited':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Prohibited Activities</h3>
              <div className="space-y-4">
                {[
                  {
                    category: 'Academic Misconduct',
                    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                    items: [
                      'Plagiarism or unauthorized collaboration',
                      'Cheating on exams or assessments',
                      'Falsifying academic records or documents',
                      'Unauthorized sharing of exam content',
                      'Impersonating another student or staff member',
                      'Submitting work that is not your own'
                    ]
                  },
                  {
                    category: 'System Abuse',
                    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                    items: [
                      'Attempting to hack or breach security',
                      'Unauthorized access to other accounts',
                      'Distributing malware or viruses',
                      'Overloading system resources',
                      'Circumventing access controls',
                      'Reverse engineering or decompiling software'
                    ]
                  },
                  {
                    category: 'Content Violations',
                    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                    items: [
                      'Posting inappropriate or offensive content',
                      'Sharing copyrighted material without permission',
                      'Harassment or bullying of other users',
                      'Discriminatory or hate speech',
                      'Spam or unsolicited commercial content',
                      'False or misleading information'
                    ]
                  },
                  {
                    category: 'Legal Violations',
                    color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
                    items: [
                      'Any illegal activities or content',
                      'Violation of intellectual property rights',
                      'Privacy violations or data theft',
                      'Fraud or financial misconduct',
                      'Threats or intimidation',
                      'Violation of export control laws'
                    ]
                  }
                ].map((section, index) => (
                  <Card key={index} className={`border-2 ${section.color}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ban className="h-5 w-5 text-red-500" />
                        {section.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
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

      case 'responsibilities':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">User Responsibilities</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Account Security',
                    description: 'You are responsible for maintaining the security of your account and all activities that occur under your credentials.',
                    responsibilities: [
                      'Create strong, unique passwords',
                      'Never share your login credentials',
                      'Log out from shared or public computers',
                      'Report suspicious account activity immediately',
                      'Keep your contact information updated',
                      'Use two-factor authentication when available'
                    ]
                  },
                  {
                    title: 'Content and Conduct',
                    description: 'You are responsible for all content you post and your interactions with other users.',
                    responsibilities: [
                      'Ensure all submitted content is original or properly cited',
                      'Maintain professional and respectful communication',
                      'Respect intellectual property rights',
                      'Follow academic integrity guidelines',
                      'Report inappropriate behavior or content',
                      'Comply with university codes of conduct'
                    ]
                  },
                  {
                    title: 'Technical Compliance',
                    description: 'You must use the system in accordance with technical guidelines and limitations.',
                    responsibilities: [
                      'Use supported browsers and software',
                      'Maintain adequate internet connectivity',
                      'Keep your devices secure and updated',
                      'Respect system resource limitations',
                      'Follow file size and format requirements',
                      'Report technical issues through proper channels'
                    ]
                  },
                  {
                    title: 'Legal and Regulatory Compliance',
                    description: 'You must comply with all applicable laws and university regulations.',
                    responsibilities: [
                      'Follow all local, national, and international laws',
                      'Comply with university policies and procedures',
                      'Respect privacy and data protection requirements',
                      'Adhere to export control regulations',
                      'Maintain academic honesty and integrity',
                      'Cooperate with university investigations'
                    ]
                  }
                ].map((section, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {section.responsibilities.map((item, i) => (
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

      case 'intellectual':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Intellectual Property Rights</h3>
              <div className="space-y-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      University-Owned Content
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>All course materials, lectures, assessments, and educational content provided through the LMS are the intellectual property of MMU or its licensors.</p>
                      <p>This includes but is not limited to: lecture recordings, course slides, reading materials, assessment questions, and multimedia content.</p>
                      <p>You may use this content solely for your educational purposes and may not redistribute, sell, or commercially exploit it.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      Student-Created Content
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>You retain ownership of original content you create and submit through the LMS, such as assignments, projects, and discussion posts.</p>
                      <p>By submitting content, you grant MMU a non-exclusive license to use, reproduce, and display your work for educational and administrative purposes.</p>
                      <p>This license includes the right to use your work for assessment, academic integrity checking, and educational improvement.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 dark:bg-orange-900/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Third-Party Content
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Some content may be licensed from third parties and subject to additional restrictions.</p>
                      <p>You must respect all copyright notices and licensing terms associated with third-party content.</p>
                      <p>Unauthorized use of third-party content may result in legal action and account termination.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-purple-500" />
                      Copyright Compliance
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>You must comply with all applicable copyright laws and university policies regarding intellectual property.</p>
                      <p>Proper attribution must be given when using or referencing copyrighted material.</p>
                      <p>Fair use provisions may apply to educational use, but you should consult with university librarians or legal counsel when in doubt.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'termination':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Account Termination</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gavel className="h-5 w-5 text-red-500" />
                      Grounds for Termination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-3">
                      <p>MMU may suspend or terminate your access to the LMS for any of the following reasons:</p>
                      <ul className="space-y-2 ml-4">
                        <li>• Violation of these Terms of Use</li>
                        <li>• Academic misconduct or integrity violations</li>
                        <li>• Breach of university policies or codes of conduct</li>
                        <li>• Illegal activities or content</li>
                        <li>• Security threats or system abuse</li>
                        <li>• Non-payment of fees or financial obligations</li>
                        <li>• Graduation or withdrawal from the university</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Termination Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-3">
                      <p><strong>Immediate Termination:</strong> May occur for serious violations such as security breaches, illegal activities, or severe academic misconduct.</p>
                      <p><strong>Notice Period:</strong> For less severe violations, you may receive a warning and opportunity to correct the issue before termination.</p>
                      <p><strong>Appeal Process:</strong> You have the right to appeal termination decisions through university grievance procedures.</p>
                      <p><strong>Data Retention:</strong> Your academic records will be retained according to university policies, but access to the LMS will be revoked.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Voluntary Termination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-3">
                      <p>You may request termination of your account by contacting the Registrar's Office or IT Support.</p>
                      <p>Voluntary termination does not relieve you of any outstanding obligations to the university.</p>
                      <p>Some data may be retained for legal, regulatory, or administrative purposes even after account termination.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Legal Terms and Conditions</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Governing Law',
                    content: 'These Terms of Use are governed by the laws of the Republic of Kenya. Any disputes arising from these terms will be subject to the jurisdiction of Kenyan courts.'
                  },
                  {
                    title: 'Limitation of Liability',
                    content: 'MMU\'s liability for any damages arising from your use of the LMS is limited to the extent permitted by law. The university is not liable for indirect, incidental, or consequential damages.'
                  },
                  {
                    title: 'Disclaimer of Warranties',
                    content: 'The LMS is provided "as is" without warranties of any kind. MMU does not guarantee uninterrupted access, error-free operation, or fitness for any particular purpose.'
                  },
                  {
                    title: 'Indemnification',
                    content: 'You agree to indemnify and hold harmless MMU from any claims, damages, or expenses arising from your use of the LMS or violation of these terms.'
                  },
                  {
                    title: 'Severability',
                    content: 'If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.'
                  },
                  {
                    title: 'Force Majeure',
                    content: 'MMU is not liable for any failure to perform due to circumstances beyond its reasonable control, including natural disasters, government actions, or technical failures.'
                  }
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Scale className="h-4 w-4 text-primary" />
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.content}</p>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Contact Information for Legal Matters
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Legal Affairs Office</strong></p>
                      <p>Email: legal@mmu.ac.ke</p>
                      <p>Phone: +254 20 386 4000 Ext. 4030</p>
                      <p>Address: Administration Block, Multimedia University of Kenya</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
            <FileText className="h-6 w-6 text-primary" />
            Terms of Use
          </DialogTitle>
          <DialogDescription>
            Legal terms and conditions for using MMU's Learning Management System
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Updated: Jan 15, 2024
            </Badge>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUsePopup;
