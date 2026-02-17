# Project Overview & Module Structure (MVP)

This document defines the **complete project overview**, **authentication model**, and **module-wise responsibilities** for the MVP.
It is intended to be used as **AI context** for generating backend (NestJS) and client/admin workflows.
All rules from **Database Context** and **Code Generation Rules** apply here.

---

## 1. Project Overview

This is a **multi-tenant Restaurant / POS platform** consisting of:

* **Client App** (Customer-facing)
* **Admin Panel** (Organization & Branch management)
* **Backend API** (NestJS + MongoDB)

The system supports:

* Multiple organizations
* Multiple branches per organization
* Role-based access control
* Online & POS ordering
* Staff-managed operations

---

## 2. User Types & Roles

### System Actors

| Actor        | Description                                        |
| ------------ | -------------------------------------------------- |
| ORG_ADMIN    | Super admin for an organization                    |
| BRANCH_ADMIN | Admin limited to assigned branches                 |
| STAFF        | Operational users (waiter, chef, cashier, manager) |
| CUSTOMER     | End user placing orders                            |

---

## 3. Authentication & Authorization Model

### Authentication Types

* JWT-based authentication
* Separate auth flows for:

  * Admin
  * Staff
  * Customer

### Token Strategy

* Access Token (short-lived)
* Refresh Token (long-lived)
* Tokens contain:

  * user_id
  * role
  * organization_id
  * branch_id (if applicable)

---

## 4. Auth Modules

### Auth Module (Common)

Responsibilities:

* Login
* Logout
* Token refresh
* Password hashing
* OTP / verification (customer)

Sub-modules:

* admin-auth
* staff-auth
* customer-auth

Guards:

* JwtAuthGuard
* RoleGuard
* OrganizationScopeGuard
* BranchScopeGuard

---

## 5. Admin Panel – Module Breakdown

### 5.1 Organization Module

Actions:

* Create Organization (SYSTEM level)
* Update Organization
* Activate / Deactivate Organization

Roles Allowed:

* ORG_ADMIN

---

### 5.2 Branch Module

Actions:

* Create Branch
* Edit Branch
* Activate / Deactivate Branch

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN (assigned branches only)

---

### 5.3 Admin Management Module

Actions:

* Create Admin
* Edit Admin
* Delete Admin
* Assign Branches

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN (limited)

---

### 5.4 Staff Management Module

Actions:

* Create Staff
* Edit Staff
* Delete Staff
* Assign Roles & Permissions
* Manage Shift Status

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN

---

### 5.5 Category Module

Actions:

* Create Category
* Edit Category
* Reorder Categories
* Activate / Deactivate Category

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN

---

### 5.6 Menu Module

Actions:

* Create Menu
* Edit Menu
* Delete Menu
* Activate / Deactivate Menu

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN

---

### 5.7 Product Module

Actions:

* Create Product
* Edit Product
* Delete Product
* Assign Product to Branch

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN

---

### 5.8 Menu Item Module

Actions:

* Add Product to Menu
* Set Selling Price
* Upload Media
* Toggle Availability

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN

---

### 5.9 Order Management Module (Admin)

Actions:

* List Orders
* Filter Orders by status/date/source
* Update Order Status
* Cancel Orders
* View Order Details

Roles Allowed:

* ORG_ADMIN
* BRANCH_ADMIN
* STAFF (limited)

---

## 6. Client App – Module Breakdown

### 6.1 Customer Auth Module

Actions:

* Register
* Login
* OTP verification
* Social login

---

### 6.2 Menu Browsing Module

Actions:

* List Active Menus
* List Categories
* List Menu Items
* View Product Details

Filters:

* Veg / Non-veg
* Availability
* Price

---

### 6.3 Cart Module

Actions:

* Add Item
* Update Quantity
* Remove Item
* Add Notes

---

### 6.4 Order Placement Module

Actions:

* Place Order
* Choose Dine-in / Takeaway / Delivery
* Apply Discounts
* Select Payment Method

---

### 6.5 Order Tracking Module

Actions:

* View Order Status
* Track Delivery
* View Order History

---

## 7. Staff App / POS Flow

Actions:

* Login
* Create Order
* Update Order Status
* Handle Payment
* Print Bill

---

## 8. Order Lifecycle

1. Order Created
2. Payment Pending
3. Confirmed
4. Preparing
5. Ready
6. Served / Delivered / Collected
7. Completed

---

## 9. Listing & Filtering (Common)

All listing APIs must support:

* Pagination
* Sorting
* Status filtering
* Date range filtering

---

## 10. MVP Non-Functional Requirements

* Role-based access control
* Audit-friendly order records
* Stateless APIs
* Swagger documented endpoints
* Testable services

---

## 11. AI Instructions

* Use this document as **feature scope definition**
* Do not add features outside this MVP
* Follow Database Context strictly
* Follow Code Generation Rules strictly

---

End of Project Overview
