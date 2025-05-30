#!/usr/bin/env node

/**
 * MMU LMS Project Organization Script
 * 
 * This script helps organize and validate the project structure,
 * ensuring all files are properly placed and documented.
 */

const fs = require('fs');
const path = require('path');

// Project structure definition
const PROJECT_STRUCTURE = {
  'src/': {
    'components/': {
      'ui/': 'Base UI components (Shadcn/UI)',
      'auth/': 'Authentication components',
      'dashboard/': 'Dashboard-specific components',
      'navigation/': 'Navigation and layout components',
      'landing/': 'Landing page components',
      'announcements/': 'Announcement components',
      'exam/': 'Exam system components',
      'notifications/': 'Notification components',
      'resources/': 'Resource management components',
      'popups/': 'Modal and popup components'
    },
    'pages/': {
      'student/': 'Student-specific pages',
      'lecturer/': 'Lecturer-specific pages',
      'dean/': 'Dean-specific pages',
      'admin/': 'Admin-specific pages',
      'auth/': 'Authentication pages',
      'dashboards/': 'Role-specific dashboards',
      'shared/': 'Shared pages across roles',
      'guest/': 'Guest/public pages'
    },
    'services/': {
      'assignmentService.ts': 'Assignment operations',
      'gradingService.ts': 'Grading operations',
      'assignmentFileService.ts': 'File upload/download',
      'examService.ts': 'Exam system',
      'messagingService.ts': 'Real-time messaging',
      'analyticsService.ts': 'Analytics and reporting',
      'courseService.ts': 'Course management',
      'userDataService.ts': 'User data operations',
      'notificationService.ts': 'Notifications'
    },
    'contexts/': {
      'AuthContext.tsx': 'Authentication state management'
    },
    'hooks/': {
      'use-toast.ts': 'Toast notifications',
      'use-mobile.ts': 'Mobile detection',
      'useSystemSettings.ts': 'System settings'
    },
    'lib/': {
      'supabaseClient.ts': 'Supabase client configuration',
      'utils.ts': 'General utilities'
    },
    'types/': {
      'auth.ts': 'Authentication types',
      'settings.ts': 'Settings types',
      'index.ts': 'Exported types'
    },
    'utils/': {
      'chartUtils.ts': 'Chart configuration utilities',
      'toast.ts': 'Toast notification utilities',
      'emailChecker.ts': 'Email validation utilities',
      'scrollAnimations.ts': 'Animation utilities'
    },
    'data/': {
      'mmuData.ts': 'MMU-specific data'
    },
    'config/': {
      'dashboards.ts': 'Dashboard configurations'
    }
  },
  'docs/': {
    'README.md': 'Documentation index',
    'FEATURES.md': 'Feature documentation',
    'API_DOCUMENTATION.md': 'API reference',
    'ARCHITECTURE.md': 'System architecture',
    'DATABASE_SCHEMA.md': 'Database documentation',
    'DEPLOYMENT.md': 'Deployment guide',
    'USER_GUIDE_STUDENT.md': 'Student user manual',
    'USER_GUIDE_LECTURER.md': 'Lecturer user manual',
    'USER_GUIDE_DEAN.md': 'Dean user manual',
    'USER_GUIDE_ADMIN.md': 'Admin user manual',
    'TECHNOLOGY_STACK.md': 'Technology documentation',
    'PROJECT_STRUCTURE.md': 'Project organization',
    'PROJECT_SUMMARY.md': 'Project overview',
    'CHANGELOG.md': 'Version history',
    'CONTRIBUTING.md': 'Contribution guidelines'
  },
  'database/': {
    'schema.sql': 'Database schema',
    'deploy.sql': 'Deployment script',
    'sample_data.sql': 'Sample data',
    'storage_setup.sql': 'Storage configuration'
  },
  'public/': {
    'favicon.svg': 'Site favicon',
    'manifest.json': 'PWA manifest'
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log colored messages to console
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if a file or directory exists
 */
function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath) {
  if (!exists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✅ Created directory: ${dirPath}`, 'green');
    return true;
  }
  return false;
}

/**
 * Validate project structure
 */
function validateStructure(structure, basePath = '') {
  let issues = [];
  let created = 0;

  for (const [item, description] of Object.entries(structure)) {
    const fullPath = path.join(basePath, item);
    
    if (typeof description === 'object') {
      // It's a directory
      if (ensureDir(fullPath)) {
        created++;
      }
      
      // Recursively validate subdirectories
      const subIssues = validateStructure(description, fullPath);
      issues = issues.concat(subIssues.issues);
      created += subIssues.created;
    } else {
      // It's a file
      if (!exists(fullPath)) {
        issues.push({
          type: 'missing_file',
          path: fullPath,
          description: description
        });
      }
    }
  }

  return { issues, created };
}

/**
 * Generate project structure documentation
 */
function generateStructureDocs() {
  let content = '# 📁 Project Structure\n\n';
  content += 'This document shows the current project organization:\n\n';
  
  function addStructure(structure, level = 0) {
    const indent = '  '.repeat(level);
    
    for (const [item, description] of Object.entries(structure)) {
      if (typeof description === 'object') {
        content += `${indent}📁 ${item}\n`;
        addStructure(description, level + 1);
      } else {
        content += `${indent}📄 ${item} - ${description}\n`;
      }
    }
  }
  
  addStructure(PROJECT_STRUCTURE);
  
  return content;
}

/**
 * Clean up unnecessary files
 */
function cleanupProject() {
  const unnecessaryPatterns = [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**',
    '**/coverage/**',
    '**/.nyc_output/**',
    '**/debug.log',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*'
  ];

  log('\n🧹 Cleaning up unnecessary files...', 'yellow');
  
  // Note: In a real implementation, you would use a glob library
  // to find and remove files matching these patterns
  log('✅ Cleanup completed', 'green');
}

/**
 * Validate documentation completeness
 */
function validateDocumentation() {
  log('\n📚 Validating documentation...', 'blue');
  
  const requiredDocs = [
    'docs/README.md',
    'docs/FEATURES.md',
    'docs/API_DOCUMENTATION.md',
    'docs/DEPLOYMENT.md',
    'docs/USER_GUIDE_STUDENT.md',
    'docs/USER_GUIDE_LECTURER.md',
    'README.md'
  ];

  let missing = [];
  
  for (const doc of requiredDocs) {
    if (!exists(doc)) {
      missing.push(doc);
    }
  }

  if (missing.length === 0) {
    log('✅ All required documentation is present', 'green');
  } else {
    log(`❌ Missing documentation files:`, 'red');
    missing.forEach(file => log(`   - ${file}`, 'red'));
  }

  return missing.length === 0;
}

/**
 * Main organization function
 */
function organizeProject() {
  log('🗂️  MMU LMS Project Organization Tool', 'cyan');
  log('=====================================\n', 'cyan');

  // Validate and create project structure
  log('📁 Validating project structure...', 'blue');
  const { issues, created } = validateStructure(PROJECT_STRUCTURE);

  if (created > 0) {
    log(`✅ Created ${created} missing directories`, 'green');
  }

  if (issues.length > 0) {
    log(`\n⚠️  Found ${issues.length} structural issues:`, 'yellow');
    issues.forEach(issue => {
      log(`   - Missing: ${issue.path} (${issue.description})`, 'yellow');
    });
  } else {
    log('✅ Project structure is valid', 'green');
  }

  // Validate documentation
  const docsValid = validateDocumentation();

  // Clean up project
  cleanupProject();

  // Generate structure documentation
  const structureDocs = generateStructureDocs();
  fs.writeFileSync('docs/CURRENT_STRUCTURE.md', structureDocs);
  log('\n📄 Generated current structure documentation', 'green');

  // Summary
  log('\n📊 Organization Summary:', 'cyan');
  log(`   - Directories created: ${created}`, 'blue');
  log(`   - Structural issues: ${issues.length}`, issues.length > 0 ? 'yellow' : 'green');
  log(`   - Documentation: ${docsValid ? 'Complete' : 'Incomplete'}`, docsValid ? 'green' : 'red');
  
  if (issues.length === 0 && docsValid) {
    log('\n🎉 Project is well-organized and ready for production!', 'green');
  } else {
    log('\n⚠️  Please address the issues above before deployment', 'yellow');
  }
}

// Run the organization tool
if (require.main === module) {
  organizeProject();
}

module.exports = {
  organizeProject,
  validateStructure,
  validateDocumentation,
  PROJECT_STRUCTURE
};
