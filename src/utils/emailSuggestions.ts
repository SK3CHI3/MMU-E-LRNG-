// Email suggestion utility for handling duplicate email errors

export interface EmailSuggestion {
  email: string;
  description: string;
  role: string;
}

// MMU faculty-based email suggestions
export const generateEmailSuggestions = (role: string, faculty?: string): EmailSuggestion[] => {
  const suggestions: EmailSuggestion[] = [];

  switch (role) {
    case 'student':
      suggestions.push(
        { email: 'student.name@student.mmu.ac.ke', description: 'Student email format', role: 'student' },
        { email: 'firstname.lastname@student.mmu.ac.ke', description: 'Alternative student format', role: 'student' },
        { email: 'your.email@gmail.com', description: 'Personal email', role: 'student' }
      );
      break;

    case 'lecturer':
      suggestions.push(
        { email: 'firstname.lastname@mmu.ac.ke', description: 'Standard lecturer email', role: 'lecturer' },
        { email: 'dr.lastname@mmu.ac.ke', description: 'Academic title format', role: 'lecturer' },
        { email: 'prof.lastname@mmu.ac.ke', description: 'Professor format', role: 'lecturer' }
      );
      break;

    case 'dean':
      const facultyEmails = getFacultyEmailSuggestions(faculty);
      suggestions.push(...facultyEmails);
      break;

    case 'admin':
      suggestions.push(
        { email: 'admin.name@mmu.ac.ke', description: 'Admin email format', role: 'admin' },
        { email: 'system.admin@mmu.ac.ke', description: 'System admin format', role: 'admin' },
        { email: 'it.admin@mmu.ac.ke', description: 'IT admin format', role: 'admin' }
      );
      break;
  }

  return suggestions;
};

// Faculty-specific dean email suggestions based on real MMU faculties
const getFacultyEmailSuggestions = (faculty?: string): EmailSuggestion[] => {
  const facultyMap: { [key: string]: string[] } = {
    'Faculty of Business and Economics': [
      'dean.business@mmu.ac.ke',
      'dean.fobe@mmu.ac.ke',
      'dean.economics@mmu.ac.ke'
    ],
    'Faculty of Computing and Information Technology': [
      'dean.computing@mmu.ac.ke',
      'dean.focit@mmu.ac.ke',
      'dean.it@mmu.ac.ke'
    ],
    'Faculty of Engineering and Technology': [
      'dean.engineering@mmu.ac.ke',
      'dean.foet@mmu.ac.ke',
      'dean.technology@mmu.ac.ke'
    ],
    'Faculty of Media and Communication': [
      'dean.media@mmu.ac.ke',
      'dean.fameco@mmu.ac.ke',
      'dean.communication@mmu.ac.ke'
    ],
    'Faculty of Science & Technology': [
      'dean.science@mmu.ac.ke',
      'dean.fost@mmu.ac.ke',
      'dean.technology@mmu.ac.ke'
    ],
    'Faculty of Social Sciences and Technology': [
      'dean.social@mmu.ac.ke',
      'dean.fosst@mmu.ac.ke',
      'dean.socialsciences@mmu.ac.ke'
    ]
  };

  const emails = facultyMap[faculty || ''] || [
    'dean.faculty@mmu.ac.ke',
    'dean.department@mmu.ac.ke',
    'dean.academic@mmu.ac.ke'
  ];

  return emails.map(email => ({
    email,
    description: `Faculty Dean email for ${faculty || 'faculty'}`,
    role: 'dean'
  }));
};

// Generate alternative emails based on existing email
export const generateAlternativeEmails = (originalEmail: string, role: string): string[] => {
  const [localPart, domain] = originalEmail.split('@');
  const alternatives: string[] = [];

  // Add numbers
  for (let i = 1; i <= 5; i++) {
    alternatives.push(`${localPart}${i}@${domain}`);
  }

  // Add role prefix
  alternatives.push(`${role}.${localPart}@${domain}`);

  // Add year suffix
  const currentYear = new Date().getFullYear();
  alternatives.push(`${localPart}.${currentYear}@${domain}`);

  // Add MMU domain alternatives if not already MMU email
  if (!domain.includes('mmu.ac.ke')) {
    alternatives.push(`${localPart}@mmu.ac.ke`);
    alternatives.push(`${localPart}@student.mmu.ac.ke`);
  }

  return alternatives;
};

// Check if email follows MMU format
export const isMMUEmail = (email: string): boolean => {
  return email.endsWith('@mmu.ac.ke') || email.endsWith('@student.mmu.ac.ke');
};

// Validate email format for specific roles
export const validateEmailForRole = (email: string, role: string): { isValid: boolean; message?: string } => {
  if (!isMMUEmail(email)) {
    return {
      isValid: false,
      message: `For ${role} accounts, please use an MMU email address (@mmu.ac.ke or @student.mmu.ac.ke)`
    };
  }

  // Role-specific validations
  switch (role) {
    case 'student':
      if (!email.includes('@student.mmu.ac.ke') && !email.includes('@mmu.ac.ke')) {
        return {
          isValid: false,
          message: 'Student emails should preferably use @student.mmu.ac.ke domain'
        };
      }
      break;

    case 'dean':
      if (!email.includes('dean') && !email.includes('head') && !email.includes('faculty')) {
        return {
          isValid: false,
          message: 'Dean emails should include "dean", "head", or "faculty" in the address as they are faculty heads'
        };
      }
      break;

    case 'admin':
      if (!email.includes('admin') && !email.includes('system')) {
        return {
          isValid: false,
          message: 'Admin emails should include "admin" or "system" in the address'
        };
      }
      break;
  }

  return { isValid: true };
};

// Format error message with suggestions
export const formatDuplicateEmailError = (originalEmail: string, role: string, faculty?: string): string => {
  const suggestions = generateEmailSuggestions(role, faculty);
  const alternatives = generateAlternativeEmails(originalEmail, role);

  let message = `An account with the email "${originalEmail}" already exists.\n\n`;
  message += `Here are some alternative email suggestions:\n\n`;

  // Add role-specific suggestions
  if (suggestions.length > 0) {
    message += `Recommended ${role} email formats:\n`;
    suggestions.slice(0, 3).forEach(suggestion => {
      message += `• ${suggestion.email} (${suggestion.description})\n`;
    });
    message += '\n';
  }

  // Add alternatives based on original email
  if (alternatives.length > 0) {
    message += `Alternatives based on your email:\n`;
    alternatives.slice(0, 3).forEach(alt => {
      message += `• ${alt}\n`;
    });
    message += '\n';
  }

  message += `You can also:\n`;
  message += `• Sign in to your existing account\n`;
  message += `• Contact support if you believe this is an error\n`;
  message += `• Use a different email address`;

  return message;
};

export default {
  generateEmailSuggestions,
  generateAlternativeEmails,
  isMMUEmail,
  validateEmailForRole,
  formatDuplicateEmailError
};
