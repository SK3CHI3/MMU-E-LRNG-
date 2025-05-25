# Contributing to MMU LMS

## 🎯 **Welcome Contributors!**

Thank you for your interest in contributing to the MMU Learning Management System! This guide will help you get started with contributing to our educational platform.

## 🤝 **How to Contribute**

### **Types of Contributions**
- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Submit bug fixes and new features
- **Documentation**: Improve guides and documentation
- **Testing**: Help test new features and report issues
- **UI/UX Improvements**: Enhance user experience
- **Performance Optimizations**: Improve system performance

## 🚀 **Getting Started**

### **Development Setup**
1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/MMU-E-LRNG-.git
   cd MMU-E-LRNG-
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### **Development Workflow**
1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new assignment creation feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 📝 **Code Standards**

### **Code Style**
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

### **Component Guidelines**
```typescript
// Good component structure
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const Component: React.FC<ComponentProps> = ({ 
  title, 
  onSubmit, 
  isLoading = false 
}) => {
  // Component logic here
  
  return (
    <div className="component-container">
      {/* JSX here */}
    </div>
  );
};

export default Component;
```

### **File Organization**
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── pages/
│   ├── student/         # Student pages
│   ├── lecturer/        # Lecturer pages
│   └── admin/           # Admin pages
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript types
└── lib/                 # External library configurations
```

## 🧪 **Testing Guidelines**

### **Testing Requirements**
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance

### **Writing Tests**
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignmentForm } from './AssignmentForm';

describe('AssignmentForm', () => {
  test('submits form with correct data', async () => {
    const mockSubmit = jest.fn();
    
    render(<AssignmentForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Assignment' }
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'Test Assignment'
    });
  });
});
```

### **Test Commands**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- **Accessibility First**: WCAG 2.1 AA compliance
- **Mobile Responsive**: Mobile-first design approach
- **Consistent**: Follow established design patterns
- **Intuitive**: Clear navigation and user flows
- **Performance**: Optimize for fast loading

### **Component Library**
- Use **Shadcn/UI** components as base
- Extend components for custom functionality
- Maintain consistent spacing and typography
- Follow MMU brand guidelines

### **Accessibility Checklist**
- [ ] Proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast compliance
- [ ] Focus management
- [ ] Alternative text for images

## 🐛 **Bug Reports**

### **Before Reporting**
1. Check existing issues
2. Reproduce the bug
3. Test in different browsers
4. Gather system information

### **Bug Report Template**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Device: [e.g. Desktop, iPhone 12]
- Version: [e.g. 1.0.0]

## Screenshots
Add screenshots if applicable

## Additional Context
Any other context about the problem
```

## 💡 **Feature Requests**

### **Feature Request Template**
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Detailed description of the solution

## Alternative Solutions
Other approaches considered

## User Stories
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Considerations
Any technical requirements or constraints

## Priority
Low / Medium / High

## Additional Context
Screenshots, mockups, or examples
```

## 🔄 **Pull Request Process**

### **PR Requirements**
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Descriptive commit messages
- [ ] PR description explains changes

### **PR Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### **Review Process**
1. **Automated Checks**: CI/CD pipeline runs
2. **Code Review**: Team members review code
3. **Testing**: QA testing if needed
4. **Approval**: Maintainer approval required
5. **Merge**: Squash and merge to main

## 📚 **Documentation**

### **Documentation Standards**
- **Clear**: Easy to understand
- **Complete**: Cover all functionality
- **Current**: Keep up-to-date
- **Examples**: Include code examples
- **Accessible**: Follow accessibility guidelines

### **Documentation Types**
- **API Documentation**: Endpoint descriptions
- **Component Documentation**: Component usage
- **User Guides**: Step-by-step instructions
- **Developer Guides**: Technical implementation
- **Deployment Guides**: Setup and deployment

## 🏆 **Recognition**

### **Contributor Recognition**
- **Contributors List**: Added to README
- **Release Notes**: Mentioned in releases
- **Community Highlights**: Featured in updates
- **Swag**: MMU LMS contributor merchandise
- **References**: LinkedIn recommendations

### **Contribution Levels**
- **First-time Contributor**: Welcome package
- **Regular Contributor**: Special recognition
- **Core Contributor**: Maintainer privileges
- **Expert Contributor**: Technical leadership

## 📞 **Getting Help**

### **Communication Channels**
- **GitHub Issues**: Bug reports and features
- **GitHub Discussions**: General questions
- **Discord**: Real-time chat
- **Email**: development@mmu-lms.ac.ke

### **Mentorship Program**
- **New Contributors**: Paired with experienced developers
- **Learning Resources**: Curated learning materials
- **Code Reviews**: Detailed feedback and guidance
- **Career Support**: Professional development assistance

## 📋 **Code of Conduct**

### **Our Standards**
- **Respectful**: Treat everyone with respect
- **Inclusive**: Welcome diverse perspectives
- **Collaborative**: Work together effectively
- **Professional**: Maintain professional standards
- **Constructive**: Provide helpful feedback

### **Unacceptable Behavior**
- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information
- Inappropriate content

### **Enforcement**
- **Warning**: First offense
- **Temporary Ban**: Repeated offenses
- **Permanent Ban**: Severe violations
- **Appeal Process**: Contact maintainers

## 🎓 **Learning Resources**

### **Technology Stack**
- **React**: https://reactjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vitejs.dev/guide

### **Best Practices**
- **Clean Code**: "Clean Code" by Robert Martin
- **React Patterns**: React documentation and patterns
- **Accessibility**: WCAG guidelines
- **Testing**: Testing Library documentation
- **Git**: Git best practices guide

## 🚀 **Release Process**

### **Version Numbering**
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

### **Release Schedule**
- **Major Releases**: Quarterly
- **Minor Releases**: Monthly
- **Patch Releases**: As needed
- **Hotfixes**: Emergency fixes

---

**Thank you for contributing to MMU LMS! Together, we're building the future of education at Multimedia University of Kenya.**
