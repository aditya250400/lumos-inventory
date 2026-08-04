# Lumos Inventory

## About

Lumos Inventory is a web-based inventory management system designed to help teams manage tools and equipment such as SSDs, HDDs, hand tools, networking devices, CCTV equipment, and other company assets.

Previously, all inventory data was managed using multiple Google Sheets—one sheet for each item category. As the number of categories grew, maintaining different columns and generating reports became increasingly difficult.

Lumos Inventory was built to solve this problem by providing a centralized, flexible, and scalable inventory management system that can easily adapt to new categories and business requirements.

---

## Features

### 📦 Item Management

Manage all inventory items from a single place.

Every item belongs to a category and a storage location. Each category can define its own custom attributes, allowing different types of inventory to store different information.

For example:

- **SSD** may have Capacity, Interface, and Serial Number.
- **Hand Tools** may only require Name and Condition.
- **Power Adapters** may store Output Voltage and Connector Type.

This flexible approach allows new inventory categories to be added without changing the application's core structure.

---

### 📍 Location Management

Organize inventory with hierarchical storage locations.

Locations can contain multiple sub-locations when needed.

Example:

- Maranatha
  - Desk A
  - Desk B
  - Technician Cabinet

Meanwhile, simpler locations such as **Kembar** can exist without any child locations.

---

### 📋 Stock Opname

Simplify physical inventory audits.

The system compares the actual physical stock with the recorded inventory and automatically highlights any discrepancies, making stock audits faster and more accurate.

---

### 🔄 Borrowing Management

Track every inventory borrowing transaction.

Each borrowing record stores information such as:

- Borrower
- Borrow Date
- Return Date
- Current Status

This makes it easy to identify items that have not yet been returned.

---

### 📊 Reports

Generate inventory reports with filters such as:

- Location
- Category
- Date Range

Reports can also be exported to:

- Excel
- PDF

---

### 📈 Dashboard

Get a quick overview of your inventory through an interactive dashboard.

Including:

- Total inventory items
- Borrowed items
- Damaged or missing items
- Overdue borrowing reminders
- Pending stock opname discrepancies

---

## Technology Stack

Built with modern technologies for scalability and maintainability.

### Backend

- Laravel 12
- Laravel Breeze
- Spatie Roles & Permissions

### Frontend

- React
- Inertia.js
- Tailwind CSS
- shadcn/ui
- Tabler Icons

---

## Development Principles

This project follows several principles during development:

- Avoid storing data that can be derived automatically to keep data consistent.
- Combine related forms into a single submission flow for a better user experience.
- Design a flexible data structure so new inventory categories can be added without major database or code changes.
- Focus on simplicity and usability to make inventory management fast and efficient for the entire team.
