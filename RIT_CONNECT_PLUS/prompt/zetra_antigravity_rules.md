# ANTIGRAVITY MASTER PRODUCTION ENGINEERING AND SECURITY CONTEXT

## 1. Mission

Antigravity must build and maintain real-world production software.

The project must not be treated as:

* A demo
* A visual prototype
* A mock production system
* A collection of generated snippets
* A generic starter template
* A fake enterprise architecture
* A collection of disconnected UI screens

The implementation must represent a coherent, executable, maintainable, secure production system.

Every major subsystem must have a real responsibility, a real data flow, a real control path, and a real failure path.

---

# 2. Core Engineering Principle

The default engineering lifecycle is:

Understand the requirement.

Inspect the real project.

Determine the current state.

Identify affected components.

Identify dependencies.

Identify security boundaries.

Determine data flow.

Determine event flow.

Determine failure flow.

Plan the minimum correct implementation.

Implement.

Validate.

Test.

Review.

Harden.

Deploy according to the actual infrastructure.

Monitor.

Document the actual resulting state.

Never invent missing project information.

Never use visual implementation as a substitute for backend functionality.

---

# 3. Production POV Model

The system has three primary perspectives.

## 3.1 User POV

The User POV is the production product.

It represents what normal users actually experience.

It includes:

* Authentication
* User account
* Application functionality
* User data
* User workflows
* Payments where applicable
* Notifications
* User settings
* User-facing errors
* Maintenance state
* Normal production sessions

The User POV must remain isolated from privileged operational functionality.

Users must not have access to:

* Database management
* Server management
* Production controls
* Deployment controls
* Developer diagnostics
* Internal logs
* Infrastructure controls
* Administrative configuration
* Security administration
* Maintenance controls
* Internal system information

---

# 4. Admin POV

The Admin POV controls the operational product.

It may include:

* Production control
* User management
* Account management
* User status
* Moderation
* Operational configuration
* Maintenance mode
* Server status
* Application status
* Operational monitoring
* Relevant database management
* Logs
* Audit information
* Production announcements
* Service control
* Access control

Every operation must be backed by real server-side functionality.

A button in the UI must never be considered an implemented operational control unless the backend actually performs the operation.

---

# 5. Developer POV

The Developer POV provides engineering-level management.

It may include:

* Application diagnostics
* Runtime information
* Build information
* Release management
* Deployment management
* Server management
* Database diagnostics
* Database management
* Configuration management
* Error inspection
* Logs
* Health checks
* Maintenance controls
* Deployment state
* Runtime state
* Recovery and rollback operations where actually implemented

Developer access must remain subject to authentication, authorization, auditability, and least privilege.

---

# 6. Control Plane and User Plane

The architecture must distinguish between:

## User Plane

The actual production application used by normal users.

## Control Plane

The management layer used by authorized administrators and developers.

The maintenance system must protect this distinction.

When maintenance is enabled:

User Plane access is restricted according to the maintenance policy.

Control Plane access remains available to authorized Admin and Developer identities.

The implementation must enforce this separation on the backend.

Frontend hiding alone is not security.

---

# 7. Maintenance Architecture

Maintenance is a real system state.

It must not be implemented only as a decorative maintenance page.

A valid maintenance implementation must have:

* Authoritative maintenance state
* Server-side enforcement
* Role-aware bypass
* User-facing maintenance behavior
* Admin control
* Developer control
* Logging where appropriate
* Status visibility
* Safe activation
* Safe deactivation
* Validation before restoration

The exact implementation must match the actual infrastructure.

---

# 8. Maintenance User POV

When maintenance is active:

Normal users cannot continue normal production activity when the configured maintenance policy blocks access.

The user receives a production-quality maintenance interface.

The interface must not expose:

* Internal server information
* Database information
* Stack traces
* Internal service names
* Secrets
* Developer diagnostics
* Infrastructure details

---

# 9. Maintenance Admin POV

Authorized administrators retain access to the control plane during maintenance.

They must be able to perform the operations actually supported by the project.

Potential controls include:

* View maintenance status
* Enable maintenance
* Disable maintenance
* View server status
* View application status
* View user status
* Review operational events
* Manage permitted production controls
* View relevant operational diagnostics

