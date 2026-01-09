# friends

A modern social networking platform built with Next.js, featuring real-time chat, video calls, and user matching.

## Features

- **User Authentication**: Secure registration and login system
- **Real-time Chat**: WebSocket-based messaging system
- **Video Calls**: WebRTC-powered video communication
- **User Matching**: Smart matching algorithm for connecting users
- **Contact System**: Built-in contact form with email notifications
- **Responsive Design**: Mobile-first responsive UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Real-time**: WebSocket connections
- **Video**: WebRTC
- **Email**: Nodemailer with Gmail integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB
- Gmail account for email functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Suresh24119/friends.git
cd friends
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
- MongoDB connection string
- JWT secret
- Gmail credentials
- Other required environment variables

5. Run the development server:
```bash
npm run dev
```

6. Start the Socket.io server:
```bash
cd socket-server
node server.js
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat interface
│   ├── components/        # Reusable components
│   ├── contact/           # Contact form
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript definitions
├── lib/                   # Server-side libraries
├── socket-server/         # Socket.io server
├── __tests__/             # Test files
└── .kiro/                 # Kiro specifications
```

## Contact System

The project includes a fully functional contact system with:
- Form validation
- Email notifications
- Rate limiting
- Property-based testing
- Comprehensive error handling

See `CONTACT_SETUP.md` for detailed setup instructions.

## Testing

Run the test suite:
```bash
npm test
```

Run specific tests:
```bash
npm test -- --testPathPatterns="contact"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.