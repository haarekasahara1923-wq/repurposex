# 🔌 API Architecture & Documentation

## Architecture Overview

### API Design Principles
1. **RESTful Design:** Resource-based URLs, HTTP methods
2. **Versioning:** `/api/v1/` prefix for future compatibility
3. **Authentication:** JWT-based with refresh tokens
4. **Rate Limiting:** Tier-based limits (more for higher plans)
5. **Pagination:** Cursor-based for large datasets
6. **Caching:** Redis caching for frequently accessed data
7. **WebSockets:** Real-time updates for job progress
8. **Idempotency:** Idempotency keys for critical operations

### Base URL Structure
```
Production: https://api.repurposex.com/v1
Development: https://dev-api.repurposex.com/v1
```

---

## Authentication & Authorization

### Authentication Flow

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
```

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "country_code": "IN",
  "referral_code": "FRIEND123" // optional
}

Response 201:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2026-02-10T00:00:00Z"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response 200:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

### Authorization Headers
```http
Authorization: Bearer <access_token>
```

---

## User Management

```
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/subscription
GET    /api/v1/users/me/usage
PUT    /api/v1/users/me/password
PUT    /api/v1/users/me/avatar
```

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "country_code": "IN",
    "email_verified": true,
    "subscription": {
      "plan": "Pro",
      "status": "active",
      "current_period_end": "2026-03-10T00:00:00Z"
    },
    "usage": {
      "uploads_used": 15,
      "uploads_limit": 50,
      "credits_used": 850,
      "credits_limit": 2000
    }
  }
}
```

#### Update Profile
```http
PUT /api/v1/users/me
Content-Type: application/json
Authorization: Bearer <token>

{
  "full_name": "John Smith",
  "timezone": "America/New_York",
  "language": "en"
}

Response 200:
{
  "success": true,
  "data": { /* updated user object */ }
}
```

---

## Organization & Team Management

```
POST   /api/v1/organizations
GET    /api/v1/organizations
GET    /api/v1/organizations/:id
PUT    /api/v1/organizations/:id
DELETE /api/v1/organizations/:id

POST   /api/v1/organizations/:id/members
GET    /api/v1/organizations/:id/members
PUT    /api/v1/organizations/:id/members/:userId
DELETE /api/v1/organizations/:id/members/:userId

POST   /api/v1/organizations/:id/clients
GET    /api/v1/organizations/:id/clients
GET    /api/v1/organizations/:id/clients/:clientId
PUT    /api/v1/organizations/:id/clients/:clientId
DELETE /api/v1/organizations/:id/clients/:clientId
```

#### Create Organization
```http
POST /api/v1/organizations
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My Marketing Agency",
  "slug": "my-agency",
  "industry": "marketing",
  "company_size": "11-50"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "My Marketing Agency",
    "slug": "my-agency",
    "owner_id": "user-uuid",
    "created_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Invite Team Member
```http
POST /api/v1/organizations/:id/members
Content-Type: application/json

{
  "email": "team@example.com",
  "role": "manager", // owner, admin, manager, creator, client
  "permissions": {
    "can_create_content": true,
    "can_approve_content": true,
    "can_publish": false
  }
}

Response 201:
{
  "success": true,
  "data": {
    "invitation_id": "uuid",
    "email": "team@example.com",
    "status": "pending",
    "invite_url": "https://app.repurposex.com/invite/abc123"
  }
}
```

---

## Brand Profiles & Voice

```
POST   /api/v1/brand-profiles
GET    /api/v1/brand-profiles
GET    /api/v1/brand-profiles/:id
PUT    /api/v1/brand-profiles/:id
DELETE /api/v1/brand-profiles/:id

POST   /api/v1/brand-profiles/:id/voice-analysis
GET    /api/v1/brand-profiles/:id/voice-samples
POST   /api/v1/brand-profiles/:id/audience
```

#### Create Brand Profile
```http
POST /api/v1/brand-profiles
Content-Type: application/json

