# Catch-Up - AI-Powered Freelancer Productivity Platform

A comprehensive AI-powered freelancer productivity platform that provides intelligent, holistic workflow management with extensive customization and context-aware assistance.

## Features

### 🤖 AI Assistant
- **Multi-LLM Support**: Choose from GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, Claude 3 Sonnet, and Claude 3 Opus
- **Full App Access**: AI can manage tasks, projects, clients, bookings, events, and settings
- **Smart Entity Creation**: Two-phase approach - mandatory fields first, then optional enhancements
- **Immediate Analytics**: Comprehensive numerical summaries with detailed breakdowns
- **Natural Language Commands**: Create, update, and manage everything through conversation

### 📊 Project Management
- **Project Tracking**: Create and manage projects with budgets, timelines, and client assignments
- **Task Management**: Organize tasks with priorities, deadlines, and project linking
- **Time Tracking**: Monitor time spent on projects and tasks
- **Client Management**: Store client information with contact details and project history

### 📅 Scheduling & Bookings
- **Appointment Management**: Schedule and manage client appointments
- **Calendar Integration**: Unified calendar view for events and bookings
- **Booking Analytics**: Track appointment patterns and client engagement

### 💰 Financial Management
- **Invoice Generation**: Create and manage invoices for clients
- **Budget Tracking**: Monitor project budgets and profitability
- **Financial Analytics**: Comprehensive reporting on income and expenses

### ⚙️ Customization
- **Theme Support**: Light, dark, and system themes
- **Multi-language**: Support for multiple languages
- **Notification Settings**: Customizable alerts and reminders
- **Dashboard Widgets**: Personalized productivity dashboard

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Shadcn/ui** component library
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database with Drizzle ORM
- **OpenAI API** integration for AI features
- **Session management** with express-session

### Infrastructure
- **Vite** for fast development and builds
- **ESBuild** for optimized bundling
- **Database migrations** with Drizzle Kit

## Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for AI features)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/spirosdimop/Catch-Up.git
cd Catch-Up
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/catch_up

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Session secret
SESSION_SECRET=your_secure_session_secret

# Optional: SendGrid for email notifications
SENDGRID_API_KEY=your_sendgrid_api_key

# Server configuration
NODE_ENV=development
PORT=5000
```

4. **Database setup**
```bash
# Push database schema
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### AI Assistant Commands

The AI assistant understands natural language and can handle various tasks:

**Project Management:**
- "Create a project for Johnson's house renovation, budget $5000, due end of month"
- "How many projects do I have in progress?"
- "Add task 'Design mockups' to the website project"

**Client Management:**
- "Add client John Smith, phone 555-1234, company ABC Corp"
- "How many clients do I have with email addresses?"

**Booking Management:**
- "Schedule appointment with Sarah tomorrow at 3 PM"
- "How many bookings do I have this month?"

**Analytics:**
- "Show me a summary of all my tasks"
- "What's my total project budget?"

### Two-Phase Entity Creation

The system uses a smart two-phase approach:

1. **Phase 1**: Create entities with mandatory fields only
   - Projects: name only
   - Tasks: title only  
   - Clients: firstName, lastName, phone
   - Bookings: date, time only
   - Events: title, startTime only

2. **Phase 2**: Offer optional field enhancements
   - Budget, deadlines, descriptions
   - Contact details, company information
   - Duration, location, notes

## API Endpoints

### AI Assistant
- `POST /api/command` - Process natural language commands

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## Database Schema

### Key Tables
- **users** - User accounts and authentication
- **projects** - Project information and status
- **tasks** - Task management with priorities
- **clients** - Client contact information
- **bookings** - Appointment scheduling
- **time_entries** - Time tracking records
- **invoices** - Financial management

### Relationships
- Projects can have multiple tasks and time entries
- Clients can be linked to projects and bookings
- Tasks can be associated with projects and clients
- Time entries track work on projects and tasks

## Development

### Database Migrations
```bash
# Generate migration
npm run db:generate

# Push schema changes
npm run db:push
```

### Code Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   └── lib/           # Utilities and helpers
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── DatabaseStorage.ts # Database operations
│   └── openai.ts         # AI integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── package.json          # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Update database schema
- `npm run db:generate` - Generate database migrations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for freelancers and productivity enthusiasts