# Connect Plus

Build the actual application, not a mockup, visual prototype, static dashboard, generated boilerplate collection, or fake production environment.
>
> Do not stop after creating a plan.
>
> Inspect the existing workspace first, determine the actual current state, preserve valid existing work, then implement the complete system and verify it.
>
> Never invent missing project information.
>
> Never create fake functionality.
>
> Never create dummy operational data.
>
> Never expose secrets.
>
> Never claim that something works unless it has actually been tested and verified.

---

# 1. Current Project Identity

## Product Name

**Connect Plus**

Use this product name consistently throughout:

* Frontend
* Backend
* Database-facing labels where appropriate
* Metadata
* Browser title
* Documentation
* README
* Application configuration
* Assets
* Notifications
* Emails
* Generated text
* Login
* Admin interface
* HOD interface
* Staff interface

Do not use legacy product names such as:

* TeachMesh
* RIT Connect

Do not use personal brand names in the product.

Do not include the problem statement number or problem statement title anywhere in the final product.

---

# 2. Product Purpose

Connect Plus is an institutional faculty resource intelligence and sharing platform.

The platform exists to transform scattered educational resources into an organized, searchable, reusable academic knowledge system.

The original challenge requires centralized resource sharing with:

* Resource upload
* Categories
* Search
* Tags
* Ratings
* Comments
* Intelligent recommendations

The existing project materials further define semantic discovery, curriculum mapping, teaching intent, resource combinations, coverage analysis and reuse detection as the major differentiators.  

The application must not behave like a normal file-sharing website.

The primary product concept is:

```text
Resource
Content Understanding
Curriculum Mapping
Teaching Requirement
Semantic Discovery
Recommendation
Teaching Kit
Coverage
Reuse
Feedback
```

---

# 3. Source-of-Truth Rules

Use all attached project materials as reference material.

The current implementation contract has higher priority than older documents.

Resolve conflicts using this order:

1. Current user requirements in this document
2. Current resource-sharing project plan and presentation
3. Current problem-statement source
4. Current Antigravity production and security rules
5. Attached legacy planning documents
6. Older project concepts

Do not blindly copy older project functionality into Connect Plus.

The older planning suite contains a much larger institutional platform containing students, faculty, communication, calling, complaints, assignments, events and placement systems. Those parts are **not automatically part of Connect Plus**. The current project scope explicitly reduces the account system to:

```text
ADMIN
HOD
STAFF
```

No Student account exists in Connect Plus.

No Student login exists.

No Student dashboard exists.

No Student database role exists.

No Student-specific modules are to be created.

The older documents remain useful for:

* Authentication rules
* Professional profiles
* Department ownership
* Role-aware access
* Security
* Audit logging
* Versioning
* Storage safety
* Production operations
* UI principles
* Infrastructure discipline

The legacy documents explicitly define role-aware access, official institutional identity, professional profile fields, server-side authorization, audit logging, storage security and production controls.   

---

# 4. Critical Scope Override

The following are explicitly excluded from this project unless separately requested later:

* Student accounts
* Student login
* Faculty role as a separate role
* Assignment management
* Student submission system
* College-wide user chat
* User-to-user messaging
* Voice calling
* Video calling
* Live audio rooms
* Placement module
* Student moderation
* Student complaints
* Student grievance workflows
* Campus complaint workflows
* Event registration
* General social feed
* Gamification
* Native mobile applications
* Generic chatbot
* Blockchain
* Kubernetes
* Kafka
* Microservice architecture
* Unnecessary distributed systems

The old planning documents contain many of these concepts, but they are intentionally excluded from the current Connect Plus scope.   

---

# 5. Current Roles

There are exactly three application roles.

```text
ADMIN
HOD
STAFF
```

Do not create:

```text
STUDENT
FACULTY
SUPER_ADMIN
SPECIAL_ADMIN
CO_ADMIN
DEVELOPER
```

as additional application roles.

The distinction between Admin and Developer is represented as permissions inside the Admin control plane.

---

# 6. ADMIN ROLE

The Admin is both:

* Institutional administrator
* Developer/technical operator

There is no separate Developer login.

Admin has global access.

Admin can access the complete application and control plane.

## Admin Responsibilities

### User management

* Create Staff accounts
* Create HOD accounts
* Disable accounts
* Enable accounts
* Suspend accounts
* Restore accounts
* Change department assignment
* Change role
* Reset onboarding state
* Force password reset
* Review sessions
* Revoke sessions
* Review access history

### Department management

* Create departments
* Update departments
* Archive departments
* Assign HOD
* Change HOD
* View department staff
* View department resources
* View academic structure

### Resource management

* View all resources
* View all versions
* View resource ownership
* View resource permissions
* Grant access
* Revoke access
* Override access when legitimately required
* Archive resources
* Restore resources
* Moderate resources
* Review duplicate detection
* Review processing state

### System control

* Maintenance mode
* Application health
* Database health
* Storage health
* Processing health
* Search health
* Conversation service health
* Configuration management
* Audit logs
* Security events
* Processing jobs
* Database migration state
* Deployment information where actually available

### Developer access

Because Admin has developer access, Admin may inspect:

* Application diagnostics
* API diagnostics
* Runtime status
* Database diagnostics
* Storage diagnostics
* Processing failures
* Search diagnostics
* Conversation diagnostics
* Configuration status
* Build/release information when actually integrated
* Deployment information when actually integrated
* Production errors
* Operational logs available through the actual infrastructure

Do not create fake server-control buttons.

If a control cannot actually perform an operation, do not display that control as functional.

The supplied production rules explicitly require Admin and Developer operations to be backed by real server-side functionality and prohibit fabricated operational metrics. 

---

# 7. HOD ROLE

HOD is department-level authority.

An HOD belongs to exactly one department.

HOD cannot manage unrelated departments.

## HOD capabilities

HOD can:

* View all Staff under their department
* View Staff professional profiles
* View all Staff-owned resources in their department
* Search all Staff resources in their department
* Preview department resources
* Use department resources
* Download authorized department resources
* Build Teaching Kits from department resources
* Use semantic search across department resources
* Use the conversation feature against department-accessible resources
* View department analytics
* View department resource gaps
* Review resource access requests
* Grant/revoke departmental access where the permission policy allows it
* Review resource versions
* Review reuse activity
* Review ratings/comments
* Manage staff academic assignments where authorized
* Manage department curriculum mapping where authorized

HOD cannot:

* View resources belonging to another department unless Admin explicitly authorizes it
* Change another department's data
* Change system-wide security configuration
* Access Admin-only technical controls
* Modify production infrastructure directly
* Modify an original Staff resource in place

When an HOD needs to make changes to an existing resource, the same versioning rules apply.

Original versions remain immutable.

---

# 8. STAFF ROLE

Staff is the standard resource contributor and user.

Staff belongs to exactly one department.

## Staff can

* Login
* Manage their professional profile
* Upload resources
* Manage their own resources
* Search their accessible resources
* Search resources explicitly shared with them
* Request access to another Staff resource
* Use authorized resources
* Download authorized resources
* Add authorized resources to Teaching Kits
* Rate authorized resources
* Comment on authorized resources
* Create Teaching Intents
* Generate recommendations
* Build Teaching Kits
* Use the conversation feature within their permitted resource scope
* Review their own resource versions
* View usage of their resources
* Review pending access requests involving their resources

## Staff cannot

* Access another Staff member's resources without authorization
* Download another Staff member's private resource without authorization
* Modify another Staff member's resource without Modify permission
* Search restricted resource content outside their permission scope
* Bypass resource permissions through direct API requests
* Change their own role
* Change their own department without authorized Admin/HOD action
* View Admin controls
* View developer controls
* View another department's private resources

---

# 9. RESOURCE ACCESS MODEL

This is a critical business rule.

## Absolute rule

A Staff user must not be able to use another Staff user's resource unless authorized.

Frontend hiding is not sufficient.

Backend authorization must enforce this.

Database policies must enforce this where possible.

The search system must enforce this.

The conversation system must enforce this.

Resource preview must enforce this.

Resource download must enforce this.

Teaching Kit creation must enforce this.

The supplied production engineering rules require authentication, authorization, ownership and input validation for every protected operation. 

---

# 10. Resource Ownership

Every resource has exactly one owner.

```text
resource.owner_id
```

The owner is the Staff member who originally created the resource.

Admin owns system-level resources only when explicitly created as such.

HOD does not automatically become the owner of Staff resources.

Ownership never changes merely because another person has access.

---

# 11. Resource Permission Levels

Use explicit permission levels.

```text
VIEW
USE
MODIFY
```

## VIEW

Allows:

* View metadata
* Preview if preview is supported
* Read resource information

Does not allow:

* Download
* Modification
* Re-publishing
* Adding to a Teaching Kit where the action constitutes use

## USE

Includes:

* VIEW
* Preview
* Download where allowed
* Use in Teaching Kit
* Reference resource
* Reuse content within the platform according to policy

Does not allow modification.

## MODIFY

Includes:

* VIEW
* USE
* Create a new version
* Submit modifications
* Replace the current published version only through the version workflow

Never overwrite the original version.

---

# 12. Staff-to-Staff Permission Workflow

Example:

Staff A owns Resource X.

Staff B wants to use Resource X.

Staff B cannot simply open or download it.

Staff B submits:

```text
Access Request
Resource
Requested Permission
Reason
```

Possible requested levels:

```text
VIEW
USE
MODIFY
```

Owner or authorized HOD/Admin can respond.

Status:

```text
PENDING
APPROVED
REJECTED
REVOKED
EXPIRED
```

Every access decision must be auditable.

---

# 13. HOD Department Access

HOD automatically receives:

```text
VIEW
USE
```

for Staff resources belonging to the HOD's own department.

This is a role-based department authority.

HOD access must not be treated as ownership.

HOD does not automatically receive Modify rights.

If modification is needed, use the versioning system.

---

# 14. ADMIN RESOURCE ACCESS

Admin has institution-wide access.

Admin can:

* View
* Use
* Modify through controlled versioning
* Archive
* Restore
* Moderate
* Grant
* Revoke
* Review all resource histories

Admin access must still be audited.

---

# 15. ORIGINAL RESOURCE IMMUTABILITY

This is mandatory.

A Staff user must never directly overwrite the original resource of another Staff member.

If Modify access is granted:

```text
Original Version
remains immutable

New Version
is created

Modified By
is recorded

Change Note
is recorded

Version Number
is incremented
```

Example:

```text
Resource: Machine Learning Classification Notes

Version 1
Owner: Staff A

Staff B receives Modify permission.

Version 2
Created by: Staff B
Based on: Version 1
Change note: Updated examples and practical section
```

Version 1 remains exactly as it was.

Never replace Version 1's file.

Never delete Version 1 automatically.

Never rewrite Version 1's metadata destructively.

---

# 16. Versioning Model

Create immutable `resource_versions`.

Recommended fields:

```text
id
resource_id
version_number
parent_version_id
storage_path
checksum
file_size
mime_type
created_by
created_at
change_note
status
published_at
```

The logical resource can point to a current published version.

Historical versions remain immutable.