{
  "name": "Tech Startup Brand",
  "description": "B2B SaaS company targeting developers",
  "industry": "technology",
  "target_audience": "Developers, technical founders, CTOs",
  "content_goals": ["brand_awareness", "lead_generation", "thought_leadership"],
  "preferred_platforms": ["linkedin", "twitter", "youtube"],
  "tone_preset": "professional"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "brand-uuid",
    "name": "Tech Startup Brand",
    "tone_preset": "professional",
    "voice_analyzed": false,
    "created_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Analyze Brand Voice
```http
POST /api/v1/brand-profiles/:id/voice-analysis
Content-Type: application/json

{
  "sample_content_urls": [
    "https://blog.company.com/article1",
    "https://linkedin.com/posts/something"
  ],
  "sample_texts": [
    "This is how we write...",
    "Another example of our writing..."
  ]
}

Response 202:
{
  "success": true,
  "data": {
    "analysis_job_id": "job-uuid",
    "status": "processing",
    "estimated_completion": "2026-02-10T00:05:00Z"
  }
}
```

---

## Content Assets

```
POST   /api/v1/content/upload
POST   /api/v1/content/import-url
GET    /api/v1/content
GET    /api/v1/content/:id
PUT    /api/v1/content/:id
DELETE /api/v1/content/:id

GET    /api/v1/content/:id/analysis
POST   /api/v1/content/:id/analyze
GET    /api/v1/content/:id/strategy
```

#### Upload Content
```http
POST /api/v1/content/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
  file: [binary file]
  title: "My Podcast Episode 1"
  description: "Episode about AI in marketing"
  brand_profile_id: "brand-uuid"
  tags: ["ai", "marketing", "podcast"]

Response 201:
{
  "success": true,
  "data": {
    "id": "content-uuid",
    "title": "My Podcast Episode 1",
    "content_type": "audio",
    "file_url": "https://cdn.../file.mp3",
    "duration": 3600,
    "upload_status": "processing",
    "created_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Import from URL
```http
POST /api/v1/content/import-url
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=abc123",
  "title": "My YouTube Video",
  "brand_profile_id": "brand-uuid"
}

Response 202:
{
  "success": true,
  "data": {
    "import_job_id": "job-uuid",
    "status": "importing",
    "estimated_completion": "2026-02-10T00:10:00Z"
  }
}
```

#### Get Content Analysis
```http
GET /api/v1/content/:id/analysis

Response 200:
{
  "success": true,
  "data": {
    "content_id": "uuid",
    "transcript": "Full transcript...",
    "topics": ["AI", "Marketing", "Content Strategy"],
    "keywords": ["artificial intelligence", "content marketing"],
    "sentiment_score": 85,
    "virality_score": 78,
    "repurposing_value": 92,
    "hook_moments": [
      {
        "timestamp": 120,
        "text": "Here's the surprising truth...",
        "score": 95
      }
    ],
    "platform_scores": {
      "youtube": 95,
      "linkedin": 88,
      "instagram": 72
    }
  }
}
```

#### Get Repurposing Strategy
```http
GET /api/v1/content/:id/strategy

Response 200:
{
  "success": true,
  "data": {
    "content_id": "uuid",
    "recommended_formats": [
      {
        "format": "short_video",
        "priority": "high",
        "platforms": ["instagram", "tiktok", "youtube_shorts"],
        "estimated_pieces": 8,
        "reasoning": "High hook moment density, visual content"
      },
      {
        "format": "linkedin_post",
        "priority": "high",
        "platforms": ["linkedin"],
        "estimated_pieces": 5,
        "reasoning": "Professional insights, B2B relevant"
      }
    ],
    "calendar_suggestions": {
      "week1": [/* content schedule */],
      "week2": [/* content schedule */]
    },
    "estimated_output_count": 25,
    "estimated_reach": 50000
  }
}
```

---

## AI Repurposing

```
POST   /api/v1/repurpose
GET    /api/v1/repurpose/jobs
GET    /api/v1/repurpose/jobs/:id
DELETE /api/v1/repurpose/jobs/:id

GET    /api/v1/generated-content
GET    /api/v1/generated-content/:id
PUT    /api/v1/generated-content/:id
DELETE /api/v1/generated-content/:id
POST   /api/v1/generated-content/:id/regenerate
```

#### Create Repurposing Job
```http
POST /api/v1/repurpose
Content-Type: application/json

{
  "content_asset_id": "content-uuid",
  "job_type": "video_to_shorts",
  "output_format": "short_video",
  "target_platforms": ["instagram", "tiktok"],
  "config": {
    "aspect_ratio": "9:16",
    "duration": 60,
    "caption_style": "mrbeast",
    "auto_detect_moments": true,
    "moment_count": 5,
    "include_captions": true,
    "brand_template_id": "template-uuid"
  }
}

Response 202:
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "status": "queued",
    "position_in_queue": 3,
    "estimated_completion": "2026-02-10T00:15:00Z",
    "credits_cost": 50
  }
}
```

#### Get Job Status
```http
GET /api/v1/repurpose/jobs/:id

