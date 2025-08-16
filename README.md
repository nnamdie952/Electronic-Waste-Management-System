# Electronic Waste Management System

A comprehensive blockchain-based system for tracking electronic devices from manufacturing to proper disposal, built with Clarity smart contracts.

## Overview

This system provides end-to-end tracking and management of electronic waste, ensuring compliance with environmental regulations and promoting sustainable practices in the electronics industry.

## Key Features

### 🔍 Device Tracking
- Complete lifecycle tracking from manufacturing to disposal
- Unique device identification and registration
- Ownership transfer management
- Location and status updates

### 🛡️ Data Destruction & Privacy
- Certified data destruction processes
- Privacy compliance verification
- Audit trail for data handling
- Regulatory compliance reporting

### ♻️ Component Recovery
- Refurbishment tracking and certification
- Component harvesting and reuse
- Quality assessment and grading
- Secondary market integration

### 🌍 Environmental Transparency
- Rare earth metal recovery tracking
- Environmental impact reporting
- Carbon footprint calculation
- Sustainability metrics

### 📋 Compliance Management
- Manufacturer take-back program support
- Regulatory reporting automation
- Compliance certificate generation
- Audit trail maintenance

## Smart Contracts

### 1. Device Registry (`device-registry.clar`)
Central registry for all electronic devices with unique identification, manufacturer details, and basic specifications.

### 2. Lifecycle Manager (`lifecycle-manager.clar`)
Manages device lifecycle states, ownership transfers, and location tracking throughout the device's lifetime.

### 3. Data Destruction (`data-destruction.clar`)
Handles data destruction certificates, privacy compliance verification, and secure data handling processes.

### 4. Component Recovery (`component-recovery.clar`)
Tracks component extraction, refurbishment processes, and secondary market transactions.

### 5. Compliance Reporting (`compliance-reporting.clar`)
Generates compliance reports, manages regulatory requirements, and maintains audit trails.

## Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Device Registry │    │ Lifecycle Mgr   │    │ Data Destruction│
│                 │    │                 │    │                 │
│ • Registration  │◄──►│ • State Mgmt    │◄──►│ • Certificates  │
│ • Identification│    │ • Ownership     │    │ • Privacy       │
│ • Specifications│    │ • Location      │    │ • Compliance    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
▲                       ▲                       ▲
│                       │                       │
▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│Component Recovery│    │Compliance Report│    │   Web Interface │
│                 │    │                 │    │                 │
│ • Refurbishment │    │ • Audit Trails  │    │ • Dashboard     │
│ • Quality Check │    │ • Regulatory    │    │ • Reporting     │
│ • Reuse Tracking│    │ • Certificates  │    │ • Management    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## Data Models

### Device
- Device ID (unique identifier)
- Manufacturer information
- Model and specifications
- Manufacturing date
- Serial number
- Current status and location

### Lifecycle Event
- Event type (manufactured, sold, transferred, disposed)
- Timestamp
- Location
- Responsible party
- Additional metadata

### Data Destruction Certificate
- Certificate ID
- Device ID
- Destruction method
- Verification status
- Compliance standards met
- Auditor information

### Component Recovery Record
- Component ID
- Source device
- Recovery date
- Quality grade
- Refurbishment status
- Destination/reuse information

## Getting Started

### Prerequisites
- Clarinet CLI installed
- Node.js 18+ for web interface
- Basic understanding of Clarity smart contracts

### Installation

1. Clone the repository
   \`\`\`bash
   git clone <repository-url>
   cd electronic-waste-management
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Check contract syntax
   \`\`\`bash
   clarinet check
   \`\`\`

4. Run tests
   \`\`\`bash
   npm test
   \`\`\`

### Development

1. Start the development server
   \`\`\`bash
   npm run dev
   \`\`\`

2. Run contract tests
   \`\`\`bash
   clarinet test
   \`\`\`

3. Deploy contracts (testnet)
   \`\`\`bash
   clarinet deploy --testnet
   \`\`\`

## Testing

The system includes comprehensive tests using Vitest for both contract functionality and integration scenarios.

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run Clarity contract tests
clarinet test
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Environmental Impact

This system contributes to environmental sustainability by:
- Reducing electronic waste through better tracking
- Promoting component reuse and refurbishment
- Ensuring proper disposal of hazardous materials
- Supporting circular economy principles
- Providing transparency in recycling processes

## Compliance Standards

Supports compliance with:
- WEEE Directive (EU)
- RoHS Directive
- Basel Convention
- EPA regulations (US)
- Local environmental regulations