---

# 17. Modified Resource Publishing

When a Staff user modifies an authorized resource:

1. Create new version.
2. Validate new file.
3. Process new file.
4. Generate metadata.
5. Generate topic mapping.
6. Generate embedding.
7. Compare against prior versions.
8. Store as proposed or published version according to permission.
9. Preserve original version.
10. Record audit event.

If the permission is Modify but publishing requires owner approval, use:

```text
DRAFT_VERSION
PENDING_REVIEW
PUBLISHED
REJECTED
ARCHIVED
```

Do not silently change the current published version.

---

# 18. RESOURCE DISCOVERY VISIBILITY

Separate discovery from actual resource usage.

A resource may have:

```text
PRIVATE
DEPARTMENT_DISCOVERABLE
INSTITUTION_DISCOVERABLE
```

These control whether metadata can appear in search.

However:

**Discovery does not grant access.**

A Staff member may discover that a resource exists but still cannot preview, download, use, or modify it without the required permission.

Do not expose restricted content merely because a resource is searchable.

---

# 19. SEARCH AUTHORIZATION

This is mandatory.

Do not:

1. Search every resource.
2. Return everything.
3. Filter on the frontend.

Instead:

1. Determine current authenticated user.
2. Determine role.
3. Determine department.
4. Determine explicit resource permissions.
5. Build the authorized candidate set.
6. Perform semantic search only over authorized candidates.
7. Rank results.
8. Return only authorized resources.

A Staff user's semantic search must never reveal restricted resource content.

Do not even use restricted documents as hidden context for a Staff answer.

---

# 20. SEMANTIC SEARCH

Use:

* Sentence Transformers
* Embeddings
* pgvector
* PostgreSQL
* Hybrid search

Search must work by meaning, not just exact text.

Examples:

```text
materials for teaching tree based classification
```

should be able to find resources about:

```text
Decision Trees
Random Forest
Classification
Entropy
Information Gain
```

Search should combine:

```text
Semantic relevance
Keyword relevance
Course relevance
Unit relevance
Topic relevance
Resource type relevance
```

This directly follows the existing project specification and presentation.  

---

# 21. HYBRID SEARCH

Use a configurable ranking model.

Initial architecture:

```text
semantic_score
keyword_score
course_score
unit_score
topic_score
resource_type_score
quality_score
reuse_score
```

Then:

```text
final_score
```

Do not hardcode arbitrary values into components.

Keep ranking weights in configuration.

Do not claim that any weighting is scientifically optimal.

The existing planning material uses semantic similarity, keyword matching, curriculum alignment, ratings and reuse/usage signals as recommendation inputs. 

---

# 22. TEACHING INTENT

Create a dedicated workflow called:

**Teaching Intent**

The user enters a natural-language requirement.

Example:

```text
I need resources to teach Decision Trees and Random Forest for a 2-hour lecture.
```

The system should derive:

```text
Course
Unit
Topics
Purpose
Duration
Difficulty where available
Preferred resource types where available
```

Do not immediately perform recommendations without showing the interpreted teaching requirement.

The user must be allowed to correct the extracted intent.

---

# 23. TEACHING INTENT UI

Use:

```text
What are you planning to teach?
```

Supporting fields:

```text
Course
Unit
Duration
Purpose
Resource Type
Difficulty
```

Primary action:

```text
Build Teaching Kit
```

Use professional wording.

Do not use:

```text
AI Magic
AI Powered
Ask the AI
AI Recommendations
```

---

# 24. RECOMMENDATION ENGINE

Use content-based recommendation.

Do not build collaborative filtering.

Do not train a custom recommendation model.

Recommendation inputs:

```text
Semantic similarity
Keyword relevance
Course match
Unit match
Topic coverage
Curriculum alignment
Resource type
Quality
Rating
Reuse
Usage
```

The original project plan specifically recommends content-based ranking because a new platform has limited historical data. 

---

# 25. EXPLAINABLE RECOMMENDATIONS

Every recommendation must provide real reasons.

Example:

```text
Decision Tree Lecture Notes

Why this resource?

Strong topic match
Same course
Same unit
Covers Decision Tree
Covers Entropy
Frequently reused
High resource rating
```

Never generate a generic sentence that is not based on actual signals.

Do not say:

```text
This resource was selected because it is highly intelligent and relevant.
```

unless those signals actually exist.

---

# 26. TEACHING KIT

Teaching Kit is the signature workflow.

A Teaching Kit is a structured combination of complementary resources.

Example:

```text
Teaching Kit
Decision Trees and Random Forest

Introduction
Concept
Deep Dive
Practical
Assessment
```

Possible resources:

```text
Lecture Notes
Presentation
Concept Notes
Practical/Lab
Question Bank
```

The original project materials define Teaching Kit as resource combinations rather than isolated file recommendations. 

---

# 27. TEACHING KIT ALGORITHM

Use a simple explainable coverage-maximization algorithm.

Input:

```text
Requested topics
Authorized candidate resources
Recommendation scores
Resource topic mappings
```

Algorithm:

```text
covered_topics = empty set

while coverage < target:
    calculate uncovered topics for each candidate
    calculate candidate value
    select resource that provides strong new topic coverage
    apply recommendation score
    apply redundancy penalty
    add selected resource
    update covered topics
```

Stop when:

```text
Coverage target reached
```

or:

```text
No candidate provides meaningful additional coverage
```

Do not select unnecessary duplicate resources.

The existing build plan proposes a greedy coverage approach with a 90% target for the MVP. 

---

# 28. COVERAGE

Coverage must be dynamically calculated.

Basic calculation:

```text
matched requested topics
/
total requested topics
* 100
```

Example:

```text
Coverage: 92%

Covered:
Decision Tree
Entropy
Information Gain
Gini Index
Random Forest

Missing:
Confusion Matrix
```

Do not hardcode:

```text
92%
94%
91%
```

These values must come from actual matching.

---

# 29. DUPLICATE AND SIMILARITY DETECTION

When uploading a resource:

1. Extract text.
2. Generate embedding.
3. Query nearest resources using pgvector.
4. Respect resource visibility and access boundaries.
5. Compare similarity.
6. Present similar resources.
7. Allow continuation.

Initial similarity threshold may be configurable.

The existing project plan proposes a configurable cosine-similarity threshold with 0.88 as an MVP baseline. 

Never automatically delete the upload.

Never automatically reject it.

---

# 30. REUSE WORKFLOW

When a similar resource is found:

```text
Similar resource found

Existing resource:
Decision Tree Lecture Notes

Similarity:
91%

Actions:
View Resource
Request Access
Use Existing Resource
Continue Upload
```

The actual similarity must be calculated.

The message:

```text
REUSE BEFORE RECREATE
```

may be used as a product principle.

Do not use it as meaningless marketing copy everywhere.

---

# 31. RESOURCE UPLOAD

Primary supported format:

**PDF**

Recommended secondary support:

* TXT
* PPT/PPTX
* DOC/DOCX

Implement only formats that can be properly processed.

Do not show support for a format unless the backend actually handles it.

---

# 32. UPLOAD PIPELINE

```text
Upload
File Validation
Quarantine
Malware/Safety Check
Storage
Resource Record
Text Extraction
Text Cleaning
Chunking
Metadata Extraction
Topic Extraction
Curriculum Mapping
Embedding
Vector Indexing
Similarity Detection
Search Availability
Ready
```

Do not publish a resource before required safety validation has passed.

The old security specification requires server-side file size/type controls and malware scanning before files become available to other users. 

---

# 33. FILE SAFETY

Validate server-side:

* File size
* MIME type
* Extension
* Actual file content
* Filename
* Storage path
* Upload identity
* Authorization

Use generated storage identifiers.

Never use raw user filenames as storage keys.

Prevent:

* Path traversal
* Invalid paths
* Unexpected MIME types
* Executable uploads
* Unsupported documents

---

# 34. MALWARE SCANNING

Create a real scanner interface.

Example abstraction:

```text
FileSafetyScanner
```

The scanner must have a real production implementation before files are exposed to other users.

If a production scanner is not configured:

```text
Uploaded file state:
QUARANTINED
```

Do not falsely display:

```text
Safe
Approved
Scanned
```

when no scanner actually ran.

Do not fabricate malware-scan results.

---

# 35. DOCUMENT PROCESSING

Use PyMuPDF for PDF processing.

Pipeline:

```text
PDF
Text Extraction
Text Cleaning
Text Normalization
Chunking
Topic Detection
Keyword Extraction
Metadata Extraction
Embedding
```

Support OCR only when genuinely necessary.

Do not add a heavy OCR system to the MVP without a real scanned-document requirement.

---

# 36. EMBEDDING SYSTEM

Use Sentence Transformers.

The existing plan proposes a lightweight model such as:

```text
all-MiniLM-L6-v2
```

as an MVP baseline.

Make the model configurable.

Record the model used for each embedding.

Do not mix incompatible models in the same active vector index.

Store:

```text
embedding_model
embedding_dimension
created_at
resource_id
chunk_id
```

---

# 37. LLM METADATA EXTRACTION

LLM use is an internal implementation mechanism.

Do not expose it in the UI.

Possible development provider:

```text
Ollama
```

Production provider:

```text
Configured through a provider adapter
```

Do not invent a production provider or API credential.

If a provider is not configured, metadata extraction must use a deterministic fallback where possible.

Core resource search must not become completely unusable because the LLM provider is unavailable.

---

# 38. HUMAN-MADE CONTENT RULE

The project must never look or read like an AI-generated application.

No user-facing text should contain unnecessary phrases such as:

```text
AI powered
AI driven
Generated by AI
Powered by AI
Smart AI
Intelligent AI
AI assistant
```

Do not add technical AI terminology to the interface merely to advertise the implementation.

The internal backend can use:

* Embeddings
* LLMs
* Sentence Transformers
* NLP
* Vector search

The product UI does not need to discuss how those mechanisms work.

The legacy UI guidelines explicitly require generated content to read naturally and prohibit visible AI references. 

---

# 39. CONVERSATION FEATURE

Current user requirement overrides the older restriction against a generic chatbot.

However, Connect Plus must **not** implement a generic general-purpose chatbot.

The conversation feature must be a resource and teaching workflow.

UI name:

```text
Conversation
```

or:

```text
Teaching Conversation
```

Do not label it:

```text
AI Chat
AI Assistant
AI Chatbot
```

---

# 40. CONVERSATION CAPABILITIES

The conversation system should support:

* Search for teaching resources
* Explain accessible resource content
* Summarize an accessible resource
* Compare accessible resources
* Identify covered topics
* Identify missing topics
* Suggest Teaching Kit composition
* Refine a teaching requirement
* Search curriculum content
* Explain resource matching
* Find related resources
* Help navigate Connect Plus
* Explain access permissions when appropriate

---

# 41. CONVERSATION SECURITY

The conversation system must respect the user's resource permissions.

### STAFF

Conversation context:

```text
Own resources
Explicitly authorized resources
Publicly discoverable metadata without restricted content
Accessible curriculum information
```

### HOD

Conversation context:

```text
Own resources
All Staff resources in own department
Authorized department resources
Department curriculum
```

### ADMIN

Conversation context:

```text
Institution-wide resources
Institution curriculum
Operational information that the Admin is legitimately allowed to inspect
```

Never use inaccessible resources as hidden context.

Never reveal information about resources the user is not authorized to know.

---

# 42. CONVERSATION HALLUCINATION CONTROL

If the indexed resource content does not contain the answer:

Do not invent.

Return a direct response such as:

```text
I could not find that information in the resources available to you.
```

If the question requires information outside the platform's knowledge scope:

```text
That information is not available in your current Connect Plus resource scope.
```

Do not fabricate citations.

Do not fabricate document names.

Do not invent academic policies.

---

# 43. CONVERSATION CITATIONS

When the conversation answer uses resource content, provide source references such as:

```text
Source:
Decision Tree Lecture Notes
Page 8
```

or:

```text
Source:
Machine Learning Unit III Notes
Section: Decision Trees
```

Use real source metadata.

Do not invent page numbers.

---

# 44. CONVERSATION HISTORY

Create:

```text
conversations
conversation_messages
```

Each conversation belongs to a user.

Messages contain:

```text
role
content
created_at
resource_context_ids
```

Do not store secrets in conversation messages.

Do not include full private document contents in logs.

---

# 45. USER PROFILE

Every user must have a professional profile.

Required:

```text
Full Name
Employee ID
Official Email
Role
Department
Designation
Job Profile
Specialization
Assigned Courses
Mobile Number
Profile Photo
Short Bio
```

Optional:

```text
LinkedIn
GitHub
```

The older profile model explicitly includes professional identity, department, role label, mobile, profile photo and external professional links. 

---

# 46. JOB PROFILE

Add a professional layer separate from authentication.

Example:

```text
Designation:
Assistant Professor

Job Profile:
Machine Learning and Data Science

Specialization:
Machine Learning
Computer Vision

Assigned Courses:
Machine Learning
Deep Learning
```

Job profile fields must be editable only according to role and authorization.

Staff must not be able to change:

* Department
* Role
* Employee ID

without authorized administrative action.

---

# 47. USER ID MODEL

Use two concepts.

## Internal identity

Use Supabase Auth UUID.

Never expose this unnecessarily.

## Institutional identity

Use:

```text
employee_id
```

This is the human-facing professional identifier.

It must be unique.

Do not use email as the database primary key.

---

# 48. LOGIN MODEL

Use one login screen.

Do not create separate login pages for:

* Admin
* HOD
* Staff

The user enters their identity.

The backend authenticates them.

After authentication, the account role determines the application mode.

The legacy authentication plan uses one login experience and role-based post-login routing. 

---

# 49. STAFF AND HOD LOGIN IDENTITY

For institution-provisioned Staff and HOD accounts, use the official institutional identity model from the legacy account plan:

```text
<employee_id>@ritrjpm.ac.in
```

No public self-registration should be enabled for production Staff and HOD accounts unless explicitly required.

Accounts should be provisioned by authorized Admin/HOD workflows.

---

# 50. ADMIN LOGIN

Bootstrap Admin account:

```text
zetraplayz472@gmail.com
```

The password supplied by the operator must **never** be written into:

* Source code
* SQL files
* Seed files
* README
* Git
* Frontend
* Logs
* Analytics
* Tests
* Documentation
* This project prompt

Inject the bootstrap password through the secure deployment environment.

After initial provisioning:

* Force password rotation if applicable
* Revoke temporary credentials where applicable
* Enable stronger authentication when available
* Audit the account

Never hardcode credentials.

---

# 51. FIRST LOGIN

For provisioned Staff/HOD accounts, the legacy onboarding model may be used:

* Initial password follows the approved institutional onboarding rule
* Initial login requires password change
* No normal application access before password change
* Password is never logged
* Temporary credentials are never exposed through the frontend

If the existing authentication implementation already has a safer onboarding mechanism, preserve that implementation instead of replacing it.

---

# 52. AUTHENTICATION SECURITY

Use Supabase Auth as the authentication authority.

Use JWT-based authentication for FastAPI authorization.

Do not build a second custom password database if Supabase Auth is used.

JWT validation must include the relevant:

* Signature
* Expiration
* Issuer
* Audience where configured
* Required claims

Session tokens must be handled securely.

Do not place sensitive tokens in localStorage when secure cookie/session mechanisms are available.

---

# 53. LOGIN RATE LIMITING

Apply:

* IP rate limiting
* Account-level failed attempt limits
* Progressive delay
* Lockout state
* Password reset handling
* Security audit events

The legacy authentication rules specify a 10 requests per IP per minute login limit and temporary account lockout after repeated failures. 

Do not add Redis merely because an old document mentions it.

For a single-instance deployment, implement the simplest reliable mechanism.

If production topology becomes multi-instance and shared rate-limiting state is required, introduce an appropriate shared store only after validating that requirement.

---

# 54. NO PASSWORD LOGGING

Never log:

* Password
* Password hash
* Access token
* Refresh token
* API key
* Supabase service-role key
* LLM provider key
* Signed storage URL containing sensitive parameters

The older security plan explicitly prohibits passwords, tokens and sensitive data in application logs. 

---

# 55. DATABASE ARCHITECTURE

Final production database:

**Supabase PostgreSQL**

Use:

**pgvector**

Do not use MySQL.

Do not use a second production database.

Do not introduce FAISS as the production vector store.

---

# 56. CORE DATABASE TABLES

Create only tables that have a real purpose.

Recommended schema:

```text
profiles
departments
courses
course_units
topics

resources
resource_versions
resource_files

resource_topics
tags
resource_tags

resource_permissions
resource_access_requests

resource_chunks
resource_embeddings
processing_jobs

ratings
comments
resource_usage_events

teaching_intents
teaching_intent_topics

teaching_kits
teaching_kit_items

conversations
conversation_messages

notifications
audit_logs
security_events
search_logs

platform_settings
```

---

# 57. PROFILES

Recommended:

```text
id
auth_user_id
employee_id
full_name
email
role
department_id
designation
job_profile
specialization
mobile_number
mobile_verified
profile_image_path
bio
linkedin_url
github_url
status
must_change_password
created_at
updated_at
```

Constraints:

* `auth_user_id` unique
* `employee_id` unique
* role constrained to ADMIN/HOD/STAFF
* department required for HOD/STAFF
* Admin may have null department

---

# 58. DEPARTMENTS

```text
id
name
code
description
hod_profile_id
status
created_at
updated_at
```

Constraints:

* Department code unique
* Active HOD belongs to same department
* A HOD cannot be simultaneously assigned as HOD to another department unless explicitly supported

---

# 59. COURSES

```text
id
department_id
name
code
description
status
created_at
updated_at
```

A course belongs to a department unless institutional policy explicitly allows shared courses.

---

# 60. COURSE UNITS

```text
id
course_id
name
description
order_index
status
created_at
updated_at
```

---

# 61. TOPICS

```text
id
unit_id
name
description
order_index
status
created_at
updated_at
```

---

# 62. RESOURCES

```text
id
owner_id
department_id
course_id
unit_id
title
description
resource_type
visibility
processing_status
current_version_id
status
created_at
updated_at
archived_at
```

Resource ownership must always map to a real profile.

---

# 63. RESOURCE VERSIONS

```text
id
resource_id
version_number
parent_version_id
created_by
storage_path
checksum
mime_type
file_size
processing_status
version_status
change_note
created_at
published_at
```

Version rows are immutable after publication.

---

# 64. RESOURCE PERMISSIONS

```text
id
resource_id
grantee_user_id
permission_level
granted_by
reason
starts_at
expires_at
revoked_at
created_at
updated_at
```

Permission levels:

```text
VIEW
USE
MODIFY
```

---

# 65. ACCESS REQUESTS

```text
id
resource_id
requester_id
requested_permission
reason
status
responded_by
response_note
requested_at
responded_at
expires_at
```

---

# 66. RESOURCE CHUNKS

```text
id
resource_id
version_id
chunk_index
content
content_hash
token_count
created_at
```

Do not store unnecessary duplicate text.

---

# 67. RESOURCE EMBEDDINGS

```text
id
resource_id
version_id
chunk_id
model_name
embedding_dimension
embedding
created_at
```

Use pgvector.

---

# 68. RESOURCE TOPICS

```text
resource_id
topic_id
source
confidence
created_at
```

`source` could represent:

```text
MANUAL
EXTRACTED
MAPPED
```

Do not pretend extracted confidence is scientifically validated unless it actually is.

---

# 69. TAGS

```text
id
name
normalized_name
created_at
```

Use normalization to prevent:

```text
Machine Learning
machine-learning
machine learning
```

from becoming unnecessary duplicates.

---

# 70. RATINGS

```text
id
resource_id
user_id
rating
created_at
updated_at
```

Constraint:

```text
UNIQUE(resource_id, user_id)
```

One active rating per user/resource.

---

# 71. COMMENTS

```text
id
resource_id
user_id
body
status
created_at
updated_at
deleted_at
```

Allow safe moderation without destroying audit history.

---

# 72. RESOURCE USAGE

```text
id
resource_id
user_id
event_type
source
metadata
created_at
```

Examples:

```text
VIEW
DOWNLOAD
USE
ADD_TO_KIT
REUSE
SHARE
SEARCH_RESULT
```

Do not record sensitive content unnecessarily.

---

# 73. TEACHING INTENTS

```text
id
user_id
raw_request
course_id
unit_id
purpose
duration_minutes
difficulty
status
created_at
updated_at
```

---

# 74. TEACHING INTENT TOPICS

```text
teaching_intent_id
topic_id
importance
source
created_at
```

---

# 75. TEACHING KITS

```text
id
owner_id
teaching_intent_id
title
objective
coverage_percentage
status
created_at
updated_at
```

---

# 76. TEACHING KIT ITEMS

```text
id
teaching_kit_id
resource_id
resource_version_id
position
role
match_score
topic_contribution
selection_reason
created_at
```

Possible role:

```text
INTRODUCTION
CONCEPT
DEEP_DIVE
PRACTICAL
ASSESSMENT
REFERENCE
```

---

# 77. PROCESSING JOBS

```text
id
resource_id
version_id
job_type
status
attempt_count
started_at
completed_at
error_code
error_message
created_at
updated_at
```

Job types:

```text
FILE_VALIDATION
MALWARE_SCAN
TEXT_EXTRACTION
TEXT_CLEANING
METADATA_EXTRACTION
TOPIC_EXTRACTION
CURRICULUM_MAPPING
EMBEDDING
SIMILARITY
INDEXING
FULL_PROCESSING
```

---

# 78. CONVERSATIONS

```text
id
user_id
title
status
created_at
updated_at
```

---

# 79. CONVERSATION MESSAGES

```text
id
conversation_id
sender_type
content
resource_context_ids
created_at
```

Do not store raw secret configuration.

Do not store unnecessarily large extracted documents.

---

# 80. NOTIFICATIONS

Use notifications only for actual product events.

Examples:

* Access request received
* Access request approved
* Access request rejected
* Resource processing completed
* Resource processing failed
* Resource version review requested
* Teaching Kit ready where asynchronous processing is used
* Administrative announcement

No fake notifications.

---

# 81. AUDIT LOG

```text
id
actor_id
actor_role
action
target_type
target_id
department_id
result
metadata
created_at
request_id
```

Audit:

* Role changes
* Department changes
* Resource permissions
* Resource version publication
* Resource deletion/archival
* Admin actions
* HOD administrative actions
* Maintenance changes
* Configuration changes
* Security events

---

# 82. SECURITY EVENTS

Track:

* Login success
* Login failure
* Lockout
* Password change
* Password reset
* Session revoke
* Role change
* Permission escalation
* Suspicious access attempt

Never store raw passwords or tokens.

---

# 83. SEARCH LOGS

Search logs may capture:

```text
user_id
query
result_count
filters
created_at
```

Do not capture sensitive private document text.

Search logs must obey role and privacy rules.

---

# 84. PLATFORM SETTINGS

Use only actual settings.

Example:

```text
maintenance_mode
maintenance_message
resource_upload_enabled
registration_enabled
semantic_search_enabled
conversation_enabled
default_duplicate_threshold
```

No decorative configuration.

---

# 85. ROW LEVEL SECURITY

Supabase RLS is mandatory.

## STAFF

Allow:

* Own profile
* Own resources
* Own resource versions
* Own access requests
* Approved resources
* Department-discoverable metadata where permitted
* Own Teaching Kits
* Own conversations
* Own ratings/comments

Deny:

* Other Staff private resource content
* Other Staff versions without permission
* Other Staff private conversations
* Admin data

## HOD

Allow:

* Own profile
* Staff profiles in own department where appropriate
* All Staff resources in own department
* Department resources
* Department analytics
* Department access requests
* Department Teaching Kits
* Own conversations

Deny:

* Other departments

## ADMIN

Allow all legitimate application and administrative data.

Do not use unrestricted browser-side service-role credentials.

---

# 86. VECTOR SEARCH SECURITY

This is a critical implementation detail.

Do not perform:

```text
Search all embeddings
then filter unauthorized resources
```

Instead:

```text
Determine authorized resource set
Perform vector search inside that authorized scope
Return only authorized rows
```

Implement this through a secure database function, authorized query, or backend query plan.

The same access scope must be used by:

* Search
* Recommendations
* Duplicate detection
* Conversation retrieval
* Related-resource retrieval

---

# 87. FRONTEND ARCHITECTURE

Use:

```text
Next.js
TypeScript
Tailwind CSS
```

Prefer a clean feature-oriented structure.

Proposed structure:

```text
frontend/
    app/
    components/
    features/
        auth/
        dashboard/
        resources/
        search/
        teaching-intent/
        teaching-kits/
        curriculum/
        access/
        conversation/
        profile/
        notifications/
        admin/
        hod/
        staff/
    lib/
    services/
    hooks/
    types/
    styles/
    public/
        assets/
```

Do not create files that have no actual purpose.

---

# 88. BACKEND ARCHITECTURE

Use:

```text
Python
FastAPI
Pydantic
PostgreSQL
pgvector
Supabase
```

Proposed structure:

```text
backend/
    app/
        main.py
        core/
        auth/
        users/
        departments/
        curriculum/
        resources/
        permissions/
        access_requests/
        processing/
        search/
        recommendations/
        teaching_intent/
        teaching_kits/
        conversation/
        analytics/
        admin/
        hod/
        health/
        audit/
```

Do not create a separate service for every folder.

Use logical modules.

---

# 89. API DESIGN

Use versioned REST APIs.

Recommended:

```text
/api/v1/auth
/api/v1/users
/api/v1/departments
/api/v1/courses
/api/v1/curriculum
/api/v1/resources
/api/v1/permissions
/api/v1/access-requests
/api/v1/search
/api/v1/recommendations
/api/v1/teaching-intents
/api/v1/teaching-kits
/api/v1/ratings
/api/v1/comments
/api/v1/conversations
/api/v1/notifications
/api/v1/analytics
/api/v1/admin
/api/v1/hod
/api/v1/health
```

The exact endpoint design can change after repository inspection, but maintain clean REST semantics.

Do not invent endpoints that are never used.

---

# 90. API AUTHORIZATION

Every protected endpoint must:

1. Authenticate the caller.
2. Resolve the actual role.
3. Resolve department scope.
4. Validate resource ownership or permission.
5. Validate input.
6. Perform the business operation.
7. Return only permitted fields.

Never trust:

```text
role
department_id
owner_id
resource_owner_id
permission
```

submitted by the client.

---

# 91. MASS ASSIGNMENT PROTECTION

Never directly pass a request body into a database update.

Explicitly define mutable fields.

Example:

A Staff user may update:

```text
title
description
tags
```

but cannot update:

```text
owner_id
department_id
permission_level
role
created_by
audit fields
```

unless the backend explicitly authorizes the action.

---

# 92. FRONTEND NAVIGATION

The interface must change according to the logged-in role.

## STAFF NAVIGATION

```text
Dashboard
Discover
My Resources
Shared With Me
Access Requests
Teaching Intent
Teaching Kits
Conversation
Curriculum
Notifications
Profile
Settings
```

## HOD NAVIGATION

```text
Department Overview
Department Resources
Staff
Access Requests
Teaching Intent
Teaching Kits
Conversation
Curriculum
Analytics
Notifications
Profile
Settings
```

## ADMIN NAVIGATION

```text
System Overview
Users
Departments
Resources
Access Control
Curriculum
Processing
Search
Conversation
Analytics
Database
Storage
Security
Audit Logs
Maintenance
Deployment
Configuration
Profile
```

Do not display irrelevant navigation items.

---

# 93. ROLE-SPECIFIC DASHBOARD

Do not build one generic dashboard for all users.

The old authentication and role documents explicitly require role-tailored application experiences. 

---

# 94. STAFF DASHBOARD

Display real data:

```text
My Resources
Shared With Me
Pending Access Requests
Recent Searches
Teaching Kits
Recent Activity
```

Primary action:

```text
What are you planning to teach?
```

Secondary actions:

```text
Upload Resource
Search Resources
View Teaching Kits
```

No fake statistics.

---

# 95. HOD DASHBOARD

Display:

```text
Department Resources
Staff Resources
Recent Department Activity
Resource Usage
Top Topics
Resource Gaps
Pending Access Requests
Recent Resource Updates
```

The HOD should immediately understand the state of their department.

---

# 96. ADMIN DASHBOARD

Display real operational data:

```text
Total Users
Staff Count
HOD Count
Departments
Resources
Resources Processing
Resources Reused
Pending Access Requests
System Health
Database Health
Storage Health
Security Events
Maintenance State
```

Only display metrics actually available.

Do not invent uptime.

Do not invent CPU usage.

Do not invent latency.

Do not invent active-user counts.

---

# 97. RESOURCE LIBRARY

Resource library must support:

* Search
* Semantic search
* Filters
* Tags
* Course
* Unit
* Topic
* Resource type
* Department
* Rating
* Reuse
* Permission state

Staff view:

Only resources they are authorized to see.

HOD view:

All Staff resources within their department.

Admin view:

All resources.

---

# 98. RESOURCE CARD

Each card may display:

```text
Title
Resource Type
Course
Unit
Topics
Owner
Department
Rating
Reuse Count
Access State
Version
```

Do not show sensitive details to unauthorized users.

---

# 99. RESOURCE DETAIL

Sections:

```text
Title
Description
Owner
Department
Course
Unit
Topics
Tags
Resource Type
Version
Summary
Coverage
Rating
Usage
Related Resources
Similar Resources
Version History
Permission
```

Actions vary by role.

---

# 100. STAFF RESOURCE DETAIL ACTIONS

Own resource:

```text
Edit
Upload New Version
Archive
Manage Access
View Usage
View Ratings
```

Authorized external resource:

```text
View
Use
Download
Add to Teaching Kit
Rate
Comment
```

Modify-permitted resource:

```text
Create New Version
```

Never:

```text
Overwrite Original
```

---

# 101. HOD RESOURCE DETAIL

For Staff resources in own department:

```text
View
Use
Download
Add to Teaching Kit
View Version History
View Usage
View Ratings
Comment
```

Modification must use versioning.

---

# 102. ADMIN RESOURCE DETAIL

Admin may:

```text
View
Use
Download
Create Version
Archive
Restore
Manage Access
Review History
Review Audit
Moderate
```

All sensitive actions audited.

---

# 103. RESOURCE UPLOAD UI

Use a large academic upload area.

Primary:

```text
Upload Resource
```

Fields:

```text
Title
Description
Department
Course
Unit
Topic
Resource Type
Tags
File
```

Do not label the processing step with AI terminology.

Use:

```text
Preparing resource
Reading content
Identifying topics
Preparing search information
Resource ready
```

---

# 104. RESOURCE PROCESSING UI

States:

```text
Uploading
Validating
Scanning
Processing
Reading content
Extracting topics
Preparing search index
Checking similar resources
Ready
Failed
```

All states must reflect actual backend state.

---

# 105. ACCESS REQUEST UI

Staff sees:

```text
Resource Access Request
Requested access:
VIEW / USE / MODIFY

Reason:
[...]
```

After submission:

```text
Pending approval
```

Owner/HOD/Admin sees:

```text
Requester
Resource
Requested permission
Reason
Created
Approve
Reject
```

Modification permission should be visibly stronger than basic use access.

---

# 106. VERSION HISTORY UI

Display:

```text
Version 4
Version 3
Version 2
Version 1
```

Each version:

```text
Version
Created by
Created date
Change note
Status
```

Original versions must be read-only.

---

# 107. ACCESS HISTORY

Display:

```text
Access granted
Access revoked
Access requested
Access approved
Access rejected
Resource viewed
Resource downloaded
Resource used
```

The user should not see audit information outside their permission scope.

---

# 108. RATINGS

Use 1 to 5 rating.

One rating per user/resource.

Comments are optional.

Rating is only available where the user has legitimate resource use/access.

---

# 109. ANALYTICS

## Staff

Show:

* Own resources
* Resources reused
* Teaching Kits
* Most-used resources
* Topics contributed

## HOD

Show:

* Department resource count
* Department reuse
* Top topics
* Resource gaps
* Staff contributions
* Resource demand

## Admin

Show:

* Institution resource volume
* Department distribution
* Reuse trends
* Search trends
* Resource types
* Resource gaps
* Processing failures
* Access activity
* Security events

Use actual database values.

---

# 110. RESOURCE GAP INTELLIGENCE

Determine gaps from curriculum.

Example:

```text
Course:
Machine Learning

Unit:
Classification

Topic:
Confusion Matrix

Available Resources:
1

Status:
Resource Gap
```

Do not call it a gap based on arbitrary thresholds.

Use configurable rules.

---

# 111. CONVERSATION UI DESIGN

Place a compact conversation panel in the authenticated application.

Possible locations:

* Dashboard
* Discover
* Teaching Intent
* Resource Detail

The conversation panel must feel like a professional productivity feature, not a generic chatbot.

