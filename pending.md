# Pending Tasks

This document tracks technical debt, delayed implementations, and tasks that need to be revisited.

## Technical Debt & Infrastructure
- [ ] **Redis Implementation**: We temporarily disabled Redis (`DISABLE_REDIS=true` in `.env`) to allow for local testing without a Redis server. 
  - **Action Required**: Re-enable Redis and ensure `rate-limit.middleware.ts` and `redis.ts` are working correctly with a live Redis instance.
- [ ] **BullMQ Setup (ID10)**: This task requires Redis to be active. Once Redis is fully implemented and running locally/in-production, set up BullMQ for the async sync queues.

## Backend Features
- [ ] **Authentication Endpoints (ID3)**: Implement email/password registration & login endpoints.
- [ ] **JWT & Token Management (ID4)**: Access/refresh token flows.
- [ ] **Implementation of PostgreSQL in Authentication**: Ensure the auth system is properly wired to use PostgreSQL for storing and verifying credentials.

*(Add new pending tasks here as they arise)*
