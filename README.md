# Feedback [Demo](https://your-feedback-project-url.com/)

## Overview

The **Feedback API** is a comprehensive RESTful service designed to manage user feedback through a ticketing system. Users can submit tickets, which are then reviewed by administrators or support agents. The system enables a structured conversation between users and the support team until the issue is resolved. This project was developed to practice the integration of **Prisma** with **MongoDB** and demonstrates modern development practices with scalability and maintainability in mind.

## Key Features

- **User Ticket Management**:
  - Users can create and submit tickets for support issues.
  - Authentication is handled using JWT, ensuring secure access to user-specific tickets.
  - Users can view their own tickets and track the status of each submission.
  - Administrators and support agents can view all tickets, respond to user inquiries, and manage ticket statuses.

- **Commenting System**:
  - Both users and administrators can add comments to tickets, facilitating a dialogue until the issue is resolved.
  - Comments are validated and authenticated to ensure proper access control.

- **Ticket Lifecycle Management**:
  - Support agents can open and close tickets based on the progress of the issue.
  - Tickets are categorized and filtered based on their status, ensuring efficient management of user queries.

- **Database**:
  - The API utilizes **MongoDB** as the primary NoSQL database.
  - **Prisma** is used as the ORM for seamless database interactions, providing a type-safe query builder and migration tools.
  - **Redis** is employed for caching and fast data access, using ioredis to ensure high performance.

- **Email Notifications**:
  - **Nodemailer** is integrated for sending email notifications to users when their tickets are updated or closed.
  - SMTP settings can be configured to customize the email service provider.

- **Caching**:
  - **ioredis** is employed for caching and fast data retrieval, improving the overall performance of the API.

- **File and Media Management**:
  - **Cloudinary** is used for managing any media attachments within the tickets, allowing for smooth upload and retrieval of images or documents.

- **Error Tracking & Monitoring**:
  - **Sentry** is implemented for real-time error tracking and monitoring, ensuring that any issues within the API are quickly identified and resolved.

- **Code Quality**:
  - **ESLint** is used to maintain code quality and consistency across the project.

## Getting Started

To set up the Feedback API, follow these steps:

**Clone the repository**:
```bash
git clone https://github.com/AshkanHagh/feedback.git
```
### Install dependencies:
```bash
cd feedback
bun install
```
### Setup .env file
Create a .env file in the root directory of your project and add the following environment variables:
``` shell
PORT
NODE_ENV
DATABASE_URL
REDIS_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
ACTIVATION_TOKEN
ACCESS_TOKEN
REFRESH_TOKEN
ACCESS_TOKEN_EXPIRE
REFRESH_TOKEN_EXPIRE
ORIGIN
SENTRY_KEY
SMTP_HOST
SMTP_PORT
SMTP_SERVICE
SMTP_MAIL
SMTP_PASSWORD
TIMEOUT_SEC
API_BASEURL
```

### Scripts
```shell
npm run dev # Run in development mode with --watch
npm run db:generate # Generate Prisma client
npm run db:push # Push Prisma schema to the database
```

### License
This project is licensed under the MIT License