Use:

```text
Conversation
```

Input:

```text
How can I prepare this topic for a two hour lecture?
```

Suggested contextual actions:

```text
Find resources
Summarize resource
Compare resources
Build Teaching Kit
Find missing topics
```

Do not use glowing AI circles, robot avatars, brain icons, circuit graphics or futuristic chatbot visuals.

---

# 112. HUMAN CONTENT STYLE

All system-generated text must be:

* Direct
* Professional
* Academic
* Short
* Specific
* Human-sounding
* Context-aware

Avoid:

* Empty marketing language
* Generic slogans
* Repeated introductions
* Excessive adjectives
* Fake confidence
* Fake expertise
* Overly long responses
* Emoji
* Em dashes
* En dashes
* AI terminology in UI

The legacy content policy explicitly requires plain human-sounding generated text and prohibits visible AI references and generated emoji. 

---

# 113. UI LANGUAGE

Prefer:

```text
Search teaching resources
What are you planning to teach?
Shared with you
Access requested
Access approved
Access denied
Version history
Department resources
Resource gap
Coverage
Missing topics
Why this resource?
Build Teaching Kit
```

Avoid:

```text
AI Magic
AI Brain
AI Powered
Smart AI
Magic Search
AI Guru
```

---

# 114. UI DESIGN SYSTEM

Primary style:

**Claymorphism**

Secondary structural style:

**Premium Solid Morphism**

Selective supporting style:

**Glass panels**

The existing UI guidelines explicitly require claymorphism, tactile surfaces, subtle depth and consistent visual treatment. 

---

# 115. EXACT COLOR PALETTE

Use exactly:

```text
#faf8f5
#e5eeec
#fff2c6
#6a716e
```

## #faf8f5

Primary application background.

## #e5eeec

Secondary surfaces.

## #fff2c6

Accent and highlights.

## #6a716e

Muted text, supporting labels and secondary UI.

Do not replace these with another palette unless explicitly requested.

---

# 116. COLOR USAGE

Do not use every color everywhere.

Suggested:

```text
Background:
#faf8f5

Primary surface:
#ffffff or carefully controlled light surface derived from the palette

Secondary surface:
#e5eeec

Highlight:
#fff2c6

Muted text:
#6a716e
```

Keep contrast readable.

Do not use the accent color for every button.

---

# 117. MORPHISM

## Claymorphism

Use on:

* Cards
* Buttons
* Search containers
* Upload areas
* Teaching Kit panels
* Profile cards
* Access request panels
* Status surfaces

## Solid morphism

Use for:

* Main page structure
* Tables
* Lists
* Administrative panels
* Resource details
* Curriculum tree
* Search results

## Glass

Use only on:

* Floating search
* Small navigation overlays
* Contextual modal surfaces
* Temporary overlays

Do not create a glass-heavy interface.

---

# 118. NO BACKGROUND IMAGE STYLE

Do not use:

* Full-screen image backgrounds
* Stock photography backgrounds
* AI-looking abstract backgrounds
* Cyber backgrounds
* Circuit boards
* Large decorative illustrations behind text

The application should use clean surfaces and spacing.

---

# 119. IMAGE AND ASSET POLICY

All logos, icons and image assets must be:

* Transparent background
* Clean edges
* Professional
* Academic
* Minimal
* Consistent

Preferred:

```text
SVG
Transparent PNG
```

Do not use rectangular background images.

Do not use generated stock-photo-looking scenes.

Do not add decorative imagery simply to fill empty space.

---

# 120. LOGO

Create or use a simple Connect Plus logo.

Requirements:

* Transparent background
* SVG preferred
* No personal name
* No AI brain
* No robot
* No circuit
* No neon
* Professional academic identity

Store assets under:

```text
public/assets/
```

with descriptive filenames.

---

# 121. RESPONSIVE DESIGN

Primary target:

Desktop/laptop.

Also support:

Tablet.

Mobile browser.

Do not create a native mobile application.

The old platform references desktop/mobile deployment, but current scope specifically keeps Connect Plus as a web application. The larger infrastructure documents also emphasize responsive production behavior and scalable backend architecture. 

---

# 122. ACCESSIBILITY

Implement:

* Keyboard navigation
* Visible focus states
* Semantic HTML
* Proper labels
* Accessible modals
* Accessible dropdowns
* Adequate contrast
* Reduced-motion support
* Screen-reader-friendly controls
* Correct form error association

Do not rely on color alone for status.

---

# 123. MICRO-INTERACTIONS

Use subtle animations for:

* Button feedback
* Card interaction
* Search results
* Upload progress
* Processing status
* Version creation
* Permission approval
* Teaching Kit generation

Animation must represent real state.

Never animate a fake success state.

---

# 124. FRONTEND STATES

Every data-driven component must handle:

```text
Loading
Ready
Empty
Processing
Success
Failure
Unauthorized
Forbidden
Maintenance
Unavailable
Retry
```

No blank screens.

No dead buttons.

No empty navigation routes.

No "Coming Soon" placeholders for core functionality.

---

# 125. ADMIN CONTROL PLANE

Create a distinct Admin experience.

Suggested areas:

```text
Overview
Users
Departments
Resources
Permissions
Curriculum
Processing
Search
Conversation
Analytics
Database
Storage
Security
Audit Logs
Maintenance
Deployment
Configuration
```

The interface must look related to the main application but clearly operational.

Do not expose technical controls to Staff/HOD.

---

# 126. ADMIN DATABASE AREA

Display only actual information:

* Database connection status
* Migration status
* Schema version
* Vector extension state
* Recent failures
* Storage state
* Processing state

Do not build arbitrary SQL consoles unless genuinely required.

Do not expose unrestricted destructive database actions.

---

# 127. ADMIN DEPLOYMENT AREA

Only display actual deployment information.

Potentially:

```text
Frontend status
Backend status
Current release
Latest deployment
Deployment timestamp
Health state
```

If Render API integration is not configured:

```text
Deployment provider status is not configured.
```

Do not fabricate deployment data.

---

# 128. ADMIN MAINTENANCE MODE

Maintenance is a real platform state.

When enabled:

### STAFF

Normal application access is restricted.

### HOD

Normal application access is restricted unless explicitly configured otherwise.

### ADMIN

Admin control plane remains available.

Maintenance state must be enforced server-side.

The legacy production rules require User Plane restriction while keeping the operational Control Plane available. 

---

# 129. MAINTENANCE UI

Normal user message:

```text
Connect Plus is currently under maintenance.

Normal access is temporarily unavailable.
```

Do not expose:

* Database information
* Server details
* Stack traces
* Infrastructure names
* Internal errors
* Secrets

---

# 130. ADMIN OPERATIONAL VISIBILITY

Admin should be able to inspect:

```text
Application status
Database status
Storage status
Processing state
Search state
Conversation provider state
Maintenance state
Security events
Audit activity
```

Only show values actually available.

The production rules explicitly prohibit fake CPU, memory, uptime, active-user and database-health values. 

---

# 131. ERROR HANDLING

Create a centralized error strategy.

## User-safe

```text
The resource could not be processed.
Please try again.
```

## HOD-safe

```text
The department resource could not be processed.
```

## Admin diagnostic

Can show:

* Error category
* Request ID
* Job ID
* Technical diagnostic
* Stack trace if authorized and stored securely

Never show stack traces to Staff/HOD.

---

# 132. ERROR CATEGORIES

Use structured internal codes:

```text
AUTHENTICATION_FAILED
AUTHORIZATION_DENIED
RESOURCE_NOT_FOUND
RESOURCE_ACCESS_DENIED
UPLOAD_INVALID
UPLOAD_TOO_LARGE
RESOURCE_SCAN_FAILED
DOCUMENT_PROCESSING_FAILED
EMBEDDING_FAILED
SEARCH_FAILED
RECOMMENDATION_FAILED
TEACHING_KIT_FAILED
CONVERSATION_UNAVAILABLE
DATABASE_ERROR
STORAGE_ERROR
MAINTENANCE_ACTIVE
RATE_LIMITED
```

Do not expose internal error codes unnecessarily in the UI.

---

# 133. LOAD HANDLING

Do not introduce:

* Kafka
* RabbitMQ
* Kubernetes
* Microservices
* Redis
* Additional databases

unless actual workload or deployment evidence requires them.

Initial load handling:

* Pagination
* Query limits
* Connection pooling
* Timeouts
* Rate limiting
* File-size limits
* Processing limits
* Vector result limits
* Background processing
* Controlled concurrency

The infrastructure rules explicitly require real workload-based scaling instead of artificial complexity. 

---

# 134. BACKGROUND PROCESSING

Large document processing must not block the HTTP request unnecessarily.

Use a processing-job model.

For the hackathon:

* Keep infrastructure simple.
* Use a worker/background processing mechanism that fits the actual deployment.
* Do not introduce Kafka or Celery merely because background work exists.

The project planning material explicitly recommends keeping the processing architecture modular and simple. 

---

# 135. DATABASE TRANSACTIONS

Use transactions where operations must be atomic.

Examples:

* Creating a resource and initial version
* Creating a published version
* Granting permission and recording audit
* Creating Teaching Kit items
* Role change and security audit

Never leave critical operations partially written.

---

# 136. AUDITABILITY

Every sensitive operation must generate an audit event.

Examples:

```text
ADMIN_CREATED_USER
ROLE_CHANGED
DEPARTMENT_CHANGED
RESOURCE_PERMISSION_GRANTED
RESOURCE_PERMISSION_REVOKED
RESOURCE_VERSION_CREATED
RESOURCE_VERSION_PUBLISHED
RESOURCE_ARCHIVED
RESOURCE_RESTORED
HOD_ACCESS_USED
ADMIN_OVERRIDE
MAINTENANCE_ENABLED
MAINTENANCE_DISABLED
SECURITY_LOCKOUT
SESSION_REVOKED
```

Audit logs are not normal user data.

---

# 137. DATA LEAK PREVENTION

Never log:

* Password
* JWT
* Refresh token
* API keys
* File contents
* Private resource content
* Private conversation content
* Full signed URLs

The old security plan explicitly requires sensitive information to remain out of application logs and analytics. 

---

# 138. CORS

Do not use unrestricted:

```text
*
```

for authenticated production APIs.

Allow only the actual frontend origin(s).

Use explicit configuration.

---

# 139. SECURITY HEADERS

