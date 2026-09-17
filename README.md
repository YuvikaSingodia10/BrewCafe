# BrewCafe Rewards System

BrewCafe is a full-stack café rewards management application.

The application allows café members to earn points on purchases, redeem points for rewards, view their current balance, and move through different membership tiers.

Staff can search for members using their phone number and can also search the member list by name, email, or phone number.

## Features

- User registration and login
- Member rewards balance
- Purchase recording
- Automatic points calculation
- Reward redemption
- Bronze, Silver, Gold, and Platinum tiers
- Tier progress display
- Phone number member lookup
- Searchable member list
- Notifications/outbox
- Points expiry processing
- Responsive frontend interface
- Logout functionality

## Technology Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MySQL
- Docker

## Project Structure

```text
BrewCafe/
├── README.md
├── REASONING.md
├── AI_LOGS.md
├── backend/
│   ├── server.js
│   ├── package.json
│   └── scr/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       └── routes/
│           ├── auth.routes.js
│           ├── rewards.routes.js
│           └── members.routes.js
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── App.jsx
        ├── App.css
        └── main.jsx
```

## Prerequisites

Install the following software:

- Node.js
- npm
- Docker
- Git
- GitHub Codespaces or a local development environment

## Backend Setup

Open a terminal in the project root:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Start the backend server:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

## Frontend Setup

Open a second terminal:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev -- --host 0.0.0.0
```

The frontend normally runs on:

```text
http://localhost:5173
```

### GitHub Codespaces

In GitHub Codespaces:

1. Open the **Ports** tab.
2. Find port `5173`.
3. Set its visibility to **Public** if required.
4. Open the forwarded frontend URL.

The backend port `5000` must also be forwarded and accessible to the frontend.

## Database Setup

The application uses MySQL running through Docker.

Check whether the MySQL container is running:

```bash
docker ps
```

The database name is:

```text
brewcafe
```

The MySQL container used by the project is:

```text
brewcafe-mysql
```

Check MySQL container logs:

```bash
docker logs brewcafe-mysql
```

The database configuration is located at:

```text
backend/scr/config/db.js
```

## API Endpoints

All API endpoints use the following base URL:

```text
http://localhost:5000/api
```

### Health Check

```http
GET /api/health
```

Checks whether the backend server is running.

Example:

```bash
curl http://localhost:5000/api/health
```

### Authentication

#### Register a User

```http
POST /api/auth/register
```

Example request:

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Test@123"
}
```

Example curl command:

```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"Test User","email":"testuser@example.com","password":"Test@123"}'
```

#### Login

```http
POST /api/auth/login
```

Example request:

```json
{
"email":"yuvika3@test.com","password":"123456"

}
```

Example curl command:

```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"yuvika3@test.com","password":"123456"}'
```

### Rewards

#### Get Member Balance

```http
GET /api/rewards/balance/:userId
```

Returns:

- Current points balance
- Lifetime earned points
- Current membership tier

Example:

```bash
curl http://localhost:5000/api/rewards/balance/1
```

#### Record a Purchase

```http
POST /api/rewards/purchase
```

Example request:

```json
{
  "userId": 1,
  "amount": 100,
  "referenceId": "ORDER-123"
}
```

Example curl command:

```bash
curl -X POST http://localhost:5000/api/rewards/purchase \
-H "Content-Type: application/json" \
-d '{"userId":1,"amount":100,"referenceId":"ORDER-123"}'
```

The purchase endpoint calculates the appropriate points based on the member's tier.

#### Redeem Points

```http
POST /api/rewards/redeem
```

Example request:

```json
{
  "userId": 1,
  "points": 50,
  "rewardName": "Free Coffee"
}
```

Example curl command:

```bash
curl -X POST http://localhost:5000/api/rewards/redeem \
-H "Content-Type: application/json" \
-d '{"userId":1,"points":50,"rewardName":"Free Coffee"}'
```

The redemption endpoint checks whether the member has enough available points before completing the redemption.

### Members

#### Find Member by Phone Number

```http
GET /api/members/phone/:phone
```

Finds a member using their phone number.

Example:

```bash
curl http://localhost:5000/api/members/phone/9876543210
```

The response can include:

- Member name
- Phone number
- Membership tier
- Current points balance

#### Search Members

```http
GET /api/members?search=value
```

