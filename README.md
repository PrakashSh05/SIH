INCOIS Unified Geospatial Intelligence Platform (MVP)
This repository contains the Minimum Viable Product (MVP) for a modern, unified digital platform for the Indian National Centre for Ocean Information Services (INCOIS). The system is architected as a dynamic intelligence tool, designed to deliver actionable insights by managing structured scientific data and harnessing unstructured data from public sources.


About The Project
The INCOIS platform operates at the critical intersection of oceanography, disaster management, and public information dissemination. This project enhances its mission by providing a powerful tool for ingesting, processing, and visualizing both conventional scientific observations and unconventional data streams like social media.


The completed MVP delivers significant capabilities, including secure data management, advanced geospatial querying, automated hotspot detection, and social media intelligence analysis.

Key Features
Secure Authentication: Full login and signup system for platform access.


Role-Based Access Control (RBAC): Granular, database-enforced permissions for different user types (e.g., 'Researcher', 'Administrator').


Scientific Data Logging: A web interface for researchers to submit scientific observations, including geospatial data.


Automated Intelligence Pipeline: A backend service that automatically ingests social media posts, processes them with Natural Language Processing (NLP) models to determine sentiment and topic, and extracts location entities.

Geospatial Visualization: An interactive map interface in both the web and mobile apps to display collected data points.

Multi-Platform UI: Includes a comprehensive web dashboard for analysis and a field-ready mobile app for data viewing.

Architecture Overview
At its core, this project uses a strategic hybrid architecture that leverages a Backend-as-a-Service (BaaS) platform and a specialized microservice.

Supabase (BaaS): Provides the foundational backend for core data management, user authentication, file storage, and auto-generated APIs. It acts as the primary interface for the frontend clients.


FastAPI Microservice (Intelligence Core): A discrete Python service that functions as a dedicated "intelligence engine". It handles computationally intensive NLP tasks and ingests data from external sources, enriching the primary database.



Technology Stack
Database: Supabase (PostgreSQL with PostGIS extension)

Backend: FastAPI (Python)

Web Frontend: React (TypeScript) with Vite and Mantine UI

Mobile Frontend: Flutter

NLP: Hugging Face Transformers library

Project Setup Guide
Follow these steps to get the entire platform running locally.

Prerequisites
Ensure you have the following software installed:

Node.js (LTS version)

Python (3.8+)

Flutter SDK

Git

Supabase CLI: npm install -g supabase

1. Supabase Database Setup
This stage prepares your cloud database, security, and access roles.

Create Supabase Project:

Go to supabase.com, create a new project.

Save your Project URL, anon key, and the database password.

Initialize & Link Local Project:

In your project's root folder, run npx supabase init.

Link your local environment to your remote project: npx supabase link --project-ref <your-project-id> (enter the database password when prompted).

Set Microservice Password:

Go to the SQL Editor in your Supabase dashboard.

Run the command: ALTER ROLE nlp_service_worker PASSWORD 'your_strong_secure_password_here';

Save this password.

Apply Migrations:

From your project's root directory, run: npx supabase db push.

2. FastAPI Backend Setup
This stage sets up the Python "intelligence core."

Navigate & Create Environment:

cd backend_fastapi

Create and activate a virtual environment (python3 -m venv venv, then source venv/bin/activate or venv\Scripts\activate).

Install Dependencies:

Ensure your requirements.txt file is complete.

Run pip install -r requirements.txt.

Configure Connection:

Create a .env file in the backend_fastapi folder.

Add your DATABASE_URL, using the password you set in the previous section:

DATABASE_URL="postgresql://nlp_service_worker:your_strong_secure_password_here@db.<project-ref>.supabase.co:5432/postgres"
3. Frontend Setup (Web & Mobile)
A. React Web App
Navigate: cd frontend_react

Install Dependencies: npm install

Configure Connection: Create a .env.local file and add your Supabase credentials:

VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
B. Flutter Mobile App
Navigate: cd mobile_flutter

Install Dependencies: flutter pub get

Configure Connection: Create a .env file and add your credentials:

SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
Update pubspec.yaml: Make sure the .env file is listed under assets.

Running the Application
Open three separate terminals to run all services.

Terminal 1 (Backend):

Bash

cd backend_fastapi
source venv/bin/activate
uvicorn app.main:app --reload
Terminal 2 (Web):

Bash

cd frontend_react
npm run dev
Terminal 3 (Mobile):

Bash

cd mobile_flutter
flutter run
Testing the Backend Pipeline
Health Check: Visit http://127.0.0.1:8000/health in your browser.

Trigger Pipeline: Run the following command in a new terminal:

macOS/Linux: curl -X POST http://127.0.0.1:8000/trigger-ingestion

Windows (PowerShell): curl.exe -X POST http://127.0.0.1:8000/trigger-ingestion

Verify Data: Check the social_media_posts table in your Supabase dashboard to see the new, processed data.
