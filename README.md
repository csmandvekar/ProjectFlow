# ProjectFlow - Collaborative Project Management Application

A full-stack MERN application that serves as a collaborative project management tool, allowing teams to manage projects, tasks, and collaborate in real-time.

## 🎥 Video Demo

Watch the complete application demo: [ProjectFlow Demo Video](https://drive.google.com/file/d/1AE31lQcih6_aTSnp1HDpvBxs0DJshDtO/view?usp=sharing)

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Project Management**: Create, edit, delete, and manage projects with team collaboration
- **Task Management**: Full CRUD operations with multiple assignees, priorities, and status tracking
- **Real-time Collaboration**: Live updates using Socket.io for task changes and comments
- **Team Management**: Invite team members, role-based permissions, and team-based project access
- **Search & Filter**: Advanced search functionality across projects and tasks with multiple filters

- **In-app Notifications**: Real-time notifications for task assignments, comments, and team invitations
- **Dashboard Analytics**: Project statistics with Chart.js visualizations

### Advanced Features
- **Role-based Access Control**: Owner, Admin, Member, and Viewer roles with granular permissions
- **Multiple Task Assignees**: Assign tasks to multiple users with primary/secondary roles
- **Real-time Updates**: Live collaboration with instant updates

- **Responsive Design**: Mobile-friendly UI with modern design patterns

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time features
- **Cloudinary** for file storage

- **bcryptjs** for password hashing
- **Helmet** for security

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Zustand** for state management
- **React Router DOM** for routing
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Chart.js** for data visualization
- **Socket.io Client** for real-time features
- **Axios** for API calls

## 📁 Project Structure

```
ProjectFlow/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── projectController.js  # Project CRUD operations
│   │   ├── taskController.js     # Task management
│   │   ├── teamController.js     # Team management
│   │   ├── notificationController.js # Notifications
│   │   └── searchController.js   # Search functionality
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── sanitize.js          # Input sanitization
│   │   ├── upload.js            # File upload handling
│   │   └── taskPermissions.js   # Task permission logic
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Project.js           # Project schema
│   │   ├── Task.js              # Task schema
│   │   └── Team.js              # Team schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── projects.js          # Project routes
│   │   ├── tasks.js             # Task routes
│   │   ├── team.js              # Team routes
│   │   ├── notifications.js     # Notification routes
│   │   └── search.js            # Search routes
│   ├── services/
│   │   └── notificationService.js # Notification service
│   ├── scripts/
│   │   ├── migrateTaskAssignees.js # Data migration
│   │   └── migrateProjects.js   # Project migration
│   └── src/
│       └── server.js            # Main server file
├── frontend3/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── kanban/          # Kanban board components
│   │   │   ├── layout/          # Layout components
│   │   │   ├── notifications/   # Notification components
│   │   │   ├── projects/        # Project components
│   │   │   ├── search/          # Search components
│   │   │   ├── tasks/           # Task components
│   │   │   └── ui/              # Reusable UI components
│   │   ├── lib/
│   │   │   ├── stores/          # Zustand stores
│   │   │   ├── api.ts           # API configuration
│   │   │   ├── socket.ts        # Socket.io service
│   │   │   └── utils.ts         # Utility functions
│   │   ├── pages/               # Page components
│   │   └── App.tsx              # Main app component
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)


### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProjectFlow
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend3
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/projectflow
   # or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/projectflow
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

   Create a `.env` file in the frontend3 directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Database Setup**
   
   Run the scripts to set up the database:
   ```bash
   cd backend
   node scripts/migrateTaskAssignees.js
   node scripts/migrateProjects.js
   ```

6. **Admin User Setup**
   
   To create an admin user, you need to manually update the user role in the database:
   
   **Option 1: Using MongoDB Compass/Atlas**
   1. Connect to your MongoDB database
   2. Navigate to the `users` collection
   3. Find your user document
   4. Update the `role` field from `"member"` to `"admin"`
   
   **Option 2: Using MongoDB Shell**
   ```javascript
   // Connect to your database
   use projectflow
   
   // Update user role to admin (replace with your email)
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
   
   **Option 3: Using the createDefaultTeam script**
   ```bash
   cd backend
   node scripts/createDefaultTeam.js
   ```
   This script will create a default team and set the first user as admin.

7. **Start the application**
   
   Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   
   Start the frontend development server:
   ```bash
   cd frontend3
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Project Endpoints
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member

### Task Endpoints
- `GET /api/projects/:projectId/tasks` - Get project tasks
- `POST /api/projects/:projectId/tasks` - Create a new task
- `GET /api/projects/:projectId/tasks/:taskId` - Get task details
- `PATCH /api/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete task
- `POST /api/projects/:projectId/tasks/:taskId/comments` - Add comment
- `POST /api/projects/:projectId/tasks/:taskId/upload` - Upload file
- `DELETE /api/projects/:projectId/tasks/:taskId/attachments/:attachmentId` - Delete file

### Team Endpoints
- `GET /api/team/list` - Get user's teams
- `GET /api/team/members` - Get team members
- `POST /api/team/invite` - Invite team member
- `POST /api/team/accept` - Accept team invitation
- `POST /api/team/reject` - Reject team invitation

### Search Endpoints
- `GET /api/search` - Search projects and tasks
- `GET /api/search/filters` - Get search filter options

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔧 Real-time Features

The application uses Socket.io for real-time collaboration:

### Socket Events
- `join-project` - Join a project room
- `leave-project` - Leave a project room
- `task-update` - Broadcast task updates
- `user-joined` - Notify when user joins
- `user-left` - Notify when user leaves

### Real-time Updates
- Task status changes


## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface with Notion-like design
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Real-time Indicators**: Live collaboration indicators and notifications
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Sanitization**: Protection against XSS attacks
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet Security**: Security headers and protection


## 📊 Performance Features

- **Database Indexing**: Optimized MongoDB queries with proper indexing
- **Bundle Optimization**: Vite for fast builds and hot reloading
- **Efficient State Management**: Zustand for optimized React state management

## 🧪 Testing

The application includes basic authentication testing to ensure the core functionality works correctly.

### Backend Tests
- **Authentication Tests**: User registration, login, and JWT token validation
- **Test Coverage**: Sign-in functionality only (as requested)

### Running Tests
```bash
# Backend tests (Authentication only)
cd backend
npm test
```

### Test Files
- `backend/tests/auth.test.js` - Authentication test suite

### Test Scenarios Covered
- ✅ User registration with valid data
- ✅ User registration with duplicate email
- ✅ User registration with invalid email
- ✅ User registration with short password
- ✅ User login with valid credentials
- ✅ User login with invalid email
- ✅ User login with invalid password
- ✅ Get current user with valid token
- ✅ Get current user without token
- ✅ Get current user with invalid token

## 🧠 Implementation Logic & AI Integration

### Core Logic Implemented

#### 1. **Authentication & Authorization Logic**
- **JWT Token Management**: Secure token-based authentication with automatic refresh
- **Password Security**: bcryptjs hashing with salt rounds for secure password storage
- **Role-based Access Control**: Hierarchical permission system (Owner > Admin > Member > Viewer)
- **Session Management**: Persistent login state with Zustand store

#### 2. **Real-time Collaboration Logic**
- **Socket.io Integration**: Event-driven real-time updates for task changes, comments, and file uploads
- **Room Management**: Project-based rooms for targeted real-time communication
- **User Presence**: Track active users in projects with join/leave notifications
- **Conflict Resolution**: Optimistic updates with server-side validation

#### 3. **Data Management Logic**
- **MongoDB Aggregation**: Complex queries for project statistics and member workload
- **Population Strategy**: Efficient data fetching with selective field population
- **Migration Scripts**: Database schema evolution with backward compatibility
- **Data Validation**: Server-side validation with express-validator

#### 5. **Search & Filter Logic**
- **Text Search**: MongoDB regex-based search across multiple fields
- **Filter Combination**: Multiple filter criteria with AND/OR logic
- **Performance Optimization**: Indexed queries for fast search results
- **Pagination**: Efficient data loading with limit/offset strategy

### AI Integration Possibilities

#### 1. **Task Management AI**
```javascript
// AI-powered task suggestions based on project description
const generateTaskSuggestions = async (projectDescription) => {
  const prompt = `Based on this project description: "${projectDescription}", 
  suggest 5-10 specific tasks that should be created. Return as JSON array.`;
  
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo",
    prompt: prompt,
    max_tokens: 500
  });
  
  return JSON.parse(response.choices[0].text);
};
```

#### 2. **Priority Assignment AI**
```javascript
// AI-powered priority assignment based on task content and deadline
const assignTaskPriority = async (taskTitle, taskDescription, deadline) => {
  const prompt = `Analyze this task and assign priority (low/medium/high):
  Title: "${taskTitle}"
  Description: "${taskDescription}"
  Deadline: "${deadline}"
  
  Consider urgency, complexity, and deadline proximity. Return only: low, medium, or high`;
  
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo",
    prompt: prompt,
    max_tokens: 10
  });
  
  return response.choices[0].text.trim().toLowerCase();
};
```

#### 3. **Project Progress AI**
```javascript
// AI-generated project status summaries
const generateProgressSummary = async (projectData, tasks) => {
  const prompt = `Generate a concise project status summary:
  Project: "${projectData.title}"
  Description: "${projectData.description}"
  Tasks: ${JSON.stringify(tasks.map(t => ({title: t.title, status: t.status, priority: t.priority})))}
  
  Include completion percentage, key achievements, and next steps. Keep it under 200 words.`;
  
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo",
    prompt: prompt,
    max_tokens: 300
  });
  
  return response.choices[0].text;
};
```

#### 4. **Smart Task Assignment AI**
```javascript
// AI-powered task assignment based on member skills and workload
const suggestTaskAssignment = async (taskData, teamMembers) => {
  const prompt = `Suggest the best team member for this task:
  Task: "${taskData.title}" - "${taskData.description}"
  Priority: ${taskData.priority}
  Deadline: ${taskData.deadline}
  
  Team Members: ${JSON.stringify(teamMembers.map(m => ({name: m.name, currentTasks: m.taskCount, skills: m.skills})))}
  
  Consider workload, skills, and availability. Return the member's name and reasoning.`;
  
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo",
    prompt: prompt,
    max_tokens: 200
  });
  
  return response.choices[0].text;
};
```

#### 5. **Comment Sentiment Analysis**
```javascript
// AI-powered comment sentiment analysis for team health monitoring
const analyzeCommentSentiment = async (comment) => {
  const prompt = `Analyze the sentiment of this team comment:
  "${comment}"
  
  Return: positive, negative, or neutral. Also provide a brief explanation.`;
  
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo",
    prompt: prompt,
    max_tokens: 100
  });
  
  return response.choices[0].text;
};
```

### AI Integration Implementation Strategy

#### 1. **Environment Setup**
```env
# Add to .env file
OPENAI_API_KEY=your-openai-api-key
AI_ENABLED=true
```

#### 2. **Backend AI Service**
```javascript
// backend/services/aiService.js
const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateTaskSuggestions(projectDescription) {
    // Implementation as shown above
  }

  async assignTaskPriority(taskData) {
    // Implementation as shown above
  }

  async generateProgressSummary(projectData, tasks) {
    // Implementation as shown above
  }
}

