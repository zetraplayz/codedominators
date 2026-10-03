# RIT Connect Plus - Project Summary & Technical Documentation

## 1. Executive Summary
**RIT Connect Plus** is a production-ready, highly secure institutional communication and resource-sharing platform built specifically for the **Ramco Institute of Technology, Rajapalayam**. Designed with a focus on administrative control, role-based access, and modern developer experience, it serves as the central "Faculty Hub" connecting Administrators, Heads of Departments (HOD), and Staff members.

## 2. Product Identity
*   **Institution:** Ramco Institute of Technology, Rajapalayam
*   **Admin Identity:** Code Dominator
*   **Primary User Roles:** `ADMIN`, `HOD`, `STAFF`
    *   *Note: There are no student or external guest roles. Access is strictly institutional.*

## 3. Core Features & Capabilities

### A. Role-Based Resource Management
*   **Secure Storage & Distribution:** Faculty can upload resources (PDFs, PPTXs, DOCXs) which are securely stored.
*   **Granular Visibility:** Resources can be marked as `PRIVATE`, `DEPARTMENT_DISCOVERABLE`, or `INSTITUTION_DISCOVERABLE`.
*   **Access Requests:** Staff can request access to private resources. Upon approval, the system automatically forks a localized copy of the resource to the requester, preserving the original author's integrity.
*   **Versioning:** Built-in version control for resources allowing updates without breaking existing links.

### B. AI-Powered Teaching Conversation (MESH)
*   **Contextual Chat:** A dedicated AI Assistant ("MESH") that has access to the user's specific context (authorized resources, department info).
*   **Summarization & Q&A:** Staff can ask questions about specific documents, summarize large teaching kits, and generate study materials.

### C. Real-time Communication
*   **WebRTC Video & Audio Calls:** Integrated high-quality, peer-to-peer WebRTC calling infrastructure supporting video and audio conferencing.
*   **STUN/TURN Support:** Built-in NAT traversal mechanisms ensuring connectivity across restricted institutional networks.

### D. Administrative & Developer Controls
*   **System Settings Engine:** A dynamic key-value configuration system allowing on-the-fly toggling of global states.
*   **Maintenance Mode:** An administrative toggle that restricts all non-admin access and displays a maintenance animation, ensuring safe deployment windows.
*   **Developer Control Mode:** A privileged toggle that activates developer-only features and applies a distinctive UI theme (White/Black/Red) for visual differentiation.

## 4. Technical Architecture

### Frontend
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS with a custom "Claymorphism" UI design system (utilizing specific CSS variables for depth and soft shadows).
*   **State Management:** React Context API for global session handling.
*   **Real-time:** Native WebSockets for WebRTC signaling and communication.

### Backend
*   **Framework:** FastAPI (Python 3)
*   **Database:** SQLite (Development) / PostgreSQL (Production ready via SQLAlchemy ORM).
*   **Authentication:** JWT (JSON Web Tokens) securely delivered via HTTP-only cookies to prevent XSS attacks.
*   **AI Integration:** Native integration points for LLMs to power the MESH assistant.

## 5. Security & Production Hardening

*   **Strict Institutional Provisioning:** The public registration endpoint is disabled after the first boot. All subsequent accounts must be explicitly provisioned by an `ADMIN` or `HOD`, and must use the `@ritrjpm.ac.in` domain.
*   **Malware Scanning Simulation:** Upload endpoints intercept file byte streams and validate SHA256 checksums against known blocklists before persisting to storage.
*   **Rate Limiting:** Global middleware enforcing a strict rate limit (100 requests per minute per IP) to prevent DDoS and brute-force attacks.
*   **Audit Logging:** All critical state-mutating requests (`POST`, `PUT`, `DELETE`) are logged at the middleware level, recording the action, path, and client IP for forensic analysis.
*   **Resource Level Security (RLS):** All data access queries inherently enforce role and department boundary checks at the ORM level (e.g., restricting `DEPARTMENT_DISCOVERABLE` resources strictly to members of the same department).

## 6. Deployment & Operations

*   The system is container-ready.
*   The architecture separates the stateless API from the stateful database and file storage, allowing horizontal scaling.
*   Real-time features utilize asynchronous Python (`asyncio`) and lightweight WebSocket connections to minimize memory overhead during active WebRTC signaling.
