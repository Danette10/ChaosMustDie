# Chaos-must-Die

## Frontend Documentation

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
    - [Environment Setup](#environment-setup)
    - [Generate Local Certificates (HTTPS)](#generate-local-certificates-https)
    - [Run Frontend](#run-frontend)
    - [Build extension](#build-extension)

## Introduction

The frontend is built with React (Vite + Mantine + Typescript). It communicates with the backend API via HTTPS and
WebSockets.

## Installation

### Environment Setup

Clone the repository and install the dependencies:

```bash
npm install
```

### Generate Local Certificates (HTTPS)

For proper WebSocket and API communication in development mode, the frontend also needs to be served over HTTPS.

Create a directory for certificates and generate self-signed certificates:

```bash
mkdir certs
openssl req -x509 -newkey rsa:4096 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost"
```

You will have two files:

- `certs/cert.pem` (certificate)
- `certs/key.pem` (private key)

These files will be used to serve the frontend with HTTPS.

### Run Frontend

To run the frontend in development mode:

```bash
cd apps/web
pnpm run dev
```

The frontend will be accessible via:

```
https://localhost:5173
```

### Build Extension

To build the frontend for production, run:

```bash
cd apps/extension
pnpm run build
```

This will create a production-ready build of the frontend in the `dist` directory.

**IMPORTANT:**

- Your browser may show a certificate warning (because it's self-signed). Accept it manually.
- The backend API must also be running (see backend README).

---

Now everything (API and frontend) works fully with HTTPS and WebSocket compatibility in local development.