---

# 10. Maintenance Developer POV

Authorized developers retain engineering access during maintenance.

They must be able to work on the actual production environment through the supported management path.

Potential capabilities include:

* Application diagnostics
* Server diagnostics
* Database diagnostics
* Deployment
* Configuration
* Runtime inspection
* Log inspection
* Health checks
* Maintenance management
* Validation
* Recovery procedures

Maintenance must never create a situation where the system is locked but the operators responsible for recovery cannot access the control plane.

---

# 11. Production Deployment Model

Normal production users should use a stable deployed release.

Developers should prepare new releases outside the live user experience whenever the deployment model permits.

The intended lifecycle is:

Development

Testing

Staging where applicable

Release

Production deployment

Validation

Monitoring

Rollback or remediation if required

The exact process must follow the actual deployment infrastructure.

---

# 12. Load Handler

The system must have a proper load-handling strategy.

"Load handler" means the application must correctly manage increasing request, user, processing, memory, storage, and workload pressure where applicable.

The load handler must not be a fake performance layer.

It must respond to real system conditions.

Depending on the project, load handling can include:

* Request concurrency control
* Queueing
* Rate limiting
* Connection pooling
* Backpressure
* Pagination
* Batching
* Caching
* Resource limits
* Worker management
* Timeout handling
* Graceful degradation
* Load balancing
* Horizontal scaling where actually required

The appropriate mechanisms must be selected based on the real workload.

Do not add a queue, cache, worker pool, or distributed system without an actual requirement.

---

# 13. Load Handler Responsibilities

The load handler must protect the application from uncontrolled workload.

It should consider:

* Request frequency
* Concurrent users
* Expensive operations
* Large payloads
* File processing
* Database load
* External API load
* Payment operations
* Authentication requests
* OTP requests
* AI requests where applicable

Rate limiting is particularly important for authentication, OTP verification, expensive operations, AI calls, file processing, and externally driven endpoints.

Per-IP and per-user controls should be combined where appropriate rather than relying on only one.

---

# 14. Event Handler

The application must have a reliable event-handling model.

An event handler is responsible for receiving, validating, processing, and safely completing an application event.

Events may originate from:

* User actions
* System operations
* Payments
* Authentication
* OTP verification
* Webhooks
* Background jobs
* Scheduled jobs
* Server events
* Database events
* External integrations

Every event handler must determine:

* Event source
* Authentication requirements
* Authorization requirements
* Input validation
* Processing logic
* Idempotency requirements
* Error behavior
* Retry behavior
* Logging requirements
* Result handling

---

# 15. Event Validation

External event input must never be trusted automatically.

For webhook-like or externally generated events:

* Validate the request
* Verify authenticity
* Validate the payload
* Validate the event type
* Reject unexpected fields where appropriate
* Prevent replay problems where applicable
* Process safely
* Record the relevant event state

Payment webhook signatures must be verified using the raw request body because parsing the body first can invalidate signature verification.

---

# 16. User Handler

The system must have a correct user-handling layer.

A user handler is responsible for safely processing user-driven operations.

Every protected user operation must establish:

* Identity
* Authentication
* Authorization
* Resource ownership
* Input validity
* Business rules
* Data access permissions
* Rate limits
* Result handling

Authentication alone is insufficient.

The system must verify whether the authenticated user is actually permitted to act on the requested resource.

---

# 17. User Handler Security

Never trust client-submitted:

* User IDs
* Roles
* Permissions
* Account states
* Prices
* Credits
* Subscription status
* Ownership
* Feature flags
* Rate-limit counters

These must be validated or enforced server-side.

Never spread untrusted request bodies directly into database updates.

Only explicitly permitted fields should be accepted.

---

# 18. Error Handler

Every production project must have a centralized and consistent error-handling strategy.

The error handler must distinguish:

## User-safe errors

Information appropriate for the production user.

## Operational errors

Information appropriate for administrators.

## Developer diagnostics

Technical information appropriate for developers.

The same underlying failure may require different representations for different roles.

---

# 19. Error Handling Requirements

The error handler must:

* Catch expected application errors
* Prevent sensitive information leakage
* Normalize error responses
* Log relevant technical details securely
* Preserve useful diagnostic information for authorized operators
* Return appropriate status codes
* Handle unexpected failures safely
* Prevent stack traces from reaching users
* Avoid exposing credentials
* Avoid exposing internal paths
* Avoid exposing raw database errors

Production debug mode must be disabled because debug output can expose stack traces, environment variables, and internal paths.

---

# 20. Handler Architecture

The system should logically separate:

**Load Handler**

Responsible for workload protection and request pressure.

**Event Handler**

Responsible for application and external events.

**User Handler**

Responsible for user-driven operations and authorization.

**Error Handler**

Responsible for safe error processing and operational diagnostics.

These are responsibilities, not automatically four separate files or services.

The actual implementation must follow the project's architecture.

Do not create four separate modules simply because the names exist.

---

# 21. Authentication Security

Every protected endpoint must authenticate the caller.

Every protected operation must authorize the caller.

Authentication and authorization must happen server-side.

Every route handler, server action, or equivalent public endpoint must be protected appropriately.

JWT verification must validate the signature and relevant claims such as algorithm, issuer, audience, and expiration.

---

# 22. Session Security

Session storage must use an appropriate secure mechanism.

For web authentication, sensitive tokens should use appropriate secure cookie settings rather than localStorage.

For mobile applications, authentication tokens should use platform-secure storage such as Secure Store or Keychain rather than plaintext application storage.

---

# 23. Database Access Security

Every database operation must respect the application's authorization model.

Use parameterized queries or safe ORM methods.

Never concatenate user-controlled values into SQL.

Validate input before database operations.

Runtime validation is required because compile-time types do not protect malicious external input.

---

# 24. Database Ownership and Row Security

Where row-level database authorization is used, it must enforce ownership correctly.

Do not use policies that allow every authenticated user to access every row.

Policies must constrain access to the appropriate owner or authorized role.

Insert and update policies must prevent ownership reassignment through appropriate validation.

---

# 25. Sensitive Database Fields

Sensitive fields must not be exposed through user-controlled update mechanisms.

Fields such as:

* Administrative flags
* Credits
* Subscription tier
* Privileged roles

must not be writable by normal users unless explicitly authorized.

Database access controls must prevent privilege escalation through field manipulation.

---

# 26. Payment System

The interactive payment checkout must be a real payment integration, not a visual simulation.

The server must remain authoritative for:

* Product identity
* Price
* Currency
* Quantity constraints
* User identity
* Order identity
* Payment state
* Subscription state
* Webhook processing

Never trust a price submitted by the client.

Product pricing should be resolved server-side using trusted identifiers.

---

# 27. Payment Event Handling

Payment webhooks must be treated as authoritative external events when the selected payment provider uses them.

The implementation must:

* Verify webhook authenticity
* Validate event structure
* Process the correct event type
* Avoid duplicate processing
* Update the real payment state
* Record relevant transaction state
* Handle failures safely

Subscription status must be checked server-side and kept synchronized with webhook-driven updates rather than trusting a stale client-side or login-time value.

---

# 28. Payment UI

The checkout interface should be:

* Premium
* Responsive
* Clear
* Production-oriented
* Accessible
* Smooth
* Trustworthy

Required visual characteristics:

* Claymorphism
* Premium solid morphism
* Selective glassmorphism where appropriate
* Selective liquid effects where appropriate
* Smooth micro-interactions
* Smooth payment-state transitions
* Clear loading state
* Clear validation state
* Clear failure state
* Clear success state

Do not use neon styling.

Do not use excessive glow.

Do not create fake payment confirmations.

A success animation must appear only after the actual payment system confirms the appropriate successful state.

---

# 29. Payment State Machine

Payment processing should have real states appropriate to the chosen provider and application.

Possible conceptual states may include:

* Checkout initiated
* Payment pending
* Payment processing
* Payment successful
* Payment failed
* Payment cancelled
* Payment requires action
* Refund pending
* Refunded

The actual states must match the payment integration.

Do not invent provider-specific states.

---

# 30. OTP Verification System

The OTP system must be production-grade.

It must include:

* Real OTP generation
* Secure delivery mechanism
* Expiration
* Verification
* Attempt limits
* Rate limiting
* Abuse prevention
* Session or verification state
* Replay protection
* Appropriate error handling
* Audit logging where required

The animation must never replace server-side OTP verification.

---

# 31. OTP Security

OTP verification endpoints must be rate limited because unrestricted verification endpoints can be abused for brute-force attempts.

OTP codes should not be exposed through client-side source, logs, URLs, or unnecessary application state.

Failed attempts and abnormal verification behavior should be handled according to the application's security policy.

---

# 32. OTP UI

The OTP verification interface should use:

* Claymorphism
* Premium solid morphism
* Selective glass effects
* Selective liquid effects
* Smooth focus interactions
* Smooth transitions
* Responsive layout
* Clear validation states
* Accessible input behavior
* Correct keyboard behavior on mobile
* Loading state
* Success state
* Failure state
* Resend behavior
* Timer state

The design must remain premium rather than neon.

---

# 33. Interactive Animation Principle

Animations must represent real application states.

Examples:

Payment processing animation:

Only while actual payment processing is occurring.

Payment success animation:

Only after the appropriate successful result is confirmed.

OTP validation animation:

Only according to the actual verification state.

Error animation:

Only when a real validation or processing error occurs.

Do not animate fake system states.

---

# 34. Micro Animation Rules

Animations must enhance usability rather than obstruct functionality.

They should:

* Communicate state
* Provide feedback
* Improve transition clarity
* Maintain responsiveness
* Respect reduced-motion preferences where supported
* Avoid distracting effects
* Avoid excessive movement

Animation must never hide an error or delay a critical action unnecessarily.

---

# 35. Responsive UI

All production-facing interfaces must work correctly across supported screen sizes.

This applies to:

* User application
* Checkout
* OTP verification
* Admin dashboard
* Developer dashboard
* Maintenance interface
* Server management
* Database management

The actual supported devices must be based on project requirements.

---

# 36. UI System

Primary visual language:

**Claymorphism**

**Premium solid morphism**

Secondary visual language:

**Glassmorphism**

**Liquid effects**

Glass and liquid effects are allowed selectively.

They must remain subordinate to the primary visual system.

---

# 37. Visual Prohibition

Do not use a neon theme.

Avoid:

* Neon borders
* Neon backgrounds
* Heavy glow
* Excessive luminous gradients
* Cyberpunk styling
* RGB-heavy aesthetics
* Glowing everything

The target visual quality is:

Premium.

Solid.

Controlled.

Modern.

Professional.

Tactile.

Refined.

---

# 38. No AI Template Rule

The product must not look like an AI-generated dashboard template.

Do not use generic:

* AI dashboards
* AI landing pages
* AI-generated application shells
* Generic AI component collections
* Unnecessary AI branding
* AI references

unless an AI feature is an actual project requirement.

The final product should reflect the actual product identity.

---

# 39. AI Integration Security

When an AI service is genuinely part of the project:

AI API keys must remain server-side.

They must not be placed in client-side JavaScript, mobile bundles, or public environment variables.

AI calls should go through the backend when secret provider credentials are required.

---

# 40. AI Usage Control

AI API usage must have:

* Provider-level spending controls
* Application-level usage controls
* Per-user limits where appropriate
* Usage tracking
* Clear failure behavior

The uploaded security guidance specifically recommends tracking usage and enforcing daily or monthly limits rather than relying only on provider-level caps.

---

# 41. Prompt Injection Protection

If users can provide text to an LLM:

* Treat user input as untrusted
* Separate system and user messages
* Validate inputs
* Validate outputs
* Restrict available tools
* Restrict permissions
* Avoid unnecessary tool access

Prompt injection must be treated as a real security concern.

---

# 42. LLM Output Safety

LLM output must be treated as untrusted content.

Do not:

* Execute model output as code
* Render unsafe HTML directly
* Execute arbitrary tool parameters
* Allow raw SQL generation from user input

Tool parameters must be validated against a defined schema and allowlist before execution.

---

# 43. Secrets Management

Never hardcode:

* API keys
* Passwords
* Tokens
* Database credentials
* Private keys
* Certificates
* Service credentials

