# Kridhax Education-AI Platform

A comprehensive multi-language educational content management system with hierarchical content structure, built as a modern full-stack application.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Data Hierarchy](#data-hierarchy)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Key Implementations](#key-implementations)
- [Admin Interface](#admin-interface)
- [Security & Performance](#security--performance)

## 🎯 Overview

Education-AI is a production-ready educational platform designed to manage multilingual educational content at scale. The platform supports:

- **Hierarchical Educational Content**: Structured content organization from country-level down to individual subtopics
- **General Blogging System**: Independent blogging platform with its own hierarchical structure
- **Multi-language Support**: Full internationalization with language validation and translation support
- **Question Management**: MCQs, Descriptive Questions, FAQs with difficulty levels
- **Admin Interface**: Comprehensive CRUD operations with CSV bulk upload/download
- **Rating & Feedback**: User feedback system for all content types

## 🏗️ Architecture

This is a **monorepo** project with two main applications:

```
Education-AI/
├── api/          # Backend API (Node.js/Express/TypeScript)
└── webapp/       # Frontend Admin Interface (Next.js/React/TypeScript)
```

### Communication Flow
```
User → Next.js Frontend → RESTful API → MongoDB Database
                ↓
          Admin Interface
          CSV Operations
          Content Management
```

## 🛠️ Technology Stack

### Backend API (`/api`)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk-based authentication
- **File Storage**: Cloudinary integration for media uploads
- **Documentation**: Swagger/OpenAPI specification
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston logger with custom configuration
- **Validation**: Express-validator for input validation
- **Development**: ts-node-dev for hot-reloading

### Frontend WebApp (`/webapp`)
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom configuration
- **UI Components**: Radix UI component library
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack Table for data grids
- **Rich Text Editor**: TipTap editor for content creation
- **CSV Handling**: PapaParse for bulk operations
- **State Management**: React hooks and context API
- **Authentication**: Clerk for user management

## ✨ Core Features

### Content Management
- ✅ Full CRUD operations for all content entities
- ✅ Hierarchical parent-child validation
- ✅ Language validation for multilingual content
- ✅ CSV bulk upload/download functionality
- ✅ Rich text editing with TipTap
- ✅ Image upload and management
- ✅ Content publishing controls

### Educational System
- ✅ Multi-level hierarchical structure
- ✅ Translation support for all entities
- ✅ Multiple question types (MCQ, FAQ, Descriptive)
- ✅ Difficulty levels (Easy, Medium, Hard)
- ✅ Order management for content sequencing
- ✅ Tag-based categorization
- ✅ Author and source attribution

### General Blogging (GB)
- ✅ Independent blogging hierarchy
- ✅ Category-based organization
- ✅ Rich content creation
- ✅ Multi-language blog support
- ✅ Rating and feedback system

### Admin Interface
- ✅ Search and filtering capabilities
- ✅ Pagination for large datasets
- ✅ Hierarchical relationship display
- ✅ Form validation with error handling
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Responsive design

## 📊 Data Hierarchy

### Educational Content Hierarchy
```
Country
  └── Board
        └── Class (with Language)
              └── Subject (with Language)
                    └── Chapter (with Language)
                          └── Topic (with Language)
                                └── Subtopic (with Language)
                                      └── Questions (MCQ, FAQ, Descriptive)
```

### General Blogging Hierarchy
```
GB Category (Independent, with Language)
  └── GB Topic (with Language)
        └── GB Subtopic (with Language)
              └── GB Question (with Language, Difficulty Level)
```

### Supporting Systems
- **Languages**: Manage supported languages with codes and native names
- **Translations**: Localized content for all entities
- **Ratings**: User feedback for all content types
- **Users**: Authentication and authorization

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (for API)
- **pnpm**: v8 or higher (for WebApp)
- **MongoDB**: Atlas account or local MongoDB instance
- **Cloudinary**: Account for file uploads (optional)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Education-AI-main
```

### 2. Install Dependencies

**For API:**
```bash
cd api
npm install
```

**For WebApp:**
```bash
cd webapp
pnpm install
```

### 3. Environment Configuration

**API Environment Variables**:
Copy the example file and update with your values:
```bash
cd api
cp .env.example .env
```

Edit `api/.env` with your configuration:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
NODE_ENV=development
PORT=8000

# JWT (Legacy Auth)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d

# Logging
LOG_LEVEL=info

# Clerk Authentication (NO NEXT_PUBLIC_ prefix for backend!)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**WebApp Environment Variables**:
Copy the example file and update with your values:
```bash
cd webapp
cp .env.example .env.local
```

Edit `webapp/.env.local` with your configuration:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Clerk URL Configuration (Optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Node Environment
NODE_ENV=development
```

## 💻 Development

### Run Both Services Concurrently
From the root directory:
```bash
npm run dev:all
```

### Run Services Individually

**API Only:**
```bash
cd api
npm run dev
# Runs on http://localhost:3000
```

**WebApp Only:**
```bash
cd webapp
pnpm run dev
# Runs on http://localhost:3001
```

### Build for Production

**API:**
```bash
cd api
npm run build
npm start
```

**WebApp:**
```bash
cd webapp
pnpm run build
pnpm start
```

### Docker Support

**API:**
```bash
cd api
npm run docker:dev      # Development
npm run docker:build    # Production build
npm run docker:run      # Production run
```

## 📁 Project Structure

### API Structure
```
api/
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   │   ├── content/         # Content entity controllers
│   │   ├── auth/            # Authentication controllers
│   │   └── rating/          # Rating system controllers
│   ├── middleware/          # Express middlewares
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts # Global error handling
│   │   └── validate.ts      # Input validation
│   ├── models/              # Mongoose models
│   │   └── content/         # Content entity models
│   ├── routes/              # API routes
│   │   ├── content/         # Content routes
│   │   └── index.ts         # Route aggregation
│   ├── services/            # Business logic
│   │   └── content/         # Content services
│   ├── types/               # TypeScript type definitions
│   │   └── content/         # Content entity types
│   ├── utils/               # Utility functions
│   │   ├── logger.ts        # Winston logger
│   │   └── cloudinary.ts    # File upload
│   └── app.ts               # Express app setup
├── tests/                   # Test files
├── .env.example             # Environment template
└── package.json
```

### WebApp Structure
```
webapp/
├── app/                     # Next.js App Router
│   ├── admin/               # Admin pages
│   │   ├── boards/          # Board management
│   │   ├── classes/         # Class management
│   │   ├── subjects/        # Subject management
│   │   ├── chapters/        # Chapter management
│   │   ├── topics/          # Topic management
│   │   ├── subtopics/       # Subtopic management
│   │   ├── gb-categories/   # GB Category management
│   │   ├── gb-topics/       # GB Topic management
│   │   ├── gb-subtopics/    # GB Subtopic management
│   │   ├── gb-questions/    # GB Question management
│   │   └── ratings/         # Rating management
│   └── layout.tsx           # Root layout
├── components/
│   ├── entity/              # Entity-specific forms
│   │   ├── ClassForm.tsx
│   │   ├── SubjectForm.tsx
│   │   ├── ChapterForm.tsx
│   │   └── ...
│   ├── shared/              # Shared components
│   │   ├── LanguageSelector.tsx
│   │   ├── RatingSystem.tsx
│   │   └── AdminSidebar.tsx
│   ├── table/               # Table components
│   │   └── columns/         # Table column definitions
│   └── ui/                  # Radix UI components
├── lib/
│   ├── api/                 # API client functions
│   │   └── entities/        # Entity API interfaces
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
└── package.json
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Swagger Documentation
```
http://localhost:3000/api-docs
```

### Main Endpoint Categories

#### Authentication
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/auth/me
```

#### Content Management (Example: Chapters)
```
GET    /api/v1/content/chapters                    # Get all chapters
GET    /api/v1/content/chapters/:id                # Get chapter by ID
POST   /api/v1/content/chapters                    # Create chapter
POST   /api/v1/content/chapters/bulk               # Bulk create chapters
PUT    /api/v1/content/chapters/:id                # Update chapter
DELETE /api/v1/content/chapters/:id                # Delete chapter
GET    /api/v1/content/chapters/slug/:slug         # Get by slug
```

#### Language Management
```
GET    /api/v1/content/languages                   # Get all languages
POST   /api/v1/content/languages                   # Create language
PUT    /api/v1/content/languages/:id               # Update language
DELETE /api/v1/content/languages/:id               # Delete language
```

#### Rating System
```
GET    /api/v1/ratings                             # Get all ratings
POST   /api/v1/ratings                             # Create rating
PUT    /api/v1/ratings/:id                         # Update rating
DELETE /api/v1/ratings/:id                         # Delete rating
```

**Note**: Similar endpoints exist for all entities (Board, Class, Subject, Chapter, Topic, Subtopic, GB entities, Questions, etc.)

## 🔑 Key Implementations

### 1. Parent ID Validation
All hierarchical entities validate parent references before creation:

```typescript
// Example: Creating a chapter validates subject_id exists
const validation = await validateSubjectIds([subject_id]);
if (validation.invalid.length > 0) {
  return res.status(400).json({
    message: 'Invalid subject IDs provided',
    invalidIds: validation.invalid
  });
}
```

**Validation Chain:**
- Class → validates `board_id`
- Subject → validates `class_id`
- Chapter → validates `subject_id`
- Topic → validates `chapter_id`
- Subtopic → validates `topic_id`
- GB Topic → validates `gb_category_id`
- GB Subtopic → validates `gb_topic_id`
- GB Question → validates `gb_subtopic_id`

### 2. Language Validation
All content entities validate `language_id` to ensure data integrity:

```typescript
// Validates language exists before creating entity
const languageValidation = await validateLanguageIds([language_id]);
if (languageValidation.invalid.length > 0) {
  return res.status(400).json({
    message: 'Invalid language ID provided',
    invalidIds: languageValidation.invalid
  });
}
```

**Entities with Language Support:**
- Class, Subject, Chapter, Topic, Subtopic
- GB Category, GB Topic, GB Subtopic, GB Question
- All Question types (MCQ, FAQ, Descriptive)

### 3. Cascading Dropdowns
Frontend forms display complete hierarchical context:

```typescript
// Example: Topic form shows Board → Class → Subject → Chapter → Topic
// User selects board → loads classes → selects class → loads subjects, etc.
// API only receives chapter_id, but UI shows full context
```

### 4. CSV Bulk Operations
Admin interface supports CSV upload/download for all entities:

**Example CSV Format (Chapters):**
```csv
board_id, class_id, subject_id, language_id, title, slug, author, tag (comma-separated), source, content, order, is_published
```

### 5. Content Fields
Educational and GB entities include:
- **author**: Content creator/submitter
- **source**: Citation or factual source
- **tag**: Array of keywords for search/discovery
- **content**: Rich HTML content
- **order**: Display sequence control
- **is_published**: Publication status

## 🎨 Admin Interface

### Features
- **Dashboard Navigation**: Sidebar with all entity management links
- **Data Tables**: Sortable, filterable tables with pagination
- **CRUD Forms**: Complete create, read, update, delete operations
- **Hierarchical Context**: Full parent hierarchy displayed in forms
- **Language Selection**: Dropdown selector for language assignment
- **Rich Text Editing**: TipTap editor for content creation
- **CSV Operations**: Upload and download data in bulk
- **Search & Filter**: Find content quickly
- **Responsive Design**: Works on all device sizes

### Admin Routes
```
/admin/countries
/admin/boards
/admin/classes
/admin/subjects
/admin/chapters
/admin/topics
/admin/subtopics
/admin/languages
/admin/mcqs
/admin/faqs
/admin/descriptive-questions
/admin/gb-categories
/admin/gb-topics
/admin/gb-subtopics
/admin/gb-questions
/admin/ratings
```

## 🔒 Security & Performance

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Helmet**: Security headers
- **CORS**: Configured cross-origin requests
- **Rate Limiting**: API request throttling
- **Input Validation**: Express-validator for all inputs
- **Environment Variables**: Sensitive data protection

### Performance Optimizations
- **Database Indexing**: Optimized queries for frequently accessed fields
- **Pagination**: Efficient handling of large datasets
- **Parent Validation Batching**: Bulk validation to reduce DB queries
- **Populate Strategy**: Selective field population
- **Caching Headers**: Proper cache control

### Data Integrity
- **Parent Validation**: Prevents orphaned entities
- **Language Validation**: Ensures valid language references
- **Required Fields**: Enforced at model and controller level
- **Unique Constraints**: Slugs and codes are unique
- **Cascading Relationships**: Proper entity relationships

## 🧪 Testing

```bash
# API tests
cd api
npm test

# WebApp linting
cd webapp
pnpm run lint
```

## 🚀 Deployment

### API Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

### WebApp Deployment
1. Build the application: `pnpm run build`
2. Set production environment variables
3. Start the server: `pnpm start`

### Docker Deployment
Use the provided Docker configurations for containerized deployment.

## 📝 CSV Templates

All entities support CSV operations. Here are some key templates:

**Classes:**
```csv
name, board_id, language_id, grade, content
```

**Subjects:**
```csv
class_id, language_id, code, name, icon, author, tag (comma-separated), source, content
```

**Chapters:**
```csv
board_id, class_id, subject_id, language_id, title, slug, author, tag (comma-separated), source, content, order, is_published
```

**Topics:**
```csv
chapter_id, language_id, title, slug, author, tag (comma-separated), source, content, order, is_published
```

**Subtopics:**
```csv
topic_id, language_id, title, slug, author, tag (comma-separated), source, content, order, is_published
```

## 🤝 Contributing

This is a production educational platform. Follow these guidelines:

1. **Code Style**: Use ESLint and Prettier configurations
2. **TypeScript**: Maintain strict type safety
3. **Validation**: Always validate parent and language IDs
4. **Testing**: Add tests for new features
5. **Documentation**: Update docs for API changes

## 📄 License

[Add your license information here]

## 👥 Authors

Kridhax Team

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for scalability and maintainability
- Production-ready with comprehensive features

---

**Status**: ✅ Production Ready

For detailed API documentation, visit the Swagger UI at `http://localhost:3000/api-docs` when running the API server.