Response 200:
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "status": "processing", // queued, processing, completed, failed
    "progress": 65, // 0-100
    "current_step": "Generating captions",
    "started_at": "2026-02-10T00:05:00Z",
    "estimated_completion": "2026-02-10T00:15:00Z",
    "generated_content_ids": ["gen-uuid-1", "gen-uuid-2"] // if completed
  }
}
```

#### List Generated Content
```http
GET /api/v1/generated-content?page=1&limit=20&platform=instagram&status=ready

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "gen-uuid",
        "title": "5 AI Marketing Tips",
        "content_type": "short_video",
        "target_platform": "instagram",
        "file_url": "https://cdn.../video.mp4",
        "thumbnail_url": "https://cdn.../thumb.jpg",
        "caption": "Transform your marketing with AI...",
        "hashtags": ["#AIMarketing", "#ContentStrategy"],
        "duration": 58,
        "quality_score": 92,
        "virality_prediction": 85,
        "is_published": false,
        "created_at": "2026-02-10T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "has_next": true
    }
  }
}
```

---

## Templates

```
GET    /api/v1/templates
GET    /api/v1/templates/:id
POST   /api/v1/templates (Agency plan+)
PUT    /api/v1/templates/:id
DELETE /api/v1/templates/:id
```

#### Get Templates
```http
GET /api/v1/templates?type=caption_style&is_public=true

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "template-uuid",
      "name": "MrBeast Style Captions",
      "description": "Word-by-word animated captions",
      "template_type": "caption_style",
      "is_public": true,
      "is_premium": false,
      "preview_url": "https://cdn.../preview.mp4",
      "config": {
        "animation": "pop",
        "font_family": "Montserrat",
        "font_weight": "bold",
        "color": "#FFFF00",
        "stroke_color": "#000000"
      },
      "usage_count": 15847,
      "rating": 4.8
    }
  ]
}
```

---

## Approval Workflows

```
POST   /api/v1/workflows
GET    /api/v1/workflows
GET    /api/v1/workflows/:id
PUT    /api/v1/workflows/:id
DELETE /api/v1/workflows/:id

POST   /api/v1/approvals
GET    /api/v1/approvals
GET    /api/v1/approvals/:id
POST   /api/v1/approvals/:id/approve
POST   /api/v1/approvals/:id/reject
POST   /api/v1/approvals/:id/request-revision
```

#### Create Approval Workflow
```http
POST /api/v1/workflows
Content-Type: application/json

{
  "name": "Standard Client Approval",
  "organization_id": "org-uuid",
  "client_account_id": "client-uuid",
  "stages": [
    {
      "order": 1,
      "name": "Internal Review",
      "approvers": ["user-uuid-1", "user-uuid-2"]
    },
    {
      "order": 2,
      "name": "Client Review",
      "approvers": ["client-user-uuid"]
    }
  ],
  "auto_publish": true
}