Secrets that have been committed to Git history must be considered compromised and rotated appropriately.

---

# 44. Client Environment Security

Client-exposed environment variables are not secrets.

Framework-specific public prefixes can result in values being included in the client bundle.

Sensitive credentials must remain server-side.

---

# 45. Deployment Security

Production must have:

* Debug disabled
* Appropriate source-map handling
* Proper environment separation
* Protected repository files
* Secure headers
* Restricted CORS
* Secret scanning
* Production-safe error handling

Production deployment guidance specifically recommends disabling debug mode and checking that repository metadata is not publicly accessible.

Production, preview, and development credentials must remain separated. Preview environments must not use production database or payment credentials.

---

# 46. Security Headers

Where applicable, production responses should use appropriate security headers such as:

* Content Security Policy
* Strict Transport Security
* X-Frame-Options
* X-Content-Type-Options
* Referrer-Policy
* Permissions Policy

The exact policy must be adapted to the actual application instead of copied blindly.

---

# 47. CORS

Authenticated endpoints must not use unrestricted wildcard origins.

The application should explicitly allow only appropriate origins.

Credentialed cross-origin requests must use specific approved origins.

---

# 48. Mobile Application Security

When the project includes mobile applications:

Do not store secrets inside the JavaScript bundle.

Mobile applications should call the project's backend for operations requiring protected third-party credentials.

Sensitive authentication tokens should use secure platform storage.

Deep-link input must be validated and must not contain sensitive access information.

---

# 49. Input Validation

All external input must be validated at the system boundary.

This includes:

* API parameters
* Request bodies
* Query parameters
* URL parameters
* Forms
* Webhooks
* Server actions
* External service callbacks
* File uploads

Runtime validation is required.

---

# 50. SQL and ORM Security

Use parameterized queries or safe ORM operations.

Never concatenate user input into SQL.

When using an ORM, validate input before passing it into query structures.

Do not use unsafe raw-query APIs with user input.

---

# 51. Mass Assignment Protection

Never pass an entire request body into database mutation operations.

Explicitly select allowed fields.

Sensitive fields must remain protected from client manipulation.

---

# 52. Rate Limiting

Rate limiting must exist wherever abuse can create material risk.

Relevant areas include:

* Login
* Registration
* Password reset
* OTP
* Magic links
* Payment-sensitive endpoints
* AI endpoints
* Email sending
* SMS sending
* File processing
* Webhooks
* Expensive operations

Rate limiting should use an appropriate storage mechanism for the deployment topology.

---

# 53. Audit Logging

Privileged operations should be auditable where appropriate.

Relevant information may include:

* Actor
* Action
* Target
* Timestamp
* Result
* Failure information
* Relevant request or operation identifier

Do not expose audit logs to normal users.

Do not log secrets.

---

# 54. User Data Exposure

Do not send complete database objects to client applications when they contain fields the client does not require.

Select only the fields needed by the specific client feature.

This principle applies across:

* APIs
* Server-rendered pages
* Client components
* Mobile applications
* Admin interfaces

---

# 55. Handler Failure Strategy

Every handler must define what happens when something fails.

## Load Handler failure

Protect the system and return an appropriate overload or throttling response.

## Event Handler failure

Reject, retry, or record the event according to its delivery and idempotency requirements.

## User Handler failure

Return a safe user-facing error without leaking internal details.

## Error Handler failure

Fall back to a safe minimal production response and preserve diagnostics through secure operational logging where possible.

---

# 56. Idempotency

Operations that may be repeated by retries must be designed appropriately.

This is particularly important for:

* Payments
* Webhooks
* Background jobs
* Provisioning
* Resource creation
* External service calls

A repeated request must not accidentally perform the same irreversible operation multiple times.

The exact implementation depends on the operation and infrastructure.

---

# 57. Transaction Integrity

Where multiple related data changes must succeed together, use appropriate transactional mechanisms.

Do not leave partially applied critical operations when atomicity is required.

Examples may include:

* Payment state updates
* Account state changes
* Inventory operations
* Subscription state updates

The implementation must match the database's real transaction capabilities.

---

# 58. Production Data Integrity

Never use fake data to make production dashboards appear populated.

