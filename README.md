# Chaos-must-Die

[ChaosMustDie API](https://github.com/Danette10/Chaos-must-Die-API)

## Frontend Documentation

## Table of Contents
- [⚠️ DISCLAIMER ⚠️](#-disclaimer-)
- [Introduction](#introduction)
- [Installation](#installation)
    - [Environment Setup](#environment-setup)
    - [Generate Local Certificates (HTTPS)](#generate-local-certificates-https)
    - [Run Frontend](#run-frontend)
    - [Build extension](#build-extension)
  - [Building web application for production](#building-web-application-for-production)

## ⚠️ DISCLAIMER ⚠️

This project is developed for educational purposes only. The aim is to understand and demonstrate the security risks
associated with C2 and to encourage the development of effective countermeasures. The
author(s) of this project do not endorse any malicious use of the materials provided.

By using or interacting with this software in any way, you agree to use it solely for educational, ethical hacking, and
security research purposes. It is strictly forbidden to use the software for illegal activities, and the author(s) will
not be responsible for any misuse of the software.

All users are encouraged to report any vulnerabilities or security issues found within this software to the author(s)
for improvement. Remember, unauthorized access to computer systems is illegal and punishable by law. Always conduct your
security research within legal boundaries and with proper authorization.

Use this software at your own risk.

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

### Building Web Application for Production

To build the web application for production, run:

```bash
cd apps/web
pnpm run build
```

This will create a production-ready build of the web application in the `dist` directory.
The production build will be optimized for performance and can be deployed to a web server.
To run the production build locally, you can use a simple HTTPS server:

```bash
pnpm run preview
```
