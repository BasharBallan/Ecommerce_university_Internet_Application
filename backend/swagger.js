const path = require('path');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Documentation",
      version: "1.0.0",
      description: `
# 🔐 Authentication & Quick Test Guide

This API uses **JWT Bearer Tokens** for authentication.
For quick testing, you can directly copy and use the pre-generated tokens below without needing to call the login endpoint.

---

## 🔑 Pre-Generated Test Tokens

### 👑 Admin Token (Full Access / Manager & Admin)
\`\`\`text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWUyODQzMjY5ZTFkMDQ0MGZlZmRjNmYiLCJpYXQiOjE3OTMyMjk4NzUsImV4cCI6MTc5MzIzMTY3NX0.Rnzp0yHYiPVDQ8252zMZKDGiumV16FEUEC9TqjQFBSY
\`\`\`

### 👤 Regular User Token (Customer Access)
\`\`\`text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWUyODQ3ZTY5ZTFkMDQ0MGZlZmRjNzQiLCJpYXQiOjE3OTMyMjk5NTEsImV4cCI6MTc5MzIzMTc1MX0.rrOhw7eVWEPhUl0l6I9kcpcitw8Odar4eSS9-vVPKsU
\`\`\`

---

## 🚀 How to Use Tokens in Swagger

1. Click the **Authorize** button at the top-right corner of the Swagger UI.
2. Paste your token (just the token string, without the word 'Bearer' if the scheme adds it automatically, or as \`Bearer <TOKEN>\`).
3. Click **Authorize**, then **Close**.
4. Now you can test any protected API according to your role permissions.

---

## 📌 Notes
- These tokens are for **testing only**.
- If you receive a **401 Unauthorized** or **403 Forbidden**, make sure you are using the correct token (Admin vs User) for the required endpoint permissions.

Enjoy testing your API!
      `,
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: [
      path.join(__dirname, "./modules/**/*.js"),
      path.join(__dirname, "./routes/**/*.js"),
    ],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
