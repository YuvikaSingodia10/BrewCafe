# Reasoning Behind the BrewCafe Solution

## 1. Understanding the Problem

BrewCafe is a café rewards management system.

The main requirements are:

- Members should earn points after purchases.
- Members should redeem points for rewards.
- The current points balance should always remain accurate.
- Lifetime earned points should be tracked separately.
- Members should move through different membership tiers.
- Staff should be able to find members using their phone number.
- Staff should be able to search the member list by name, email, or phone number.
- The application should provide a simple and responsive user interface.

## 2. Project Architecture

The project was divided into two parts:

### Frontend

The frontend was developed using React and Vite.

It is responsible for:

- Login interface
- Rewards dashboard
- Current balance display
- Purchase and redemption buttons
- Member lookup
- Member list search
- Tier progress display
- Notifications display
- Logout functionality

### Backend

The backend was developed using Node.js and Express.

It is responsible for:

- Authentication APIs
- Rewards business logic
- Purchase processing
- Redemption processing
- Member lookup
- Member search
- Notifications
- Points expiry processing

### Database

MySQL was used to store application data.

The database contains information related to:

- Users
- Members
- Purchases
- Rewards
- Points transactions
- Notifications

## 3. Rewards Logic

The application maintains two separate point values.

### Current Points Balance

Current points balance represents the points available for redemption.

- A purchase increases the current balance.
- A redemption decreases the current balance.
- A redemption is allowed only when the member has enough points.

### Lifetime Earned Points

Lifetime earned points represent the total points earned by the member.

- Purchases increase lifetime earned points.
- Redemptions do not decrease lifetime earned points.
- Membership tiers are calculated using lifetime earned points.

Keeping these values separate prevents redemption transactions from incorrectly reducing the member's lifetime progress.

## 4. Membership Tiers

The application supports four membership tiers:

- Bronze
- Silver
- Gold
- Platinum

The current tier is calculated from lifetime earned points.

Higher tiers provide improved earning rates. This encourages members to continue using the rewards programme.

The frontend displays:

- Current tier
- Lifetime earned points
- Points required for the next tier

## 5. Authentication

The application provides registration and login APIs.

The login process is:

1. The user enters an email and password.
2. The frontend sends the credentials to the backend.
3. The backend verifies the credentials.
4. The backend returns the user information.
5. The frontend loads the user's reward balance.
6. The dashboard is displayed.

The application uses a test account for evaluation:

- Email: `yuvika3@test.com`
- Password: `123456`

## 6. Purchase Processing

When a purchase is recorded:

1. The user ID and purchase amount are sent to the backend.
2. The backend calculates the points earned according to the member's tier.
3. The purchase is recorded.
4. A points transaction is created.
5. The current balance is updated.
6. Lifetime earned points are updated.
7. The frontend reloads the latest balance.

The frontend uses a reference ID for each purchase so that each purchase can be identified.

## 7. Redemption Processing

When a member redeems points:

1. The user ID and requested points are sent to the backend.
2. The backend checks the available balance.
3. If the balance is sufficient, the redemption is processed.
4. The current points balance decreases.
5. Lifetime earned points remain unchanged.
6. The frontend reloads the updated balance.

If the member does not have enough points, the backend returns an error and the redemption is not completed.

## 8. Phone Lookup

A phone lookup endpoint was added for staff:

```http
GET /api/members/phone/:phone
```

The endpoint searches for a member using their phone number.

The frontend displays:

- Member name
- Phone number
- Membership tier
- Current points balance

If the phone number does not exist, the frontend displays a member-not-found message.

## 9. Member List Search

A member list endpoint was added:

```http
GET /api/members?search=value
```

The search value can match:

- Member name
- Email
- Phone number

When the search field is empty, the member list is loaded without a filter.

The frontend updates the list when the search value changes.

## 10. Notifications

A notifications table was added to the database.

Notifications can be generated for important reward-system events, such as tier changes.

The notification endpoint is:

```http
GET /api/outbox
```

The frontend loads notifications after login and after reward transactions.

If no notifications exist, the frontend displays:

```text
No notifications yet
```

## 11. Points Expiry and Clock Processing

The application includes a clock endpoint:

```http
POST /api/clock
```

This endpoint processes scheduled reward-system operations, including points expiry logic.

The endpoint was tested using curl and returned a successful response.

## 12. Testing Process

The application was tested in the following order:

### Backend Tests

- Health endpoint
- Login endpoint
- Rewards balance endpoint
- Purchase endpoint
- Redemption endpoint
- Member phone lookup endpoint
- Member list endpoint
- Outbox endpoint
- Clock endpoint

### Frontend Tests

- Login using the test account
- Dashboard loading
- Current balance display
- Purchase button
- Points increase after purchase
- Redemption button
- Points decrease after redemption
- Lifetime points remaining unchanged after redemption
- Phone lookup
- Member search by name
- Member search by email
- Member search by phone
- Tier progress display
- Notifications display
- Logout

## 13. Issues Found and Fixes

### Issue 1: Frontend API URL

The frontend needed to communicate with the backend through the GitHub Codespaces forwarded URL.

The API constant in `frontend/src/App.jsx` was updated to use the backend forwarded URL.

### Issue 2: Frontend Server Accessibility

The Vite server was started using:

```bash
npm run dev -- --host 0.0.0.0
```

This allowed the frontend to be accessed through the GitHub Codespaces forwarded port.

### Issue 3: Backend Server Accessibility

The backend was started on port `5000`.

The backend port was forwarded through GitHub Codespaces so that the frontend could communicate with it.

### Issue 4: Member APIs Were Missing

Member lookup and member list routes were added to the backend.

The following endpoints were created:

```http
GET /api/members/phone/:phone
GET /api/members?search=value
```

### Issue 5: Frontend Member Features Were Missing

The React frontend was updated to include:

- Staff member lookup
- Searchable member list
- Member details
- Tier progress
- Notifications
- Logout

### Issue 6: MySQL Access

Direct database access required the MySQL credentials used by the Docker container.

The MySQL container was accessed using Docker commands. SQL commands were executed only after entering the MySQL prompt.

### Issue 7: Spacing and UI Layout

The frontend initially had limited spacing between elements.

The CSS was updated with:

- Better padding
- Larger gaps
- Improved margins
- Styled buttons
- Styled input fields
- Responsive layout
- Separate visual sections

## 14. Final Result

The final BrewCafe solution provides:

- User authentication
- Purchase recording
- Automatic point calculation
- Reward redemption
- Accurate current balance
- Lifetime earned points
- Membership tier progress
- Phone-based member lookup
- Searchable member list
- Notifications
- Points expiry processing
- Responsive user interface

The project is organized into separate frontend and backend folders and includes documentation for setup, API endpoints, testing, and debugging.
