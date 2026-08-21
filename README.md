# Refugee-Resource-Tracking-System
A full-stack DBMS application for disaster relief operations, survivor triage, and camp inventory tracking (Assam Flood scenario). Built with Node.js, Express, SQLite, and vanilla JS.
# 🌊 Calamity Relief & Refugee Resource Allocation System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://sqlite.org/)
[![Status](https://img.shields.io/badge/Status-Completed-success.svg)](#)

A full-stack DBMS project designed to manage displaced survivors, track critical supplies, and streamline resource allocation during natural disasters. The scenario models flood relief operations during the **Assam Inundation Crisis** across districts like *Cachar*, *Dhubri*, and *Nagaon*.

---

## 📸 Key Features

- **⚡ Real-time Dashboard KPIs:** Monitor total survivors, active relief camps, critical health cases, and clean water reserves.
- **👥 Survivor Registration & Triage:** Track displaced individuals by origin village, assign them to relief camps, and flag vulnerable cases (*Elderly*, *Infant*, *Pregnant*, *Critical*).
- **📦 Inventory Stock Management:** Real-time visibility into food, drinking water, medicine, and shelter materials across multiple shelters with low-stock alerts.
- **⛺ Camp Capacity Tracking:** Monitor total shelter capacity versus current occupancy to prevent overcrowding.
- **🌓 Adaptive Theme:** Modern user interface with light and dark mode toggles.
- **🛠️ Full CRUD Support:** Add, edit, and delete camps, survivor entries, and relief inventories dynamically.

---

## 🏗️ System Architecture

```text
refugee-tracking-system/
├── public/                  # Frontend Client
│   ├── index.html           # Single Page Dashboard & Modals
│   ├── style.css            # Custom CSS with Dark/Light Mode Variables
│   └── app.js               # Fetch API Calls & UI State Management
├── database.js              # SQLite Schema Setup & Seed Data
├── server.js                # Express.js REST API Server
├── package.json             # Project Dependencies & Scripts
└── README.md                # Project Documentation