Response 201:
{
  "success": true,
  "data": {
    "id": "workflow-uuid",
    "name": "Standard Client Approval",
    "stages": [/* stages */],
    "created_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Submit for Approval
```http
POST /api/v1/approvals
Content-Type: application/json

{
  "generated_content_id": "gen-uuid",
  "workflow_id": "workflow-uuid",
  "message": "Please review this Instagram Reel"
}

Response 201:
{
  "success": true,
  "data": {
    "approval_request_id": "approval-uuid",
    "current_stage": 1,
    "status": "pending",
    "created_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Approve Content
```http
POST /api/v1/approvals/:id/approve
Content-Type: application/json

{
  "feedback": "Looks great! Approved."
}

Response 200:
{
  "success": true,
  "data": {
    "approval_request_id": "approval-uuid",
    "status": "approved",
    "next_stage": 2, // or null if final stage
    "approved_at": "2026-02-10T00:00:00Z"
  }
}
```

---

## Scheduling & Publishing

```
POST   /api/v1/schedule
GET    /api/v1/schedule
GET    /api/v1/schedule/:id
PUT    /api/v1/schedule/:id
DELETE /api/v1/schedule/:id

POST   /api/v1/platforms/connect
GET    /api/v1/platforms/connections
DELETE /api/v1/platforms/connections/:id

POST   /api/v1/publish (immediate publish)
```

#### Connect Platform
```http
POST /api/v1/platforms/connect
Content-Type: application/json

{
  "platform": "instagram",
  "auth_code": "oauth_code_from_instagram"
}

Response 200:
{
  "success": true,
  "data": {
    "connection_id": "conn-uuid",
    "platform": "instagram",
    "platform_username": "@myaccount",
    "is_active": true,
    "connected_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Schedule Post
```http
POST /api/v1/schedule
Content-Type: application/json

{
  "generated_content_id": "gen-uuid",
  "platform_connection_id": "conn-uuid",
  "scheduled_for": "2026-02-11T10:00:00Z",
  "timezone": "Asia/Kolkata",
  "use_ai_optimal_time": false
}

Response 201:
{
  "success": true,
  "data": {
    "scheduled_post_id": "sched-uuid",
    "platform": "instagram",
    "scheduled_for": "2026-02-11T10:00:00Z",
    "status": "scheduled",
    "created_at": "2026-02-10T00:00:00Z"
  }
}
```

#### Get AI Optimal Times
```http
GET /api/v1/platforms/connections/:id/optimal-times

Response 200:
{
  "success": true,
  "data": {
    "platform": "instagram",
    "timezone": "Asia/Kolkata",
    "optimal_times": [
      {
        "day": "monday",
        "time": "09:00",
        "score": 95,
        "reasoning": "High engagement from your audience"
      },
      {
        "day": "wednesday",
        "time": "18:00",
        "score": 92
      }
    ]
  }
}
```

---

## Analytics

```
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/content/:id
GET    /api/v1/analytics/platform/:platform
GET    /api/v1/analytics/roi
POST   /api/v1/analytics/reports/generate
GET    /api/v1/analytics/reports/:id
```

#### Get Dashboard Analytics
```http
GET /api/v1/analytics/dashboard?period=last_30_days

Response 200:
{
  "success": true,
  "data": {
    "period": "last_30_days",
    "summary": {
      "total_content_created": 145,
      "total_content_published": 98,
      "total_views": 125000,
      "total_engagement": 8500,
      "engagement_rate": 6.8,
      "total_reach": 85000
    },
    "platform_breakdown": {
      "instagram": {
        "posts": 35,
        "views": 45000,
        "engagement": 3200,
        "engagement_rate": 7.1
      },
      "linkedin": {
        "posts": 28,
        "views": 38000,
        "engagement": 2800,
        "engagement_rate": 7.4
      }
    },
    "trending_content": [
      {
        "id": "gen-uuid",
        "title": "AI Marketing Tips",
        "views": 12000,
        "engagement": 950,
        "platform": "instagram"
      }
    ],
    "growth": {
      "content_created": "+25%",
      "total_views": "+45%",
      "engagement_rate": "+12%"
    }
  }
}
```

#### Get ROI Analysis
```http
GET /api/v1/analytics/roi?content_asset_id=content-uuid

Response 200:
{
  "success": true,
  "data": {
    "content_asset_id": "content-uuid",
    "original_title": "My Podcast Episode",
    "input_cost": {
      "time_hours": 5,
      "dollar_value": 500
    },
    "output_value": {
      "repurposed_pieces": 25,
      "total_reach": 75000,
      "total_engagement": 5200,
      "estimated_value": 3750
    },
    "roi_multiplier": 7.5,
    "cost_per_engagement": 0.096,
    "value_score": 95
  }
}
```

---

## Subscriptions & Payments

```
GET    /api/v1/plans
POST   /api/v1/subscriptions/subscribe
POST   /api/v1/subscriptions/cancel
POST   /api/v1/subscriptions/upgrade
POST   /api/v1/subscriptions/downgrade

GET    /api/v1/payments/history
GET    /api/v1/invoices
GET    /api/v1/invoices/:id

POST   /api/v1/payments/razorpay/create-order (India)
POST   /api/v1/payments/razorpay/verify
POST   /api/v1/payments/stripe/create-checkout (International)
POST   /api/v1/payments/stripe/webhook
```

#### Get Plans
```http
GET /api/v1/plans?currency=INR

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "plan-uuid",
      "name": "Creator",
      "slug": "creator",
      "description": "Perfect for individual creators",
      "price_inr": 999,
      "price_usd": 29,
      "billing_period": "monthly",
      "features": {
        "uploads": 10,
        "platforms": 5,
        "credits": 500,
        "team_members": 1,
        "white_label": false
      },
      "limits": {
        "max_uploads_per_month": 10,
        "max_ai_credits": 500
      }
    }
  ]
}
```

#### Subscribe to Plan (Razorpay - India)
```http
POST /api/v1/payments/razorpay/create-order
Content-Type: application/json

{
  "plan_id": "plan-uuid",
  "billing_period": "monthly"
}

Response 200:
{
  "success": true,
  "data": {
    "order_id": "order_xxx",
    "amount": 99900, // in paise
    "currency": "INR",
    "razorpay_key": "rzp_live_xxx"
  }
}

// After Razorpay payment success, verify:
POST /api/v1/payments/razorpay/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}

Response 200:
{
  "success": true,
  "data": {
    "subscription_id": "sub-uuid",
    "status": "active",
    "current_period_start": "2026-02-10T00:00:00Z",
    "current_period_end": "2026-03-10T00:00:00Z"
  }
}
```

---

## WebSocket Events (Real-time Updates)

### Connection
```javascript
const socket = io('wss://api.repurposex.com', {
  auth: {
    token: 'Bearer <access_token>'
  }
});
```

### Events

#### Job Progress Updates
```javascript
socket.on('job:progress', (data) => {
  // {
  //   job_id: "job-uuid",
  //   status: "processing",
  //   progress: 75,
  //   current_step: "Generating captions",
  //   estimated_completion: "2026-02-10T00:15:00Z"
  // }
});

socket.on('job:completed', (data) => {
  // {
  //   job_id: "job-uuid",
  //   status: "completed",
  //   generated_content_ids: ["gen-uuid-1", "gen-uuid-2"]
  // }
});

socket.on('job:failed', (data) => {
  // {
  //   job_id: "job-uuid",
  //   status: "failed",
  //   error: "Error message"
  // }
});
```

#### Approval Notifications
```javascript
socket.on('approval:requested', (data) => {
  // {
  //   approval_id: "approval-uuid",
  //   content_id: "gen-uuid",
  //   requested_by: "User Name"
  // }
});
```

#### Publishing Updates
```javascript
socket.on('publish:success', (data) => {
  // {
  //   scheduled_post_id: "sched-uuid",
  //   platform: "instagram",
  //   platform_post_url: "https://instagram.com/p/abc123"
  // }
});
```

---

## Rate Limiting

### Limits by Plan

| Plan | Requests/minute | Requests/hour |
|------|----------------|---------------|
| Free/Trial | 30 | 500 |
| Creator | 60 | 1,000 |
| Pro | 120 | 2,500 |
| Agency | 300 | 10,000 |
| Enterprise | Custom | Custom |

### Rate Limit Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1709280000
```

### Rate Limit Response
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 seconds.",
    "retry_after": 30
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional context
    },
    "trace_id": "trace-uuid" // For debugging
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `QUOTA_EXCEEDED` | 402 | Usage limit reached |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary unavailability |

---

## Pagination

### Cursor-Based Pagination
```http
GET /api/v1/content?limit=20&cursor=abc123

Response:
{
  "success": true,
  "data": {
    "items": [/* items */],
    "pagination": {
      "limit": 20,
      "next_cursor": "xyz789",
      "has_next": true
    }
  }
}
```

---

## Webhooks (Agency Plan+)

### Webhook Events
```
content.uploaded
content.analyzed
job.completed
job.failed
approval.requested
approval.approved
approval.rejected
content.published
subscription.updated
payment.succeeded
payment.failed
```

### Webhook Payload
```json
{
  "event": "job.completed",
  "timestamp": "2026-02-10T00:00:00Z",
  "data": {
    "job_id": "job-uuid",
    "user_id": "user-uuid",
    "generated_content_ids": ["gen-uuid-1", "gen-uuid-2"]
  },
  "signature": "sha256_signature"
}
```

---

## API SDK Examples

### JavaScript/TypeScript
```typescript
import RepurposeX from '@repurposex/sdk';

const client = new RepurposeX({
  apiKey: 'your_api_key'
});

// Upload content
const content = await client.content.upload({
  file: fileBlob,
  title: 'My Video',
  brandProfileId: 'brand-uuid'
});

// Create repurposing job
const job = await client.repurpose.create({
  contentAssetId: content.id,
  jobType: 'video_to_shorts',
  config: {
    aspectRatio: '9:16',
    duration: 60
  }
});

// Wait for completion
job.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

const results = await job.wait();
```

### Python
```python
from repurposex import Client

client = Client(api_key='your_api_key')

# Upload content
content = client.content.upload(
    file=open('video.mp4', 'rb'),
    title='My Video',
    brand_profile_id='brand-uuid'
)

# Create repurposing job
job = client.repurpose.create(
    content_asset_id=content.id,
    job_type='video_to_shorts',
    config={
        'aspect_ratio': '9:16',
        'duration': 60
    }
)

# Wait for completion
results = job.wait()
```

---

## Performance Benchmarks

| Endpoint | Target Response Time |
|----------|---------------------|
| Authentication | < 200ms |
| List content | < 300ms |
| Get content details | < 150ms |
| Create repurposing job | < 500ms |
| Upload file | < 2s (for 100MB) |
| Dashboard analytics | < 400ms |

---

**API Version:** v1.0.0  
**Last Updated:** 2026-02-10  
**Status:** Production-Ready
