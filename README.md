🌐 HRMS Frontend — Angular + TailwindCSS

Modern, responsive Human Resource Management System (HRMS) frontend built with Angular.
Provides role-based dashboards for Employees, Managers, and Admins with a clean UX/UI.

🚀 Project Summary

This repository contains the frontend application of the HRMS.
It focuses on usability, performance, and accessibility, offering an interface for daily HR tasks such as attendance, leaves, profiles, team management, and admin workflows.


✨ Features

---------------------------------------------------------------------
👨‍💼 User Panel

Personal Dashboard

Profile management

Submit Leave Requests

Submit Attendance Requests

Managers: Manage their own team

---------------------------------------------------------------------
🛠️ Admin Panel

Employee management

Department management

User & Role management

Attendance approvals

Leave approvals

Payroll (in progress)

Performance Reviews (in progress)



---------------------------------------------------------------------
🔑 Shared

JWT-based Authentication (Login / Register)

Role-based route guards (User / Manager / Admin)

--------------------------------------------------------------------------------

🧩 Project Structure

Shared Module → Authentication, guards, services, reusable UI

User Module → Employee & Manager features

Admin Module → HR management features


-------------------------------------------------------------------------------

🛠️ Tech Stack

⚡ Angular (latest)

🎨 TailwindCSS for responsive UI

🟦 TypeScript

🔑 JWT Authentication

🛡 Route Guards (role-based access)



-------------------------------------------------------------------------------------------------------------------------------
🗺️ Routes Overview

User Panel (/user)

/user → Dashboard

/user/profile → Profile

/user/leave-request → Leave request

/user/attendance-request → Attendance request

/user/team → Team (manager only)

Admin Panel (/admin)

/admin → Dashboard

/admin/departments → Departments

/admin/employees → Employees

/admin/users → Users

/admin/leaves → Leaves

/admin/attendance → Attendance

/admin/payroll → Payroll (WIP)

/admin/reviews → Performance Reviews (WIP)

Auth

/login, /register



---------------------------------------------------------------------------------------------------------
🚧 Status

✅ Core Modules completed

🚀 Payroll & Performance Review modules in development

📌 Highlights

📂 Modular architecture (Shared, User, Admin)

🔒 Role-based routing (User / Manager / Admin)

🎨 Clean UI & UX with TailwindCSS