Production dashboards must obtain information from actual sources.

Examples:

User status must come from actual user state.

Server status must come from actual server health.

Database status must come from actual database checks.

Payment status must come from actual payment records.

Deployment status must come from actual deployment state.

---

# 59. Real-Time State

Where the application requires real-time status, use an actual mechanism appropriate to the project.

Possible mechanisms may include:

* Polling
* Server-sent events
* WebSockets
* Database change notifications
* Provider callbacks

Do not simulate real-time behavior with static timers or fake values.

---

# 60. Server Status Integrity

Server status must represent actual operational state.

Do not infer health merely because a management webpage is accessible.

Relevant health checks may include:

* Application availability
* Database connectivity
* Required service availability
* Process health
* Resource health
* Dependency health

The exact health model must be based on the real architecture.

---

# 61. Database Management Integrity

Database management controls must operate on the real database.

Do not create fake database tables, fake migration statuses, fake row counts, or fake query results.

Administrative database operations must respect:

* Authorization
* Validation
* Audit requirements
* Transaction safety
* Backup requirements where appropriate
* Recovery requirements

---

# 62. Project Maintenance

Maintenance must be a continuous engineering process rather than an emergency-only activity.

Maintenance can include:

* Dependency updates
* Security updates
* Database maintenance
* Server maintenance
* Configuration changes
* Log management
* Backup verification
* Performance improvements
* Bug fixes
* Deployment maintenance
* Monitoring
* Recovery planning

Every maintenance operation must have an actual purpose.

---

# 63. Maintenance Preparation

Before significant production maintenance:

Check relevant:

* Application status
* Server status
* Database status
* Deployment version
* Active operational tasks
* Backup state
* Dependencies
* Configuration
* External services

Only checks relevant to the actual change are required.

Do not create ceremonial steps that have no technical value.

---

# 64. Maintenance Execution

During maintenance:

* Restrict normal production access as required
* Maintain Admin control
* Maintain Developer control
* Protect database integrity
* Apply changes deliberately
* Validate each significant operation
* Monitor failures
* Avoid unnecessary modifications

---

# 65. Post-Maintenance Verification

Before restoring normal user access, verify the relevant systems.

Examples:

* Application startup
* Authentication
* Core user flow
* Database connectivity
* Payment flow where changed
* OTP flow where changed
* External integrations
* Server health
* Error state
* Relevant logs

Only restore user access after the relevant checks succeed.

---

# 66. Rollback

Production-changing operations should have an appropriate recovery strategy.

Possible mechanisms include:

* Previous application release
* Previous deployment
* Backup restoration
* Configuration rollback
* Forward fix
* Traffic reversal
* Database recovery

Do not invent rollback capability.

Document the actual mechanism.

---

# 67. UI to Backend Integrity

Every production UI interaction must have a real backend path where backend behavior is required.

Examples:

Maintenance button:

Must modify actual maintenance state.

Restart button:

Must perform the authorized server operation.

Payment button:

Must initiate a real payment flow.

OTP verify button:

Must invoke real verification.

User restriction control:

Must alter the actual authorized user state.

Database action:

Must perform the actual permitted database operation.

A UI mock must never be represented as a functional system.

---

# 68. Production UX State Model

Production interfaces must correctly represent at least the relevant states for their operation.

Examples:

* Loading
* Ready
* Processing
* Success
* Failure
* Unauthorized
* Forbidden
* Maintenance
* Unavailable
* Retry

Only states relevant to the actual feature should be implemented.

---

# 69. Security and UX Must Work Together

Security must not be added as an afterthought to the UI.

For every privileged action:

UI authorization state

Backend authorization

Input validation

Operation execution

Auditability where appropriate

Safe response

must all agree.

---

# 70. No Visual-Only Security

Never treat:

* Hidden buttons
* Hidden routes
* Disabled controls
* Frontend conditions
* UI role labels

as sufficient security.

All privileged actions require server-side authorization.

---

# 71. Production-Level Completion Standard

A task is not considered complete merely because the interface appears correct.

Completion requires the relevant layers to work together.

Depending on the task, this can include:

* UI
* Frontend state
* Backend handler
* Authentication
* Authorization
* Database
* External service
* Event handler
* Error handler
* Load protection
* Logging
* Testing
* Deployment

Only relevant layers need to be involved.

Do not force unnecessary architecture into small features.

---

# 72. Antigravity Security Priority

Security issues must be prioritized according to real impact.

Critical issues should not be buried inside long general reports.

Examples of serious issues include:

* Exposed secrets
* Authentication bypass
* Broken authorization
* Unrestricted database access
* Unsafe payment pricing
* Missing webhook verification
* Privilege escalation
* Unrestricted privileged operations

The uploaded security guidance explicitly prioritizes real exploitability and impact over style concerns.

---

# 73. Production Verification Rule

Antigravity must distinguish:

Implemented

Tested

Verified

Deployed

Production verified

These are different states.

Do not claim one merely because another occurred.

Example:

"Implemented and unit tested. Production deployment has not been performed."

This is valid.

"Production ready and fully verified."

is valid only when the available evidence supports it.

---

# 74. No Fake Security Claims

Do not describe the system as:

* Unhackable
* Perfectly secure
* Absolutely secure
* 100% secure

No real production system can justify such claims.

Use concrete security controls and verified results instead.

---

# 75. No Neon and No Artificial Futurism

The product must not rely on neon or cyberpunk styling to appear advanced.

Premium visual quality should come from:

* Typography
* Spacing
* Surface depth
* Composition
* Interaction design
* Controlled animation
* Clay surfaces
* Solid morphic structure
* Selective glass
* Selective liquid effects
* Clear hierarchy

not excessive visual effects.

---

# 76. No AI-Generated Filler

Do not add unnecessary text such as:

* Generic AI slogans
* Fake metrics
* Fake user counts
* Fake system messages
* Fake testimonials
* Fake operational history
* Fake security claims
* Fake release information
* Fake logs
* Fake notifications

Real production products need actual information.

---

# 77. Final Antigravity Production Checklist

Before considering substantial work complete, verify:

## Architecture

The implementation fits the existing architecture.

## User POV

Normal users can access only their intended production functionality.

## Admin POV

Administrators can access the actual management functions assigned to them.

## Developer POV

Developers can access the actual engineering controls assigned to them.

## Maintenance

Users are correctly restricted during maintenance.

Admin access remains operational.

Developer access remains operational.

## Load Handler

Workload protection is implemented where required.

## Event Handler

Events are validated, authenticated where required, safely processed, and appropriately handled on failure.

## User Handler

Authentication, authorization, ownership, validation, and business rules are enforced.

## Error Handler

Errors are safe for users and useful for authorized operators.

## Database

Access is protected.

Input is validated.

Sensitive fields are protected.

Queries are safe.

## Payments

Prices are trusted from the correct server-side source.

Webhooks are authenticated.

Payment state is server-authoritative.

## OTP

Verification is real.

Expiration and attempts are controlled.

Rate limiting exists.

## Authentication

Credentials and sessions are protected.

## Secrets

Secrets remain server-side.

## Deployment

Production configuration is separated and hardened.

## UI

Claymorphism and premium solid morphism are primary.

Glass and liquid effects are selective.

Neon is avoided.

## AI

No unnecessary AI references.

No generic AI template identity.

No exposed AI credentials.

No unsafe AI tool execution.

## Validation

Only actual tests and actual verification results are reported.

## Integrity

No dummy files.

No empty components.

No fabricated data.

No duplicate implementation.

No unnecessary dependencies.

No unrelated architectural changes.

# 78. Master Principle

Antigravity must build the system as an actual production engineering environment.

The interface is only one layer.

The real product exists across:

User experience

Backend behavior

Data access

Authentication

Authorization

Event processing

Load handling

Error handling

Database integrity

Payment processing

Security

Deployment

Maintenance

Monitoring

Recovery

Administration

Developer operations

Every important user-visible action must connect to the actual system behind it.

Every privileged operation must be protected.

Every external input must be treated as untrusted.

Every production state must be real.

Every displayed operational value must originate from a real source.

Every security claim must be supported by actual controls.

Every implementation decision must have a technical reason.

The final product must be a real, maintainable, secure production system rather than an artificial representation of one.
