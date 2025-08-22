# Age Verification Test Project

A dummy JavaScript project for testing integration with SafePassage age verification SDK. This project demonstrates both the JavaScript SDK approach and Direct API integration methods.

## Project Structure

```
/
├── package.json          # Project dependencies
├── server.js             # Express backend server
├── README.md            # This file
└── public/              # Static frontend files
    ├── index.html       # Landing page with integration options
    ├── sdk-integration.html    # JavaScript SDK integration demo
    ├── api-integration.html    # Direct API integration demo
    └── protected.html   # Success page (protected content)
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Integration Methods

### Method 1: JavaScript SDK Integration (`/sdk-integration`)

**Features:**
- Simulates the SafePassage JavaScript SDK
- Automatic session creation with public keys
- SDK handles redirect flow automatically
- Simple `verify()` method call
- Redirects to `av.safepassageapp.com` for verification

**Implementation Notes:**
- In a real application, include the actual SafePassage SDK script
- Use your actual public API key
- Configure proper redirect URLs

### Method 2: Direct API Integration (`/api-integration`)

**Features:**
- Creates sessions using REST API calls
- Manual redirect to verification URL
- Session validation on return
- Shows API request/response details
- No SDK dependency required

**API Endpoints:**
- `POST /api/create-session` - Creates verification session
- `GET /api/verify-session` - Handles verification callback
- `POST /api/mock-verify` - Mock verification for testing

## Testing Features

Both integration pages include:
- **Live Integration Button** - Redirects to actual SafePassage URL (will not work without real credentials)
- **Mock Verification Button** - Simulates successful verification for testing the flow

## Session Management

- Uses Express sessions to track verification state
- Protected routes require successful verification
- `/logout` endpoint to clear sessions
- Session expires after 24 hours

## Protected Content

After successful verification:
- Users are redirected to `/protected` page
- Page shows success message and user options
- Access is session-based and persistent until logout

## Mock Implementation Notes

This is a **demo/testing project** with mock implementations:

- SafePassage API calls are mocked
- Real integration would require actual SafePassage credentials
- Verification URLs redirect to real SafePassage but won't work without setup
- Mock verification buttons simulate successful verification for testing

## Real Implementation Requirements

For production use, you would need to:

1. **Get SafePassage Credentials**
   - Public API key for SDK integration
   - Private API key for server-side calls
   - Configure allowed domains/URLs

2. **Replace Mock Code**
   - Include actual SafePassage SDK script
   - Use real API endpoints
   - Handle actual API responses and errors

3. **Security Considerations**
   - Implement proper session security
   - Add HTTPS in production
   - Validate all API responses
   - Handle edge cases and errors

## Development

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Dependencies

- **express** - Web framework
- **express-session** - Session management
- **axios** - HTTP client for API calls