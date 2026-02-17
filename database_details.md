# MongoDB Database Context for AI (Restaurant / POS System)

This document defines the complete MongoDB database structure.
It is intended to be used ONLY as contextual knowledge for an AI model.
All collections, fields, relations, enums, and behaviors are explicitly defined.
The AI must NOT assume any fields outside this document.

---

## Global Design Principles

* Database: MongoDB
* Multi-tenant system (Organization → Branch)
* Soft business separation via `organization_id` and `branch_id`
* References use `ObjectId`
* Naming convention: `snake_case`
* Time values are stored as ISO `Date` unless explicitly mentioned
* Currency and timezone may exist at both organization and branch level
* Orders are **immutable after completion**, except status updates

---

## Collection: organizations

### Purpose

Represents a business entity (company / restaurant group).

### Fields

```json
{
  "_id": ObjectId,
  "name": string,
  "slug": string,
  "address": string,
  "currency": "AED" | "INR",
  "timezone": string,
  "status": string
}
```

### Rules

* `slug` is **required and unique**
* Default `currency` = "AED"

---

## Collection: branches

### Purpose

Represents physical or virtual outlets under an organization.

### Fields

```json
{
  "_id": ObjectId,
  "organization_id": ObjectId,
  "name": string,
  "code": string,
  "address": string,
  "geo_location": {
    "latitude": string,
    "longitude": string
  },
  "currency": string,
  "timezone": string,
  "supports": {
    "dine_in": boolean,
    "takeaway": boolean,
    "delivery": boolean
  },
  "is_active": boolean
}
```

### Rules

* `code` is unique **within the same organization**
* `organization_id` is mandatory

---

## Collection: categories

### Purpose

Logical grouping of menu items for a specific branch.

### Fields

```json
{
  "_id": ObjectId,
  "name": string,
  "sort_order": number,
  "organization_id": ObjectId,
  "branch_id": ObjectId,
  "is_active": boolean
}
```

---

## Collection: menus

### Purpose

Defines time-based menus (e.g., Breakfast, Lunch, Dinner).

### Fields

```json
{
  "_id": ObjectId,
  "organization_id": ObjectId,
  "branch_id": ObjectId,
  "name": string,
  "start_time": "HH:mm",
  "end_time": "HH:mm",
  "is_active": boolean
}
```

### Rules

* Menu availability depends on time window
* Time comparison is done using branch timezone

---

## Collection: products

### Purpose

Represents the core sellable item independent of menu or pricing.

### Fields

```json
{
  "_id": ObjectId,
  "name": string,
  "sku": string,
  "cost_price": number,
  "base_tax_rate": number,
  "type": "veg" | "non_veg" | "vegan",
  "is_alcohol": boolean,
  "warning_note": string,
  "special_note": string,
  "organization_id": ObjectId,
  "branch_id": ObjectId
}
```

### Rules

* Pricing is NOT stored here
* One product can appear in multiple menus

---

## Collection: menu_items

### Purpose

Connects Product + Menu + Category with selling configuration.

### Fields

```json
{
  "_id": ObjectId,
  "menu_id": ObjectId,
  "category_id": ObjectId,
  "product_id": ObjectId,
  "organization_id": ObjectId,
  "branch_id": ObjectId,
  "selling_price": number,
  "is_available": boolean,
  "prep_time": string,
  "media": [
    {
      "url": string,
      "type": "image" | "video" | "3d"
    }
  ]
}
```

### Rules

* A product becomes sellable ONLY through a menu_item
* Availability is controlled at menu_item level

---

## Collection: orders

### Purpose

Stores customer or staff initiated orders.

### Fields

```json
{
  "_id": ObjectId,
  "order_number": string,
  "organization_id": ObjectId,
  "branch_id": ObjectId,
  "ordered_by": ObjectId,
  "created_by": "CUSTOMER" | "STAFF" | "ADMIN",

  "items": [
    {
      "menu_item_id": ObjectId,
      "name": string,
      "quantity": number,
      "unit_price": number,
      "total_price": number,
      "notes": string
    }
  ],

  "pricing": {
    "sub_total": number,
    "tax": number,
    "service_charge": number,
    "delivery_charge": number,
    "discount": number,
    "total": number,
    "currency": "INR" | "AED"
  },

  "status": {
    "order": "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "DELIVERED" | "COLLECTED" | "OUT_FOR_DELIVERY" | "REJECTED",
    "kitchen": "PENDING" | "IN_PROGRESS" | "COMPLETED",
    "payment": "PENDING" | "PAID" | "FAILED" | "REFUNDED",
    "delivery": "PENDING" | "OUT_FOR_DELIVERY" | "REACHED_DESTINATION" | "DELIVERED"
  },

  "payment": {
    "method": "CASH" | "CARD" | "UPI" | "APPLE_PAY",
    "transaction_id": string,
    "paid_amount": number,
    "paid_at": Date,
    "provider": string
  },

  "delivery": {
    "address": string,
    "partner": "TALABAT" | "IN_HOUSE"
  },

  "remark": string,
  "source": "web" | "POS",
  "action_message": string,

  "created_at": Date,
  "updated_at": Date,
  "served_at": Date,
  "picked_for_delivery_at": Date,
  "delivered_at": Date,
  "takeaway_pick_at": Date
}
```

### Rules

* `order_number` format: `<BRANCH_CODE>_<YEAR>_<7_DIGIT_INCREMENT>`
* Order items store **snapshots**, not live references
* Historical data must not change

---

## Collection: customers

### Purpose

Represents end customers.

### Fields

```json
{
  "_id": ObjectId,
  "full_name": string,
  "phone": string,
  "email": string,
  "is_verified": boolean,
  "login_method": "password" | "google" | "apple",
  "organization_id": ObjectId,
  "branch_id": ObjectId
}
```

---

## Collection: staffs

### Purpose

Employees working at branches.

### Fields

```json
{
  "_id": ObjectId,
  "full_name": string,
  "phone": string,
  "email": string,
  "employee_code": string,
  "role": "WAITER" | "CHEF" | "CASHIER" | "MANAGER",
  "organization_id": ObjectId,
  "branch_id": ObjectId,
  "permissions": {
    "can_create_order": boolean,
    "can_update_order": boolean,
    "can_cancel_payment": boolean,
    "can_handle_payment": boolean
  },
  "work_status": {
    "is_on_duty": boolean,
    "shift_starts": Date,
    "shift_end": Date
  },
  "is_active": boolean
}
```

---

## Collection: admins

### Purpose

Administrative users with cross-branch access.

### Fields

```json
{
  "_id": ObjectId,
  "full_name": string,
  "email": string,
  "phone": string,
  "organization_id": ObjectId,
  "branch_ids": [ObjectId],
  "last_login_at": Date,
  "is_active": boolean
}
```

---

## Relationship Summary

* One Organization → many Branches
* One Branch → many Categories, Menus, Products, Staff, Customers
* One Menu → many Menu Items
* One Product → many Menu Items
* One Order → many Menu Items (snapshot)
* Orders reference Customers OR Staff via `ordered_by`

---

## AI Usage Rules

* Do NOT invent fields
* Do NOT assume SQL joins
* Prefer MongoDB aggregation pipelines
* Always scope queries by `organization_id` and `branch_id`
* Treat order items as immutable historical records
* Pricing must be read from order snapshot, not live menu/product data

---

End of Database Context