Configure appropriate headers such as:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
```

Do not copy an unsafe generic CSP.

Configure according to actual frontend requirements.

---

# 140. ENVIRONMENT VARIABLES

Never hardcode:

* Supabase service role key
* Database credentials
* JWT secrets
* LLM provider credentials
* Admin password
* Storage credentials
* Render credentials

Use environment variables.

Provide:

```text
.env.example
```

without real secret values.

---

# 141. SECRET MANAGEMENT

The supplied Admin password must be treated as a secret.

Never put it in:

* Git
* SQL
* `.md`
* `.env` committed to repository
* Frontend
* Seed fixture
* Test
* Screenshot
* README
* Logs

Only inject it through runtime secret configuration.

---

# 142. SUPABASE STORAGE

Use private storage for protected resources.

Recommended logical buckets:

```text
resource-files
profile-images
```

Keep resource files private.

Use authorized access.

Do not expose permanent public URLs for protected resources.

---

# 143. STORAGE FILE NAMING

Use generated IDs.

Example conceptual path:

```text
resources/{resource_id}/{version_id}/original
```

Do not use:

```text
resources/{original_filename}
```

as the primary storage identity.

---

# 144. STORAGE ACCESS

When a user requests a file:

1. Authenticate.
2. Check role.
3. Check department.
4. Check resource permission.
5. Check version access.
6. Generate authorized access.
7. Log appropriate usage event.

Do not simply expose the storage URL.

---

# 145. SEARCH PERFORMANCE

Use PostgreSQL filtering before vector ranking wherever possible.

Avoid:

```text
Load every resource into Python
Calculate similarity in Python
```

Prefer:

```text
Database filtering
pgvector candidate retrieval
Application ranking
Final response
```

---

# 146. PAGINATION

Every list must be paginated where the dataset can grow.

Examples:

* Resources
* Users
* Comments
* Access requests
* Audit logs
* Processing jobs
* Search results
* Teaching Kits

Do not load entire tables into the frontend.

---

# 147. FRONTEND DATA FETCHING

Avoid unnecessary global state.

Use feature-level data fetching.

Do not request:

```text
All resources
All users
All audit logs
```

when only a small subset is required.

Return only necessary fields.

---

# 148. API RESPONSE SECURITY

Do not return complete database models automatically.

Create response schemas.

Example resource response:

```text
id
title
description
resource_type
course
unit
topics
owner_display_name
department
rating
reuse_count
access_level
version
```

Do not include internal database fields unless needed.

---

# 149. ADMIN RESPONSE SECURITY

Admin can receive additional fields, but still do not return:

* Password hashes
* Secrets
* Service credentials
* Unnecessary private content
* Raw database credentials

---

# 150. PROFESSIONAL DESIGN REFERENCES

Use these as interaction references:

### WhatsApp

Borrow:

* Familiar navigation
* Fast interaction
* Clear state
* Simple controls
* Clean content hierarchy

Do not copy visual branding.

### LinkedIn

Borrow:

* Professional identity
* Profile presentation
* Content cards
* Structured metadata
* Professional resource presentation

Do not turn Connect Plus into a social network.

### RIT Canvas reference

Borrow:

* Academic structure
* Course-oriented organization
* Role-aware dashboards
* Resource organization
* Institutional usability

Do not copy its branding or unrelated LMS functionality.

The attached legacy planning suite explicitly describes WhatsApp-like interaction familiarity, professional collaboration patterns and course/subject organization as reference concepts. 

---

# 151. LANDING PAGE

The landing page must be minimal.

Suggested structure:

```text
Connect Plus

Academic resource sharing and discovery for faculty.

Search teaching resources.
Reuse existing knowledge.
Build structured teaching kits.

[Sign In]
```

Do not include:

* AI slogans
* Fake statistics
* Fake testimonials
* Fake university logos
* Fake faculty quotes
* Fake usage counts

---

# 152. LOGIN PAGE

Clean academic login.

Fields:

```text
College / Account Email
Password
```

Actions:

```text
Sign In
Forgot Password
```

No role selector.

No separate Admin/HOD/Staff login pages.

After authentication, route according to actual role.

---

# 153. PROFILE PAGE

Sections:

```text
Personal Information
Professional Information
Academic Responsibilities
Contact Information
Professional Links
Security
Sessions
```

Role displayed clearly:

```text
ADMIN
HOD
STAFF
```

---

# 154. STAFF PROFESSIONAL PROFILE

Show:

```text
Name
Designation
Department
Job Profile
Specialization
Assigned Courses
Professional Bio
Email
Mobile
LinkedIn
GitHub
```

---

# 155. HOD PROFESSIONAL PROFILE

Add:

```text
Department
HOD status
Department responsibilities
```

Do not expose unrelated administrative data.

---

# 156. ADMIN PROFILE

Add:

```text
Administrative role
System access status
Security settings
Active sessions
```

---

# 157. SESSION MANAGEMENT

Users should be able to review their own active sessions where supported.

Admin may revoke sessions according to policy.

Changing the password should revoke other active sessions unless the authentication infrastructure explicitly handles this another way.

---

# 158. NOTIFICATIONS

Do not create a complex notification platform.

Only notify about real events:

* Permission request
* Permission approval
* Permission rejection
* Resource processing completion
* Resource processing failure
* Version review
* Administrative notices
* Security events relevant to the account

---

# 159. RESOURCE COMMENTS

Comments should support:

* Author
* Body
* Timestamp
* Edit state
* Moderation state

Staff may comment where they have legitimate resource access.

HOD can moderate department resource comments where authorized.

Admin has global moderation authority.

---

# 160. RESOURCE RATINGS

Rating should be based on actual use/access where policy requires.

Never seed fake ratings.

Never artificially inflate ratings.

---

# 161. REAL DEMO DATA

Do not fabricate:

* Faculty identities
* Real institutional statistics
* Real usage counts
* Real ratings
* Real audit activity
* Real deployment history

If demonstration data is required:

* Keep it deterministic.
* Label it clearly as demonstration content.
* Do not present it as actual institutional production data.
* Do not mix demonstration data with real production analytics.

---

# 162. SAMPLE ACADEMIC RESOURCE CONTENT

For development testing, use real or explicitly team-created demonstration academic content.

Preferred demo domain:

```text
Machine Learning
Classification
Decision Trees
Entropy
Information Gain
Gini Index
Random Forest
Confusion Matrix
```

Use this to verify:

* Semantic search
* Recommendation
* Coverage
* Teaching Kit
* Duplicate detection

The attached project plan uses the same academic scenario as the core demonstration path. 

---

# 163. PRIMARY DEMO WORKFLOW

The complete system must support:

### Step 1

Login as Staff.

### Step 2

Open Teaching Intent.

### Step 3

Enter:

```text
I need resources to teach Decision Trees and Random Forest for a 2-hour lecture.
```

### Step 4

The system identifies:

```text
Course:
Machine Learning

Unit:
Classification

Topics:
Decision Tree
Entropy
Information Gain
Gini Index
Random Forest

Purpose:
Teaching

Duration:
2 hours
```

### Step 5

Build Teaching Kit.

### Step 6

Show ranked resources.

### Step 7

Show actual matching reasons.

### Step 8

Show coverage.

### Step 9

Show missing topics.

### Step 10

Open resource detail.

### Step 11

Show actual reuse and rating information if such records exist.

### Step 12

Upload a similar resource.

### Step 13

Run similarity detection.

### Step 14

Show existing similar resource.

### Step 15

Allow user to continue or reuse.

This workflow is central to the supplied product plan. 

---

# 164. HOD DEMO WORKFLOW

Login as HOD.

Show:

```text
Department Overview
```

Open:

```text
Department Resources
```

Search:

```text
Decision Trees
```

The HOD should see all Staff resources belonging to the HOD's department.

Open a Staff resource.

Show:

```text
Owner
Version history
Topics
Course
Ratings
Reuse
```

Use the resource to build a Teaching Kit.

Do not grant the HOD global cross-department access.

---

# 165. STAFF PERMISSION DEMO

Login as Staff B.

Attempt to open Staff A's private resource.

Expected:

```text
Access denied
```

Staff B requests:

```text
USE
```

Staff A approves.

Staff B can now:

* Open
* Preview
* Use
* Download where permitted
* Add to Teaching Kit

If Staff B later receives:

```text
MODIFY
```

a new version is created.

The original remains unchanged.

---

# 166. ADMIN DEMO

Login as Admin.

Show:

```text
System Overview
Users
Departments
Resource Registry
Access Control
Processing
Search
Conversation
Audit
Maintenance
```

Verify that Admin can inspect the complete platform.

Do not show fake infrastructure metrics.

---

# 167. ADMIN DEVELOPER CONTROL

Because Admin has developer access, include real operational panels.

Examples:

```text
Application Health
Database Health
Storage Health
Processing Jobs
Recent Errors
Security Events
Migration State
Maintenance State
Deployment State
```

Only display data actually obtained from the underlying systems.

---

# 168. TESTING REQUIREMENTS

Implement meaningful tests.

Do not create tests merely to increase file count.

Test at least:

### Authentication

* Valid login
* Invalid login
* Locked account
* Password change
* Logout
* Session revocation

### Authorization

* Staff own resource
* Staff unauthorized resource
* Staff authorized resource
* Staff modify permission
* HOD same department
* HOD other department denied
* Admin global

### Resources

* Upload
* Validation
* Storage
* Versioning
* Archive
* Restore

### Search

* Keyword search
* Semantic search
* Access-filtered search
* HOD search
* Admin search

### Recommendations

* Score generation
* Matching
* Explanation
* Restricted-resource filtering

### Teaching Kit

* Topic extraction
* Coverage calculation
* Selection
* Redundancy handling
* Missing topics

### Duplicate Detection

* Similar resource
* Non-similar resource
* Configurable threshold

### Conversation

* Authorized context
* Restricted context
* No-source response
* Resource citation
* Provider failure

---

# 169. CRITICAL AUTHORIZATION TESTS

This test suite is mandatory.

## Test A

Staff A owns Resource A.

Staff B has no access.

Staff B requests Resource A directly by ID.

Expected:

```text
403 or equivalent authorization denial
```

## Test B

Staff B tries to modify Resource A without Modify permission.

Expected:

```text
Denied
```

## Test C

Staff B has USE permission.

Staff B attempts version creation.

Expected:

```text
Denied
```

## Test D

Staff B has MODIFY permission.

Expected:

```text
New version created
Original unchanged
```

## Test E

HOD A attempts to access Staff B resource in HOD B department.

Expected:

```text
Denied
```

## Test F

HOD A accesses Staff A resource.

Expected:

```text
Allowed
```

## Test G

Admin accesses all.

Expected:

```text
Allowed
```

---

# 170. SECURITY TESTING

Test:

* Unauthenticated requests
* Expired JWT
* Invalid JWT
* Tampered JWT
* Role escalation
* Department escalation
* Resource ID enumeration
* Unauthorized version access
* Unauthorized download
* Unauthorized search
* Unauthorized conversation context
* Path traversal
* Malformed upload
* Oversized file
* Invalid MIME
* SQL injection payloads
* Mass assignment attempts
* Rate limits
* Session revocation
* Maintenance enforcement

---

# 171. DATABASE TESTING

Verify:

* Foreign keys
* Unique constraints
* RLS
* Permission relationships
* Version immutability
* Audit creation
* Transaction integrity
* Cascades
* Indexes
* pgvector availability

Do not ship migrations that have not been tested.

---

# 172. PRODUCTION VERIFICATION STATES

Keep these states separate:

```text
IMPLEMENTED
TESTED
VERIFIED
DEPLOYED
PRODUCTION VERIFIED
```

Do not say:

```text
Production ready
```

just because code exists.

The supplied production engineering rules explicitly require these states to remain distinct. 

---

# 173. BUILD VALIDATION

Before declaring completion:

* Frontend type check
* Frontend lint
* Frontend build
* Backend import validation
* Backend tests
* API tests
* Database migration validation
* RLS validation
* End-to-end flow
* Production environment configuration validation

Use the actual package manager and scripts discovered from the repository.

Do not invent command names.

---

# 174. END-TO-END VERIFICATION

Run:

```text
Start backend
Start frontend
Connect to Supabase
Login
Verify role
Upload resource
Validate storage
Process resource
Extract text
Generate metadata
Generate embedding
Store vector
Search resource
Create Teaching Intent
Generate recommendations
Build Teaching Kit
Calculate coverage
Detect missing topics
Upload similar resource
Run duplicate detection
Create rating
Create comment
Create access request
Approve access
Use authorized resource
Create modified version
Verify original unchanged
Login as HOD
Verify department access
Login as Admin
Verify global access
Verify audit records
```

Do not say "it should work."

Verify it.

---

# 175. LOCAL DEVELOPMENT

Primary local architecture should remain simple:

```text
Frontend
FastAPI
PostgreSQL/pgvector or Supabase development project
Optional LLM provider
```

Do not require Docker.

Do not require Kubernetes.

Do not require Kafka.

Do not require a separate production vector database.

---

# 176. DEVELOPMENT DATABASE

Prefer the same PostgreSQL + pgvector architecture for local development where practical.

Avoid building one database model locally and another in production.

Use migrations for both.

---

# 177. DEPLOYMENT

## Frontend

Deploy to:

**Render**

## FastAPI Backend

Deploy to:

**Render**

## Database

Deploy to:

**Supabase PostgreSQL**

## Vector Search

Use:

**Supabase PostgreSQL + pgvector**

## Storage

Use:

**Supabase Storage**

## Authentication

Use:

**Supabase Auth**

---

# 178. FINAL DEPLOYMENT ARCHITECTURE

```text
Browser
    |