Searches members by:

- Name
- Email
- Phone number

Example:

```bash
curl "http://localhost:5000/api/members?search=test"
```

To return the member list without a search filter:

```bash
curl "http://localhost:5000/api/members?search="
```

### Notifications and Clock

#### Get Notifications

```http
GET /api/outbox
```

Returns generated notifications, such as tier-related notifications.

Example:

```bash
curl http://localhost:5000/api/outbox
```

#### Process Clock Operations

```http
POST /api/clock
```

Processes scheduled reward-system operations, including points expiry processing.

Example:

```bash
curl -X POST http://localhost:5000/api/clock
```

## Rewards and Tier Logic

The application maintains two important point values.

### Current Points Balance

This is the number of points currently available for redemption.

Purchases increase the current balance, while redemptions decrease it.

### Lifetime Earned Points

This is the total number of points earned by the member over time.

Redemptions do not reduce lifetime earned points.

### Membership Tiers

The application supports the following tiers:

- Bronze
- Silver
- Gold
- Platinum

The tier is calculated using lifetime earned points.

Members can earn points at different rates depending on their tier.

## Testing

### Backend Health Test

Run:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "BrewCafe API is running"
}
```

### Login Test

1. Open the frontend URL.
2. Enter a registered email and password.
3. Click Login.
4. Confirm that the dashboard opens.

### Purchase Test

1. Login to the application.
2. Note the current points balance.
3. Click **Record ₹100 Purchase**.
4. Confirm that points increase.
5. Confirm that lifetime earned points increase.
6. Refresh the page and verify that the updated balance remains correct.

### Redemption Test

1. Login to the application.
2. Confirm that the account has enough points.
3. Click **Redeem 50 Points**.
4. Confirm that the current balance decreases by 50 points.
5. Confirm that lifetime earned points remain unchanged.
6. Try redeeming more points than the available balance and verify that an error is shown.

### Phone Lookup Test

1. Enter a registered member phone number.
2. Click **Find Member**.
3. Confirm that the correct member is displayed.
4. Verify the member name, phone, tier, and balance.
5. Enter an incorrect phone number.
6. Confirm that a member-not-found message is displayed.

### Member List Search Test

Search using:

- Member name
- Email address
- Phone number

Confirm that:

- Matching members are displayed.
- Search results update correctly.
- Clearing the search shows the complete member list.
- An unmatched search displays an appropriate empty-state message.

### Tier Test

Increase lifetime earned points through purchases and check whether the tier changes automatically:

- Bronze to Silver
- Silver to Gold
- Gold to Platinum

Confirm that:

- The tier is updated automatically.
- The points earning rate changes according to the tier.
- A tier-related notification is generated when applicable.

### Notifications Test

Run:

```bash
curl http://localhost:5000/api/outbox
```

Confirm that the endpoint returns the notifications list.

The frontend also contains a Notifications section that displays available notifications.

### Clock Test

Run:

```bash
curl -X POST http://localhost:5000/api/clock
```

Confirm that the endpoint returns a successful response.

## Debugging

### Backend Does Not Start

Check whether port `5000` is available:

```bash
curl http://localhost:5000/api/health
```

Start the backend again:

```bash
cd backend
node server.js
```

### Frontend Does Not Open

Start Vite with the host option:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open port `5173` from the GitHub Codespaces Ports tab.

### Frontend Cannot Connect to Backend

Check the API URL in:

```text
frontend/src/App.jsx
```

Make sure it points to the forwarded backend URL and includes `/api`.

Also confirm that backend port `5000` is running and publicly forwarded when using GitHub Codespaces.

### Database Connection Error

Check running Docker containers:

```bash
docker ps
```

Check the MySQL container logs:

```bash
docker logs brewcafe-mysql
```

Check the database configuration:

```text
backend/scr/config/db.js
```

### Check Git Status

From the project root:

```bash
git status
```

### Commit and Push Changes

```bash
cd /workspaces/BrewCafe
git add .
git commit -m "Complete BrewCafe rewards application"
git push origin main
```

## Final Result

BrewCafe provides a complete café rewards workflow with:

- Authentication
- Purchase recording
- Automatic point calculation
- Reward redemption
- Tier management
- Member phone lookup
- Member search
- Notifications
- Points expiry processing
- Responsive frontend interface
