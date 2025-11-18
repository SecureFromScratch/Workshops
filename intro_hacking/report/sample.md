
# Penetration Test Findings Report

## Executive Summary

**Overall Security Posture:**
Medium risk. Several issues allow unauthorized access to internal data and disruption of user workflows.

**Key Risks Identified:**
- Information leakage via verbose errors
- Broken access control on admin actions
- Missing validation in API endpoints

**Most Critical Findings:**
- IDOR on user profile endpoint
- Admin panel exposed without authentication

**Business Impact Summary:**
Attackers could access private user information, modify sensitive settings, or disrupt system availability.

**Recommended Priorities:**

1. Fix the IDOR vulnerability
2. Protect admin endpoints
3. Add centralized input validation

---

## General Information

**Application / System:** Internal Web Portal
**Date:** 18-Nov-2025
**Tester:** QA Security Team
**Scope / Modules Tested:** Authentication, User Dashboard, Admin Panel, REST API

---

# Findings

## 1. Insecure Direct Object Reference (IDOR)

**Category:** Access Control
**Status:** Open
**Path / Location:** `GET /api/user/{id}`
**Parameter:** `id`
**Payload:** `GET /api/user/2` while logged in as user 1

**Description:**
The endpoint returns full profile details of any user ID without verifying ownership.

**Impact:**
An attacker can enumerate all user records and access personal data, including email and phone.

**Severity:** Critical

**Root Cause:**
Server trusts the client-provided user ID and performs no authorization check.

**Recommendation:**
Verify that the authenticated user owns or is authorized to access the requested resource. Enforce user-scoped access via backend logic.

**Evidence / Notes:**
- Response contained another user’s email, phone, and settings.
- No authorization middleware is applied to this route.

---

## 2. Admin Panel Accessible Without Authentication

**Category:** Authentication
**Status:** Open
**Path / Location:** `/admin/dashboard`
**Parameter:** None
**Payload:** Direct GET request from an unauthenticated session

**Description:**
The admin dashboard renders without requiring login. Sensitive system controls are exposed.

**Impact:**
Anyone can view system analytics, modify configurations, or trigger administrative actions.

**Severity:** High

**Root Cause:**
Route is missing authentication and role-based access checks.

**Recommendation:**
Apply authentication middleware and restrict access to users with the `admin` role.

**Evidence / Notes:**
- Visiting `/admin/dashboard` in private browser loads full admin UI.

---

## 3. Information Leakage Through Verbose Error Message

**Category:** Information Disclosure
**Status:** Open
**Path / Location:** `POST /api/login`
**Parameter:** `username`
**Payload:** Invalid username + any password

**Description:**
The login endpoint returns a verbose error disclosing internal exception traces.

**Impact:**
Attackers may learn database structure, SQL queries, or internal libraries, helping target future attacks.

**Severity:** Medium

**Root Cause:**
Unhandled exception printed directly to the response without sanitization.

**Recommendation:**
Replace detailed errors with generic messages and log full stack traces server-side only.

**Evidence / Notes:**
- Response included: `SQLAlchemyError: column users.last_seen does not exist`.

---

# Summary of Findings

| ID | Title                                   | Severity | Status | Path             |
| -- | --------------------------------------- | -------- | ------ | ---------------- |
| 1  | Insecure Direct Object Reference (IDOR) | Critical | Open   | /api/user/{id}   |
| 2  | Admin Panel Accessible Without Login    | High     | Open   | /admin/dashboard |
| 3  | Verbose Error Message                   | Medium   | Open   | /api/login       |