Render
Next.js
    |
Render
FastAPI
    |
Supabase
    |
    + PostgreSQL
    + pgvector
    + Auth
    + Storage
```

Keep the architecture simple.

Do not add another backend service unless an actual requirement exists.

---

# 179. ENVIRONMENT SEPARATION

Maintain:

```text
Development
Testing
Production
```

Do not reuse production credentials in development.

Do not reuse development credentials in production.

Do not connect preview environments to production databases unless deliberately configured and secured.

---

# 180. PRODUCTION CORS

Only allow the deployed Connect Plus frontend domain and explicitly approved origins.

Do not leave wildcard origins enabled.

---

# 181. PRODUCTION DEBUGGING

Production:

```text
debug = false
```

Never expose:

* Stack traces
* SQL
* Secret values
* Internal paths
* Runtime internals

Admin diagnostics may contain technical information but must remain behind authorization.

---

# 182. ADMIN SECURITY

Admin is the most privileged application role.

Protect Admin with:

* Strong authentication
* Strong session security
* Server-side authorization
* Audit logging
* Rate limiting
* Secure cookies
* Session revocation
* Sensitive action confirmation

Do not rely on frontend protection.

---

# 183. HOD SECURITY

HOD is department privileged.

Every HOD request must validate:

```text
Authenticated
Role = HOD
Department = resource.department
```

Do not trust department values submitted from the browser.

---

# 184. STAFF SECURITY

Staff is resource-scoped.

Every resource request must validate:

```text
Authenticated
Role = STAFF
Own resource OR approved permission
```

HOD and Admin authority should be evaluated separately.

---

# 185. RESOURCE ACCESS AUDIT

Record:

* Who requested access
* Who granted access
* Permission granted
* Time granted
* Time revoked
* Resource version
* Usage event

This provides accountability.

---

# 186. PROFESSIONAL AUDIT MODEL

Do not expose audit information casually.

Staff should see only their own relevant history.

HOD should see department-relevant administrative actions.

Admin can inspect complete audit information according to policy.

---

# 187. DATABASE MIGRATIONS

Every schema change requires a migration.

No manual undocumented production changes.

Migration process:

```text
Create migration
Validate
Apply to development
Run tests
Apply to test environment
Verify
Apply to production
Verify
```

Do not claim migration success if it was not executed.

---

# 188. README

Create a professional README for Connect Plus containing:

```text
Project overview
Product scope
Roles
Resource permission model
Architecture
Technology stack
Frontend setup
Backend setup
Supabase setup
Environment variables
Database migration
Storage setup
Authentication
AI/ML provider configuration
Embedding configuration
Local development
Testing
Deployment
Render deployment
Supabase deployment
Production verification
Demo workflow
Troubleshooting
```

Do not put actual passwords in README.

---

# 189. DOCUMENTATION RULE

Documentation must describe actual implementation.

Do not document:

```text
Planned feature
```

as:

```text
Implemented feature
```

Do not document fake deployment state.

Do not document unsupported integrations.

The Antigravity rules explicitly require documentation to stay synchronized with actual project state. 

---

# 190. NO FABRICATION RULE

Never fabricate:

* API
* endpoint
* database table
* database field
* dependency
* library
* configuration variable
* infrastructure
* deployment status
* health metric
* user
* resource
* rating
* audit log
* security result
* test result
* provider integration
* credential
* success state

If the information is unknown:

1. Inspect the repository.
2. Inspect configuration.
3. Inspect attached documentation.
4. Verify the actual environment.
5. If still unknown, keep it unknown.
6. Do not invent it.

This is a mandatory Antigravity operating principle. 

---

# 191. NO DUMMY CONTENT

Do not create:

* Placeholder users
* Fake faculty
* Fake Admin
* Fake metrics
* Fake comments
* Fake ratings
* Fake audit logs
* Fake logs
* Fake deployment records
* Fake system health
* Fake recommendation results
* Fake API responses
* Empty components
* Empty modules
* Unused configuration

The supplied production rules explicitly prohibit dummy and fabricated production content. 

---

# 192. NO DEAD UI

Every visible button must work.

Every visible navigation item must work.

Every visible card action must work.

Every form must have backend behavior.

Every permission action must affect the real database.

Every status must come from a real source.

Do not create decorative controls.

---

# 193. NO MOCK BACKEND

Do not implement:

```text
setTimeout(() => "success")
```

to simulate processing.

Do not implement:

```text
fake recommendations
```

Do not implement:

```text
hardcoded search responses
```

Do not implement:

```text
static dashboard numbers
```

Do not implement:

```text
fake health status
```

---

# 194. NO HARDCODED RECOMMENDATION

Recommendation results must come from:

```text
Database
Embeddings
Search
Curriculum
Permissions
Ranking
Actual quality signals
```

Do not return hardcoded demo results.

---

# 195. NO HARDCODED SEARCH

The search page must query the actual database/vector index.

Do not create search responses specifically for the demo sentence.

---

# 196. NO HARDCODED COVERAGE

Coverage must be calculated from actual topics.

---

# 197. NO HARDCODED DUPLICATE DETECTION

Similarity must come from actual vectors.

---

# 198. NO HARD-CODED PERMISSIONS

Do not write UI-only role checks.

Use server-side authorization services and database policies.

---

# 199. NO LEGACY ROLE LEAKAGE

Search the repository for:

```text
Student
Faculty
Super Admin
Special Admin
Co-Admin
Developer
RIT Connect
TeachMesh
```

Remove legacy role logic and product naming from the active Connect Plus implementation unless explicitly required as historical documentation.

The only active roles are:

```text
ADMIN
HOD
STAFF
```

---

# 200. NO LEGACY FEATURE LEAKAGE

Search for and remove or isolate:

```text
student dashboard
assignment system
complaint system
student moderation
calling
video
placement
events
social feed
```

Do not let old code accidentally become part of Connect Plus.

---

# 201. REPOSITORY-FIRST RULE

Before editing:

1. Inspect root.
2. Inspect frontend.
3. Inspect backend.
4. Inspect package manifests.
5. Inspect environment handling.
6. Inspect database configuration.
7. Inspect migrations.
8. Inspect authentication.
9. Inspect existing components.
10. Inspect deployment files.
11. Inspect tests.
12. Determine what is already implemented.

Do not assume the repository is empty.

The supplied Antigravity master engineering rules explicitly require repository inspection before implementation. 

---

# 202. DUPLICATE CODE PREVENTION

Before creating anything:

Search for existing:

* Component
* Route
* Endpoint
* Service
* Model
* Function
* Hook
* Utility
* Migration
* Auth logic
* Permission logic

Extend existing valid implementation when appropriate.

Do not create:

```text
resource.py
resource_new.py
resource_v2.py
resource_final.py
```

without a genuine architectural reason.

---

# 203. DEPENDENCY DISCIPLINE

Before adding a dependency:

1. Search existing dependencies.
2. Determine whether functionality already exists.
3. Verify necessity.
4. Verify compatibility.
5. Add only when justified.
6. Update the correct manifest.
7. Run validation.

Do not install large packages just for visual polish.

---

# 204. CODE QUALITY

Code must be:

* Typed where appropriate
* Readable
* Maintainable
* Modular
* Secure
* Tested
* Validated
* Free from dead code
* Free from unused imports
* Free from fake APIs
* Free from fake values
* Free from unnecessary abstractions

---

# 205. FRONTEND QUALITY GATE

Before completion:

```text
No layout shift
No broken routes
No console errors
No hydration errors
No inaccessible controls
No dead buttons
No fake loading
No fake success
No placeholder content
No unused UI
No accidental legacy names
No visible AI branding
```

---

# 206. BACKEND QUALITY GATE

Before completion:

```text
No unprotected sensitive endpoints
No mass assignment
No raw user SQL
No insecure storage access
No unrestricted CORS
No secret logging
No stack traces to users
No fake processing
No fake recommendation
No fake authorization
No missing validation
```

---

# 207. DATABASE QUALITY GATE

Before completion:

```text
Migrations work
Constraints work
RLS works
Permissions work
Indexes exist
Vector search works
Versioning works
Transactions work where required
No duplicate records from retries
No orphaned critical records
```

---

# 208. ACCESS CONTROL QUALITY GATE

Verify all three roles independently.

## Staff

```text
Own resources: full owner access
Authorized resources: according to grant
Unauthorized resources: denied
```

## HOD

```text
Own department resources: view/use
Other departments: denied
Admin operations: denied
```

## Admin

```text
Global resource access
Global management
Developer/control access
```

---

# 209. CONVERSATION QUALITY GATE

Verify:

```text
Conversation respects permissions
Conversation never reveals inaccessible resources
Conversation uses actual indexed context
Conversation does not fabricate citations
Conversation responds safely when context is missing
Conversation handles provider failure
Conversation does not expose system secrets
Conversation has persistent history
```

---

# 210. PRODUCTION FAILURE HANDLING

Every external or internal operation must define:

```text
Success
Failure
Retry
Timeout
Authorization failure
Unavailable state
```

Do not let exceptions disappear silently.

---

# 211. PROCESSING RETRY

Failed processing should be retryable where safe.

Use:

```text
attempt_count
last_error
retry_state
```

Do not retry indefinitely.

Do not duplicate embeddings or versions when retrying.

---

# 212. IDEMPOTENCY

Operations that can be retried must be safe.

Examples:

* Resource upload
* Resource processing
* Version creation
* Permission creation
* Teaching Kit creation
* Conversation requests where provider retry could duplicate billing or state

Use request IDs or operation IDs where necessary.

---

# 213. ADMIN MAINTENANCE WORKFLOW

Before maintenance:

```text
Check application
Check database
Check storage
Check processing
Check current deployment
```

Then:

```text
Enable maintenance
Perform actual operation
Run validation
Disable maintenance
Verify core user flow
```

Do not restore normal access before relevant verification succeeds.

---

# 214. FUTURE-READY WITHOUT OVER-ENGINEERING

Structure the application so future features can be added without rewriting the core domain.

Possible future:

* Multilingual search
* Learning outcome mapping
* Advanced recommendation models
* Institutional federation
* S3/MinIO storage
* LMS integrations
* Moodle
* Google Drive
* Microsoft 365
* Knowledge graph

Do not implement them now.

---

# 215. DEPLOYMENT SCALABILITY

Initial architecture should be stateless where practical.

Do not store essential state only in process memory.

Use:

* Supabase for persistent state
* Database-backed jobs
* Secure session mechanism
* Externalized storage

The broader infrastructure planning emphasizes connection pooling, horizontal scaling and avoiding instance-specific state when moving to multi-instance deployments. 

---

# 216. FUTURE SCALE RULE

Do not add load balancers, read replicas, CDN or multiple application instances just to make the code look enterprise-grade.

Implement the architecture so these can be introduced later.

Use actual load testing before scaling infrastructure.

---

# 217. OBSERVABILITY

At minimum track actual:

```text
Application errors
API errors
Processing failures
Database errors
Storage failures
Authentication failures
Access denials
Search failures
Conversation provider failures
Security events
```

Do not fabricate metrics.

---

# 218. SECURITY RESPONSE

If a serious security issue is discovered:

1. Identify the affected operation.
2. Restrict exposure.
3. Fix root cause.
4. Add regression test.
5. Re-test.
6. Re-verify affected authorization.
7. Document the result.

Do not hide security failures.

---

# 219. FINAL IMPLEMENTATION ORDER

Use this implementation sequence.

## Phase 1

Repository inspection.

## Phase 2

Application foundation.

## Phase 3

Supabase project and database.

## Phase 4

Authentication.

## Phase 5

Role-based routing.

## Phase 6

Professional profiles.

## Phase 7

Department and curriculum structure.

## Phase 8

Resource upload and private storage.

## Phase 9

Resource processing.

## Phase 10

Embeddings and pgvector.

## Phase 11

Permission system.

## Phase 12

Semantic search.

## Phase 13

Teaching Intent.

## Phase 14

Recommendation engine.

## Phase 15

Teaching Kit.

## Phase 16

Coverage.

## Phase 17

Duplicate detection.

## Phase 18

Ratings/comments.

## Phase 19

Conversation.

## Phase 20

HOD dashboard.

## Phase 21

Admin control plane.

## Phase 22

Audit/security.

## Phase 23

Production hardening.

## Phase 24

Testing.

## Phase 25

Render deployment.

## Phase 26

Supabase production verification.

## Phase 27

Full end-to-end verification.

## Phase 28

UI polish.

---

# 220. ANTIGRAVITY EXECUTION PROTOCOL

For every phase:

### Step 1

Inspect current implementation.

### Step 2

Identify affected files.

### Step 3

Identify existing implementation that can be reused.

### Step 4

Create the minimum correct change.

### Step 5

Implement.

### Step 6

Validate.

### Step 7

Test.

### Step 8

Review authorization/security impact.

### Step 9

Review UI states.

### Step 10

Review production failure handling.

### Step 11

Run the relevant build/test checks.

### Step 12

Report the actual result.

Do not skip directly from a user request to large-scale code generation.

This follows the supplied Antigravity engineering rules for repository-first development, requirement analysis, impact analysis, implementation and validation. 

---

# 221. ANTIGRAVITY RESPONSE FORMAT

After each implementation phase, report only:

```text
Phase:
Implemented:
Modified:
Created:
Tests:
Verification:
Known blockers:
Next phase:
```

Do not write long generic explanations.

Do not claim success unless verified.

---

# 222. BLOCKER POLICY

If an implementation depends on a missing secret, provider, external service or infrastructure capability:

Do not fabricate it.

Do not create a fake implementation.

State the exact missing dependency.

If a safe local fallback exists, implement the fallback.

If no safe fallback exists, keep that feature explicitly unavailable until the real dependency is configured.

---

# 223. FINAL ACCEPTANCE CRITERIA

Connect Plus is not complete until all applicable requirements below are verified.

## Identity

* [ ] Product name is Connect Plus
* [ ] Legacy product names removed
* [ ] Problem statement number/title not shown
* [ ] No personal brand names in UI

## Roles

* [ ] Admin works
* [ ] HOD works
* [ ] Staff works
* [ ] No Student login
* [ ] No unused role system

## Authentication

* [ ] Login works
* [ ] Role routing works
* [ ] JWT validation works
* [ ] Session handling works
* [ ] Password change works
* [ ] Rate limiting exists
* [ ] Lockout exists
* [ ] Credentials are not hardcoded

## Profiles

* [ ] Professional profiles work
* [ ] Job profile works
* [ ] Department works
* [ ] Designation works
* [ ] Course assignments work
* [ ] Profile photo works
* [ ] Professional links work where enabled

## Resources

* [ ] Upload works
* [ ] Validation works
* [ ] Storage works
* [ ] Processing works
* [ ] Metadata works
* [ ] Topics work
* [ ] Tags work
* [ ] Course mapping works
* [ ] Versioning works
* [ ] Original version remains immutable

## Permissions

* [ ] Staff unauthorized access denied
* [ ] Staff access request works
* [ ] Owner approval works
* [ ] Modify permission works
* [ ] Modified version does not overwrite original
* [ ] HOD department access works
* [ ] HOD cross-department access denied
* [ ] Admin global access works

## Search

* [ ] Keyword search works
* [ ] Semantic search works
* [ ] Permission filtering works
* [ ] Department filtering works
* [ ] Course filtering works
* [ ] Topic filtering works

## Recommendation

* [ ] Recommendation is dynamic
* [ ] Ranking uses real signals
* [ ] Reasons are real
* [ ] Restricted resources are excluded

## Teaching Intent

* [ ] Natural language input works
* [ ] Course detected
* [ ] Unit detected
* [ ] Topics detected
* [ ] Duration detected
* [ ] User can review intent

## Teaching Kit

* [ ] Kit creation works
* [ ] Resource combination works
* [ ] Coverage calculation works
* [ ] Missing topics work
* [ ] Redundancy is reduced
* [ ] Kit state persists

## Similarity

* [ ] Duplicate detection works
* [ ] Similarity threshold configurable
* [ ] User can continue upload
* [ ] Existing resource can be reused

## Feedback

* [ ] Ratings work
* [ ] Comments work
* [ ] One rating per user/resource
* [ ] Ratings feed recommendation quality

## Conversation

* [ ] Conversation works
* [ ] Resource-aware retrieval works
* [ ] Role-aware access works
* [ ] No inaccessible context leaks
* [ ] Actual citations work
* [ ] Provider failure is handled
* [ ] No fake responses

## Admin

* [ ] User management
* [ ] Department management
* [ ] Resource management
* [ ] Permission management
* [ ] Processing management
* [ ] Audit
* [ ] Health
* [ ] Maintenance
* [ ] Developer controls
* [ ] Actual operational data only

## HOD

* [ ] Department dashboard
* [ ] Department resources
* [ ] Staff visibility
* [ ] Department analytics
* [ ] Department resource access
* [ ] Access oversight

## Security

* [ ] RLS
* [ ] Server-side authorization
* [ ] Secure storage
* [ ] Input validation
* [ ] Rate limiting
* [ ] CORS
* [ ] Security headers
* [ ] Secret isolation
* [ ] Safe errors
* [ ] Audit logging
* [ ] File validation
* [ ] Malware scanning capability configured before production release

## Deployment

* [ ] Next.js deployed on Render
* [ ] FastAPI deployed on Render
* [ ] Supabase PostgreSQL configured
* [ ] pgvector configured
* [ ] Supabase Auth configured
* [ ] Supabase Storage configured
* [ ] Production environment variables configured
* [ ] Production frontend verified
* [ ] Production backend verified
* [ ] Database verified
* [ ] Storage verified
* [ ] End-to-end workflow verified

---

# 224. FINAL PRODUCTION PRINCIPLE

Build Connect Plus as a real institutional product.

The final application must communicate:

```text
Professional
Academic
Reliable
Secure
Human-designed
Resource-focused
Permission-aware
Department-aware
Production-oriented
```

The application must **not** communicate:

```text
Generic AI startup
Chatbot template
Cyberpunk AI dashboard
Student LMS
Social network
Fake enterprise platform
Static mockup
```

Use technology internally where it genuinely improves resource discovery, processing, search and conversation.

Do not turn the technology into the product identity.

The product identity is:

# Connect Plus

## Academic resource sharing, discovery, reuse and teaching intelligence.

---

# 225. MASTER ANTIGRAVITY COMMAND

**Now inspect the actual workspace and implement Connect Plus according to this contract.**

Do not assume an empty repository.

Do not overwrite valid existing implementation.

Do not create duplicate modules.

Do not create dummy content.

Do not create fake APIs.

Do not create fake data.

Do not create fake metrics.

Do not hardcode credentials.

Do not create Student functionality.

Do not create legacy RIT Connect or TeachMesh branding.

Do not show AI terminology in the product UI.

Do not build a generic chatbot.

Build the constrained resource-aware Conversation capability specified above.

Enforce all resource permissions on the backend.

Enforce Staff ownership and authorization.

Enforce HOD department scope.

Give Admin full system and developer access.

Preserve original resources through immutable versioning.

Use Supabase PostgreSQL and pgvector as the production data layer.

Use Supabase Storage for protected files.

Use Supabase Auth for authentication.

Use FastAPI for the backend.

Use Next.js, TypeScript and Tailwind CSS for the frontend.

Deploy the frontend and FastAPI backend through Render.

Do not invent provider credentials or infrastructure.

Use migrations.

Use tests.

Use real error handling.

Use real loading states.

Use real processing states.

Use real search.

Use real embeddings.

Use real recommendations.

Use real Teaching Kit generation.

Use real coverage calculations.

Use real duplicate detection.

Use real access control.

Use real audit records.

Use real production verification.

If something is not actually implemented, do not claim it is implemented.

If something fails, diagnose it, fix it, and re-run the appropriate validation.

Do not stop at UI.

Do not stop at architecture.

Do not stop at database.

Do not stop at backend.

Do not stop at frontend.

Connect every layer.

Test the complete user journey.

Test Staff permissions.

Test HOD permissions.

Test Admin permissions.

Test original-resource immutability.

Test semantic search.

Test conversation access isolation.

Test production deployment.

Finish with the actual working Connect Plus system.