# Email Templates

This directory contains all email templates used throughout the SLIMS application.

## Structure

```
templates/
├── emails/           # Email templates
│   ├── magic-link.html
│   ├── magic-link.txt
│   └── ...
└── index.ts         # Template loader and renderer
```

## Template Syntax

Templates use double curly braces `{{variableName}}` for variable substitution:

```html
<p>Hello {{recipientName}},</p>
<a href="{{magicLink}}">Click here</a>
```

## Creating New Templates

1. Create both `.html` and `.txt` versions in the `emails/` directory
2. Use `{{variableName}}` syntax for dynamic content
3. Keep variable names consistent between HTML and text versions

Example:

```
emails/
├── welcome.html
├── welcome.txt
├── password-reset.html
└── password-reset.txt
```

## Usage

```typescript
import { emailTemplates } from "../templates";

// Get rendered template
const template = emailTemplates.getTemplate("magic-link", {
  recipientName: "John Doe",
  magicLink: "https://example.com/auth/magic-link?token=xyz",
  expiryMinutes: 5,
});

// Use with mailer
await mailer.sendEmail({
  to: "user@example.com",
  subject: "Sign in to SLIMS",
  html: template.html,
  text: template.text,
});
```

## Available Templates

### Authentication & Account (4)

#### magic-link

**Purpose:** Passwordless authentication for industry supervisors  
**Variables:** `recipientName`, `magicLink`, `magicLinkToken`, `expiryMinutes`  
**Note:** Provides both clickable link and manual token for flexible authentication

#### welcome-account

**Purpose:** New account creation notification (all user types)  
**Variables:** `recipientName`, `userType`, `loginCredential`, `loginUrl`, `supportEmail`

#### password-reset

**Purpose:** Password reset request  
**Variables:** `recipientName`, `resetLink`, `expiryMinutes`

#### password-changed

**Purpose:** Password change confirmation  
**Variables:** `recipientName`, `changeTime`, `ipAddress`

---

### Supervisor Assignments (3)

#### school-supervisor-assigned

**Purpose:** Notify school supervisor of student assignments  
**Variables:** `supervisorName`, `studentCount`, `studentNames`, `sessionName`, `dashboardUrl`

#### student-supervisor-assigned

**Purpose:** Notify student of school supervisor assignment  
**Variables:** `studentName`, `supervisorName`, `supervisorEmail`, `sessionName`, `dashboardUrl`

#### industry-supervisor-linked

**Purpose:** Notify industry supervisor of student linkage  
**Variables:** `supervisorName`, `studentName`, `studentEmail`, `sessionName`, `trainingDates`, `dashboardUrl`

---

### Session & Enrollment (2)

#### session-enrollment-student

**Purpose:** Student SIWES session enrollment  
**Variables:** `studentName`, `sessionName`, `startDate`, `endDate`, `totalWeeks`, `dashboardUrl`

#### session-enrollment-supervisor

**Purpose:** School supervisor session enrollment  
**Variables:** `supervisorName`, `sessionName`, `startDate`, `endDate`, `assignedStudentsCount`, `dashboardUrl`

---

### Weekly Entry Workflow (5)

#### review-request-industry

**Purpose:** Industry supervisor weekly review request  
**Variables:** `supervisorName`, `studentName`, `weekNumber`, `weekDate`, `reviewUrl`, `expiryNote`

#### review-request-final-industry

**Purpose:** Industry supervisor final assessment request  
**Variables:** `supervisorName`, `studentName`, `sessionName`, `totalWeeks`, `reviewUrl`

#### review-request-final-school

**Purpose:** School supervisor final assessment request  
**Variables:** `supervisorName`, `studentName`, `sessionName`, `totalWeeks`, `reviewUrl`

#### comment-received-student

**Purpose:** Student notification of supervisor comment  
**Variables:** `studentName`, `supervisorName`, `supervisorType`, `weekNumber`, `commentSnippet`, `dashboardUrl`

#### week-locked-notification

**Purpose:** Student notification when week is locked  
**Variables:** `studentName`, `weekNumber`, `lockedBy`, `lockReason`, `dashboardUrl`

---

## Design Specifications

**Primary Color:** Green/Teal (`oklch(0.60 0.13 163)` - `#4ade80` to `#22c55e`)  
**Font:** System font stack (Apple System, Roboto, Segoe UI)  
**Layout:** Max-width 600px, responsive, mobile-friendly  
**Branding:** ABU SIWES with graduation cap emoji 🎓

## Template Count

**Total:** 14 MVP templates (all with HTML + TXT versions)  
**Files:** 28 template files (14 × 2)
