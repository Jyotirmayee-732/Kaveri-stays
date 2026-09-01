# 🏨 Kaveri Stays API

A production-style **Hotel Booking REST API** built with **FastAPI, PostgreSQL, SQLAlchemy, JWT Authentication, and RESTful API design**.

Kaveri Stays provides the backend infrastructure for managing properties, rooms, guests, bookings, payments, reviews, authentication, authorization, availability, and property-level reports.

The project focuses not only on CRUD operations, but also on **security, database integrity, transaction management, concurrency control, idempotent payments, rate limiting, and automated testing**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Database](#-database)
- [Authentication & Authorization](#-authentication--authorization)
- [Booking System](#-booking-system)
- [Payment System](#-payment-system)
- [Review System](#-review-system)
- [Availability](#-availability)
- [Concurrency Protection](#-concurrency-protection)
- [Rate Limiting](#-rate-limiting)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Performance](#-performance)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Example API Flow](#-example-api-flow)
- [Frontend](#-frontend)
- [Future Improvements](#-future-improvements)
- [Learning Outcomes](#-learning-outcomes)
- [Author](#-author)

---

# 📖 Overview

**Kaveri Stays** is a hotel and accommodation management backend designed to handle the complete lifecycle of a stay.

The API allows users to:

- Register and authenticate accounts
- Log in using JWT authentication
- Manage guests
- Manage properties
- Manage rooms
- Search room availability
- Create bookings
- Manage booking states
- Record payments
- Prevent duplicate payments
- Submit reviews
- Generate property-level reports
- Enforce role-based permissions

The backend is designed with a strong focus on **data integrity and security**.

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- JWT access tokens
- Refresh tokens
- Logout
- Expired token protection
- Invalid token protection
- JWT signature verification
- Token algorithm validation

## 👥 Role-Based Authorization

Supported roles include:

- `guest`
- `staff`
- `manager`
- `owner`

Different roles have access to different operations.

For example:

| Role | Access |
|---|---|
| Guest | Own bookings, payments, reviews |
| Staff | Booking and operational management |
| Manager | Property management and reports |
| Owner | Higher-level property and revenue access |

---

# 🏨 Property Management

The API supports:

- Property information
- Property-specific rooms
- Room types
- Room occupancy
- Room availability
- Property-level reporting

---

# 🛏️ Room Management

Rooms are associated with:

- Property
- Room type
- Room number
- Maximum occupancy

The API validates guest count against the room type's allowed occupancy.

---

# 📅 Booking Management

Bookings support:

- Guest information
- Property
- Room
- Check-in date
- Check-out date
- Guest count
- Booking status
- Transaction-safe creation
- Cancellation
- Check-in
- Check-out
- No-show handling

Supported booking states:

```text
confirmed
    │
    ├── checked_in
    │       │
    │       └── checked_out
    │
    ├── cancelled
    │
    └── no_show