module.exports = new AIService();
```

#### 3. **Frontend AI Integration**
```typescript
// frontend3/src/lib/aiService.ts
export class AIService {
  static async generateTaskSuggestions(projectDescription: string) {
    const response = await api.post('/ai/generate-tasks', {
      description: projectDescription
    });
    return response.data;
  }

  static async getSmartAssignments(taskData: any) {
    const response = await api.post('/ai/suggest-assignment', taskData);
    return response.data;
  }
}
```

#### 4. **AI Features UI Components**
```typescript
// AI-powered task creation component
const AITaskGenerator = () => {
  const [suggestions, setSuggestions] = useState([]);
  
  const generateSuggestions = async () => {
    const tasks = await AIService.generateTaskSuggestions(projectDescription);
    setSuggestions(tasks);
  };

  return (
    <div className="ai-task-generator">
      <Button onClick={generateSuggestions}>
        🤖 Generate AI Task Suggestions
      </Button>
      {suggestions.map(task => (
        <TaskSuggestion key={task.id} task={task} />
      ))}
    </div>
  );
};
```

### AI Integration Benefits
- **Automated Task Creation**: Reduce manual work in project setup
- **Smart Prioritization**: AI-driven priority assignment based on context
- **Progress Insights**: Automated project status reporting
- **Team Optimization**: AI-powered resource allocation
- **Sentiment Monitoring**: Track team morale through comment analysis

## 🚀 Deployment

### Environment Variables for Production
```env
# Backend
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/projectflow
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-backend-url.com
```



## 🎯 Future Enhancements

- **AI Integration**: AI-powered task suggestions and project summaries (as detailed above)
- **Advanced Analytics**: More detailed project analytics and insights
- **Mobile App**: React Native mobile application
- **Integrations**: Slack, GitHub, and other tool integrations
- **Time Tracking**: Built-in time tracking for tasks
- **Advanced Search**: Full-text search with Elasticsearch
- **Workflow Automation**: Custom workflow automation rules


