# Authentication Pages Quick Reference

This README provides direct links and descriptions for all authentication-related pages in the RUNACOSS frontend. Use these URLs to quickly open, inspect, and develop each page during local development.

---

## 1. Signup Page
- **URL:** [http://localhost:5173/signup](http://localhost:5173/signup) *(or your current Vite port, e.g., 5174)*
- **Description:**
  - User registration form (first name, last name, email, password)
  - Submits to `/auth/register` backend route
  - On success, redirects to `/verify` with email/password in state

---

## 2. Email Verification Page
- **URL:** [http://localhost:5173/verify](http://localhost:5173/verify)
- **Description:**
  - Enter 6-digit code sent to email
  - Submits to `/auth/verify` backend route
  - Handles invalid/expired code errors inline (no redirect)
  - "Try Again" and "Resend Code" buttons for error recovery
  - On success, redirects to `/login` with prefilled email/password

---

## 3. Login Page
- **URL:** [http://localhost:5173/login](http://localhost:5173/login)
- **Description:**
  - User login form (email, password)
  - Submits to `/auth/login` backend route
  - Only allows login for verified users
  - On success, redirects to `/dashboard`

---

## 4. Forgot Password Page
- **URL:** [http://localhost:5173/forgot-password](http://localhost:5173/forgot-password)
- **Description:**
  - Request password reset (if implemented)

---

## 5. Dashboard (Protected)
- **URL:** [http://localhost:5173/dashboard](http://localhost:5173/dashboard)
- **Description:**
  - Only accessible to logged-in, verified users (JWT protected)

---

## Notes
- If your Vite dev server is running on a different port (e.g., 5174), change the port in the URLs above.
- You can open these URLs directly in your browser to inspect the corresponding page.
- For state-dependent pages (like `/verify`), you may need to go through the signup flow or set sessionStorage values for full functionality.

---

**Happy developing!** 