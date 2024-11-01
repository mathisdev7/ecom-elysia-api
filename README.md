> [!NOTE]
> This project is currently under development. Features and functionality may change as the project evolves.

# Elysia Authentication API

This project is an authentication API built using Elysia, Prisma, and JWT. It provides a set of routes for user registration, login, profile management, and user administration.

## Features

- User registration and login
- JWT-based authentication
- User profile management
- Admin-only routes for user management

## Technologies Used

- **Elysia**: A fast and lightweight web framework
- **Prisma**: An ORM for database interactions
- **JWT**: For secure token-based authentication
- **Jest**: For unit testing

## API Endpoints

- `POST /api/v1/users`: Create a new user
- `POST /api/v1/users/login`: Log in a user
- `GET /api/v1/users`: Retrieve all users (admin only)
- `GET /api/v1/users/:id`: Retrieve a specific user (admin only)
- `GET /api/v1/users/profile`: Get the current user's profile
- `PUT /api/v1/users/:id`: Update a user's information (admin only)
- `DELETE /api/v1/users/:id`: Delete a user (admin only)

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/mathisdev7/ecom-elysia-api.git ecom-elysia-api
cd ecom-elysia-api
bun install
```

### Running the API

You can start the API with the following command:

```bash
bun dev
```

## License

This project is licensed under the MIT License.
