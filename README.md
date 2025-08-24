# PAYMENT GATEWAY API FOR SMEs

## Overview

This project is a RESTful API designed for small and medium-sized enterprises (SMEs) to accept payments from customers using the Paystack payment gateway. The API collects minimal customer information (first name, last name, phone number, email, amount, state, country) and handles payment initiation and status retrieval without user authentication. API versioning is implemented for better maintainability.

The backend is built using Express.js (Node.js) and integrates with the Paystack SDK. Automated testing is done with Jest, and deployment is handled via a CI/CD pipeline using GitHub Actions.

**Key learning outcomes:** payment gateway integration, RESTful API design for transactions, Express.js proficiency, testing financial operations, CI/CD setup, error handling, and basic compliance considerations.

## Features

- **Payment Initiation:** Create a new payment transaction with customer details and amount.
- **Payment Status Retrieval:** Check the status of a specific payment by ID.
- **Versioning:** All endpoints are versioned (e.g., `/api/v1/`).
- **Minimal Data Collection:** Only essential customer info is required.
- **Status Messages:** Clear success/error messages in responses.
- **No Authentication:** Simplified for demonstration (note: real-world apps should add auth for security).
- **CI/CD Pipeline:** Automated testing and deployment to platforms like Vercel, Netlify, or Render.
- **Testing:** Unit and integration tests for endpoints and Paystack integration using Jest.

## Technologies Used

- **Backend Framework:** Express.js
- **Payment Gateway:** Paystack
- **Testing:** Jest
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel / Netlify / Render

## Installation

### Prerequisites

- Node.js v14+
- Git
- A Paystack account (test keys for development)
- Environment variables for Paystack secrets (see `.env.example`)

### Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/payment-gateway-api.git
   cd payment-gateway-api
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file based on `.env.example` and add your Paystack API keys (e.g., `PAYSTACK_SECRET_KEY=sk_test_...`).

## Running Locally

Run the server:
```sh
npm start
```

The server runs on [http://localhost:3000](http://localhost:3000).

Test the API using tools like Postman or curl.

## API Endpoints

All endpoints follow RESTful best practices and are versioned under `/api/v1/`.

### `POST /api/v1/payments`

Initiate a payment.

**Request Body (JSON):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "email": "john@example.com",
  "amount": 50.00,
  "state": "Lagos",
  "country": "Nigeria"
}
```

**Response (Success):**
```json
{
  "payment": {
    "id": "PAY-123",
    "reference": "paystack_ref_abc",
    "status": "pending"
  },
  "status": "success",
  "message": "Payment initiated successfully."
}
```

### `GET /api/v1/payments/{id}`

Retrieve payment status.

**Response (Success):**
```json
{
  "payment": {
    "id": "PAY-123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "amount": 50.00,
    "status": "completed"
  },
  "status": "success",
  "message": "Payment details retrieved successfully."
}
```

**Error Handling:**  
Responses include `status: "error"` and a descriptive message for failures (e.g., invalid amount, Paystack errors).

## Testing

Tests cover payment initiation, status retrieval, and Paystack integration using Jest.

Run tests:
```sh
npm test
```

Tests ensure:

- Valid requests succeed.
- Invalid data returns errors.
- Paystack interactions are handled correctly (mocked API calls).

## Deployment

The app is deployed to [Vercel / Netlify / Render]. Access it at: [your-deployed-url].

### Manual Deployment

1. Push to GitHub.
2. Connect your repo to the deployment platform.
3. Set environment variables (e.g., `PAYSTACK_SECRET_KEY`) in the platform's dashboard.

## CI/CD Pipeline

Automated via GitHub Actions (see `.github/workflows/node.yml`).

**Triggers:** On push/pull request to `main`.

**Jobs:**
- Install dependencies.
- Run Jest tests.
- Build (if applicable).

For deployment, configure the workflow to deploy to your platform (e.g., add a deploy step using Vercel CLI).

**Example workflow:**
```yaml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x]
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
```

## Documentation

- **Local Setup:** Follow the "Running Locally" section.
- **Tests:** Run `npm test`. Tests are in `/tests/` directory.
- **Deployment:** Use the CI/CD pipeline or manual steps. Monitor GitHub Actions for build status.
- **Payment Gateway:** Uses Paystack. Test with sandbox keys. Switch gateways by updating the integration code and env vars.
- **Security Note:** This is a basic implementation without auth. For production, add JWT/OAuth, HTTPS, and comply with PCI DSS.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Commit changes.
4. Push and open a PR.

## License

MIT License. See LICENSE for details.

---

Happy coding! If you encounter issues, check the Paystack docs or open an issue.