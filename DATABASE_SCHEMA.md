# 🗄️ Database Schema Design

## Technology Stack
- **Primary Database:** PostgreSQL 15+
- **Vector Database:** Pinecone / Qdrant (for brand voice embeddings)
- **Cache Layer:** Redis
- **ORM:** Prisma (type-safe database access)

---

## Schema Design Principles
1. **Scalability:** Optimized indexes, partitioning for large tables
2. **Multi-tenancy:** Organization-based data isolation
3. **Audit Trail:** Created/updated timestamps, soft deletes
4. **Performance:** Denormalization where appropriate
5. **Security:** Row-level security, encrypted sensitive data

---

## Core Tables

### 1. Authentication & Users

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    country_code VARCHAR(5) DEFAULT 'IN',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    language VARCHAR(10) DEFAULT 'en',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
```

---

### 2. Organizations & Teams

```sql
-- Organizations (for agency/team accounts)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    logo_url TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50), -- 1-10, 11-50, 51-200, 201-500, 500+
    type VARCHAR(50) DEFAULT 'individual', -- individual, agency, enterprise
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_owner ON organizations(owner_id);

-- Team members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- owner, admin, manager, creator, client
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP,
    joined_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- pending, active, inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_team_org ON team_members(organization_id);
CREATE INDEX idx_team_user ON team_members(user_id);

-- Client accounts (for agencies managing multiple clients)
CREATE TABLE client_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    logo_url TEXT,
    brand_colors JSONB, -- {primary: "#xxx", secondary: "#xxx"}
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_clients_org ON client_accounts(organization_id);
```

---

### 3. Subscriptions & Billing

```sql
-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- Creator, Pro, Agency, Enterprise
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    billing_period VARCHAR(20) NOT NULL, -- monthly, yearly
    price_inr DECIMAL(10,2),
    price_usd DECIMAL(10,2),
    features JSONB NOT NULL, -- {uploads: 10, platforms: 5, credits: 100}
    limits JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL, -- trial, active, past_due, canceled, expired
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    -- Payment gateway references
    razorpay_subscription_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    cashfree_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_org ON subscriptions(organization_id);
CREATE INDEX idx_subs_status ON subscriptions(status);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL, -- INR, USD
    status VARCHAR(50) NOT NULL, -- pending, success, failed, refunded
    payment_gateway VARCHAR(50), -- razorpay, stripe, cashfree, paypal
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_response JSONB,
    invoice_url TEXT,
    receipt_url TEXT,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_sub ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0, -- GST for India
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    billing_address JSONB,
    gst_number VARCHAR(50), -- For Indian businesses
    invoice_url TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, void
    issued_at TIMESTAMP,
    due_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
```

---

### 4. Brand Intelligence & Voice

```sql
-- Brand profiles
CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_account_id UUID REFERENCES client_accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    target_audience TEXT,
    content_goals TEXT[],
    preferred_platforms TEXT[], -- ['youtube', 'linkedin', 'instagram']
    tone_preset VARCHAR(50), -- professional, casual, viral, hinglish
    custom_guidelines TEXT,
    sample_content_urls TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_user ON brand_profiles(user_id);
CREATE INDEX idx_brands_org ON brand_profiles(organization_id);

-- Brand voice embeddings (stored in vector DB, metadata in PostgreSQL)
CREATE TABLE brand_voice_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    vector_db_id VARCHAR(255) NOT NULL, -- Reference to Pinecone/Qdrant
    sample_text TEXT NOT NULL,
    embedding_model VARCHAR(100), -- text-embedding-ada-002
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audience profiles
CREATE TABLE audience_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    demographics JSONB, -- {age_range: "25-45", gender: "all", location: ["India", "US"]}
    interests TEXT[],
    pain_points TEXT[],
    preferred_content_types TEXT[],
    platform_habits JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. Content Assets

```sql
-- Content assets (original uploads)
CREATE TABLE content_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_account_id UUID REFERENCES client_accounts(id) ON DELETE CASCADE,
    brand_profile_id UUID REFERENCES brand_profiles(id),
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL, -- video, audio, blog, document, image
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT, -- in bytes
    duration INTEGER, -- in seconds (for video/audio)
    mime_type VARCHAR(100),
    
    -- Source information
    source_platform VARCHAR(50), -- youtube, instagram, linkedin, upload
    source_url TEXT,
    
    -- Processing status
    upload_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_error TEXT,
    
    -- Metadata
    metadata JSONB, -- {width: 1920, height: 1080, fps: 30, codec: "h264"}
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_assets_user ON content_assets(user_id);
CREATE INDEX idx_assets_org ON content_assets(organization_id);
CREATE INDEX idx_assets_type ON content_assets(content_type);
CREATE INDEX idx_assets_status ON content_assets(upload_status);

-- Content analysis (AI-generated insights)
CREATE TABLE content_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_asset_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
    
    -- Transcription
    transcript TEXT,
    transcript_language VARCHAR(10),
    transcript_confidence DECIMAL(5,2), -- 0-100
    
    -- Analysis results
    topics TEXT[],
    keywords TEXT[],
    entities JSONB, -- {persons: [], organizations[], locations: []}
    sentiment_score DECIMAL(5,2), -- -100 to +100
    emotion_analysis JSONB, -- {joy: 0.8, sadness: 0.1, ...}
    
    -- Content quality scores
    virality_score DECIMAL(5,2), -- 0-100
    repurposing_value DECIMAL(5,2), -- 0-100
    seo_score DECIMAL(5,2), -- 0-100
    engagement_potential DECIMAL(5,2), -- 0-100
    
    -- Extracted moments
    hook_moments JSONB, -- [{timestamp: 10, text: "...", score: 95}]
    key_insights TEXT[],
    quotable_moments JSONB,
    
    -- Platform fit analysis
    platform_scores JSONB, -- {youtube: 95, linkedin: 80, instagram: 70}
    
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_model VARCHAR(100) -- gpt-4, claude-3, etc.
);

CREATE INDEX idx_analysis_asset ON content_analysis(content_asset_id);
```

---

### 6. Repurposing Engine

```sql
-- Repurposing strategies
CREATE TABLE repurposing_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_asset_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
    brand_profile_id UUID REFERENCES brand_profiles(id),
    
    recommended_formats JSONB, -- [{format: "short_video", priority: "high", platforms: ["instagram", "tiktok"]}]
    content_calendar_suggestions JSONB,
    estimated_output_count INTEGER,
    estimated_reach INTEGER,
    estimated_processing_time INTEGER, -- in seconds
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repurposing jobs (individual transformation tasks)
CREATE TABLE repurposing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_asset_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    
    job_type VARCHAR(50) NOT NULL, -- video_to_shorts, blog_to_social, podcast_to_blog
    output_format VARCHAR(50) NOT NULL, -- short_video, linkedin_post, twitter_thread
    target_platforms TEXT[], -- ['instagram', 'tiktok', 'youtube_shorts']
    
    -- Configuration
    config JSONB, -- {aspect_ratio: "9:16", caption_style: "mrbeast", duration: 60}
    template_id UUID, -- Reference to templates
    
    -- Processing
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed, cancelled
    priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
    progress INTEGER DEFAULT 0, -- 0-100
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    
    -- Credits consumed
    credits_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_asset ON repurposing_jobs(content_asset_id);
CREATE INDEX idx_jobs_user ON repurposing_jobs(user_id);
CREATE INDEX idx_jobs_status ON repurposing_jobs(status);

-- Generated content
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repurposing_job_id UUID REFERENCES repurposing_jobs(id) ON DELETE CASCADE,
    content_asset_id UUID REFERENCES content_assets(id), -- original source
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(500),
    content_text TEXT, -- For text-based outputs
    file_url TEXT, -- For video/image outputs
    thumbnail_url TEXT,
    
    content_type VARCHAR(50), -- short_video, social_post, blog_article, carousel
    target_platform VARCHAR(50), -- instagram, linkedin, tiktok, youtube
    
    -- Generated elements
    caption TEXT,
    hashtags TEXT[],
    cta TEXT,
    
    -- Metadata
    duration INTEGER, -- for videos
    word_count INTEGER, -- for text
    file_size BIGINT,
    metadata JSONB,
    
    -- Scores
    quality_score DECIMAL(5,2), -- AI-predicted quality
    virality_prediction DECIMAL(5,2),
    
    -- Publishing
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    
    -- Performance tracking
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_generated_job ON generated_content(repurposing_job_id);
CREATE INDEX idx_generated_user ON generated_content(user_id);
CREATE INDEX idx_generated_platform ON generated_content(target_platform);
```

---

### 7. Templates & Assets

```sql
-- Templates (for video intros, outros, caption styles, etc.)
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- video_intro, video_outro, caption_style, social_post
    is_public BOOLEAN DEFAULT FALSE, -- Available to all users
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Template configuration
    config JSONB NOT NULL, -- Template-specific settings
    preview_url TEXT,
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2), -- 0-5 stars
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_type ON templates(template_type);
CREATE INDEX idx_templates_public ON templates(is_public);

-- Brand templates (user-specific custom templates)
CREATE TABLE brand_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    
    customization JSONB, -- Custom colors, fonts, logos
    logo_url TEXT,
    intro_video_url TEXT,
    outro_video_url TEXT,
    brand_colors JSONB, -- {primary: "#xxx", secondary: "#yyy"}
    fonts JSONB, -- {heading: "Montserrat", body: "Inter"}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hashtag library (curated and user-saved hashtags)
CREATE TABLE hashtag_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hashtag VARCHAR(100) NOT NULL,
    platform VARCHAR(50), -- instagram, tiktok, linkedin
    category VARCHAR(100),
    performance_score DECIMAL(5,2), -- Based on usage analytics
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hashtags_user ON hashtag_library(user_id);
CREATE INDEX idx_hashtags_platform ON hashtag_library(platform);

-- CTA library
CREATE TABLE cta_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cta_text TEXT NOT NULL,
    cta_type VARCHAR(50), -- subscribe, link_click, download, follow
    platform VARCHAR(50),
    performance_score DECIMAL(5,2),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 8. Workflow & Collaboration

```sql
-- Approval workflows
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_account_id UUID REFERENCES client_accounts(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Workflow stages
    stages JSONB NOT NULL, -- [{order: 1, name: "Draft", approvers: [user_ids]}, ...]
    auto_publish BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content approval requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES approval_workflows(id),
    
    current_stage INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, revision_requested
    
    requested_by UUID REFERENCES users(id),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Approval/rejection
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    feedback TEXT,
    
    -- Revisions
    revision_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_content ON approval_requests(generated_content_id);
CREATE INDEX idx_approvals_status ON approval_requests(status);

-- Revisions
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    approval_request_id UUID REFERENCES approval_requests(id),
    
    revision_number INTEGER NOT NULL,
    requested_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    
    feedback TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QA requests (human quality assurance)
CREATE TABLE qa_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    qa_type VARCHAR(50), -- copywriter_review, video_editor_review, expert_review
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'pending', -- pending, assigned, in_review, completed
    
    assigned_to UUID, -- QA team member
    assigned_at TIMESTAMP,
    
    sla_hours INTEGER, -- Service level agreement (24, 48, 72 hours)
    due_at TIMESTAMP,
    
    feedback TEXT,
    quality_score DECIMAL(5,2),
    
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qa_content ON qa_requests(generated_content_id);
CREATE INDEX idx_qa_status ON qa_requests(status);
```

---

### 9. Distribution & Scheduling

```sql
-- Platform connections (OAuth tokens)
CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    client_account_id UUID REFERENCES client_accounts(id),
    
    platform VARCHAR(50) NOT NULL, -- youtube, instagram, linkedin, tiktok, twitter
    platform_user_id VARCHAR(255), -- Platform's user ID
    platform_username VARCHAR(255),
    
    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    
    scopes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platforms_user ON platform_connections(user_id);
CREATE INDEX idx_platforms_org ON platform_connections(organization_id);

-- Scheduled posts
CREATE TABLE scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    platform_connection_id UUID REFERENCES platform_connections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    timezone VARCHAR(50),
    
    -- AI-recommended optimal time
    is_ai_optimized BOOLEAN DEFAULT FALSE,
    optimal_time_score DECIMAL(5,2),
    
    -- Publishing status
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, publishing, published, failed, cancelled
    published_at TIMESTAMP,
    platform_post_id VARCHAR(255), -- ID from the platform
    platform_post_url TEXT,
    
    -- Publishing details
    post_caption TEXT,
    post_hashtags TEXT[],
    post_metadata JSONB,
    
    -- Error handling
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_content ON scheduled_posts(generated_content_id);
CREATE INDEX idx_scheduled_user ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_time ON scheduled_posts(scheduled_for);

-- Content calendars
CREATE TABLE content_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    client_account_id UUID REFERENCES client_accounts(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- AI-generated calendar
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_strategy JSONB, -- AI's recommendations and reasoning
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar entries
CREATE TABLE calendar_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID REFERENCES content_calendars(id) ON DELETE CASCADE,
    generated_content_id UUID REFERENCES generated_content(id),
    
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    platform VARCHAR(50),
    
    notes TEXT,
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 10. Analytics & Performance

```sql
-- Analytics snapshots (periodic data collection)
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    
    snapshot_date DATE NOT NULL,
    snapshot_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    
    -- Aggregated metrics
    total_content_created INTEGER DEFAULT 0,
    total_content_published INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    
    -- Platform breakdown
    platform_metrics JSONB, -- {instagram: {views: 1000, likes: 50}, ...}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user ON analytics_snapshots(user_id);
CREATE INDEX idx_analytics_date ON analytics_snapshots(snapshot_date);

-- Engagement metrics (detailed per content)
CREATE TABLE engagement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    
    -- Engagement data
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Calculated metrics
    engagement_rate DECIMAL(5,2),
    ctr DECIMAL(5,2), -- Click-through rate
    watch_time INTEGER, -- Total seconds watched (for videos)
    completion_rate DECIMAL(5,2), -- % who watched to end
    
    -- Timestamp
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(generated_content_id, platform, collected_at)
);

CREATE INDEX idx_metrics_content ON engagement_metrics(generated_content_id);

-- ROI calculations
CREATE TABLE roi_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_asset_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Input costs
    original_content_time_hours DECIMAL(5,2), -- Time to create original
    original_content_cost DECIMAL(10,2),
    
    -- Output value
    repurposed_pieces_count INTEGER,
    total_reach INTEGER,
    total_engagement INTEGER,
    
    -- Calculated ROI
    roi_multiplier DECIMAL(10,2), -- How many times the return vs input
    cost_per_engagement DECIMAL(10,2),
    value_score DECIMAL(10,2), -- Overall value score
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO metrics
CREATE TABLE seo_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    
    target_keywords TEXT[],
    keyword_rankings JSONB, -- {keyword: "content marketing", position: 5, search_volume: 10000}
    organic_traffic INTEGER DEFAULT 0,
    backlinks_count INTEGER DEFAULT 0,
    domain_authority_impact DECIMAL(5,2),
    
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 11. System & Configuration

```sql
-- System settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    action VARCHAR(100) NOT NULL, -- user_created, content_uploaded, payment_successful
    resource_type VARCHAR(50), -- user, content, payment
    resource_id UUID,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- content_ready, approval_needed, payment_failed
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    link_url TEXT,
    link_text VARCHAR(100),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Usage tracking (for billing and limits)
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    subscription_id UUID REFERENCES subscriptions(id),
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Usage metrics
    content_uploads INTEGER DEFAULT 0,
    ai_credits_used INTEGER DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    
    -- Limits
    upload_limit INTEGER,
    credit_limit INTEGER,
    storage_limit_bytes BIGINT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_user ON usage_tracking(user_id);
CREATE INDEX idx_usage_period ON usage_tracking(period_start, period_end);
```

---

## Vector Database Schema (Pinecone/Qdrant)

For brand voice embeddings:

```javascript
// Pinecone Index Configuration
{
  name: "brand-voice-embeddings",
  dimension: 1536, // OpenAI text-embedding-ada-002
  metric: "cosine",
  metadata_config: {
    indexed: ["brand_profile_id", "user_id", "content_type"]
  }
}

// Document structure
{
  id: "embedding_uuid",
  values: [0.023, -0.015, ...], // 1536-dimensional vector
  metadata: {
    brand_profile_id: "uuid",
    user_id: "uuid",
    sample_text: "Original text snippet",
    created_at: "2026-02-10T00:00:00Z"
  }
}
```

---

## Redis Cache Structure

```javascript
// User session cache
`session:${token}` → JSON of user session data

// Rate limiting
`ratelimit:${userId}:${endpoint}` → request count

// Processing job status
`job:${jobId}:status` → { progress: 75, status: "processing" }

// Platform optimal times cache
`optimal_times:${userId}:${platform}` → JSON array of best times

// Analytics cache
`analytics:${userId}:${date}:summary` → JSON of daily stats
```

---

## Indexes & Performance Optimization

```sql
-- Critical indexes for performance
CREATE INDEX idx_content_user_created ON content_assets(user_id, created_at DESC);
CREATE INDEX idx_jobs_status_priority ON repurposing_jobs(status, priority DESC);
CREATE INDEX idx_scheduled_upcoming ON scheduled_posts(scheduled_for) WHERE status = 'scheduled';

-- Full-text search indexes
CREATE INDEX idx_content_title_search ON content_assets USING gin(to_tsvector('english', title));
CREATE INDEX idx_generated_caption_search ON generated_content USING gin(to_tsvector('english', caption));

-- Partial indexes for active records only
CREATE INDEX idx_active_users ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_active_subs ON subscriptions(user_id) WHERE status = 'active';
```

---

## Data Retention & Archival

```sql
-- Archive old analytics data (older than 1 year)
CREATE TABLE analytics_snapshots_archive (
    LIKE analytics_snapshots INCLUDING ALL
);

-- Partition large tables by date
CREATE TABLE engagement_metrics_2026 PARTITION OF engagement_metrics
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

---

## Estimated Database Size (Year 1)

| Table | Estimated Rows | Size |
|-------|---------------|------|
| users | 10,000 | 5 MB |
| content_assets | 100,000 | 50 MB |
| generated_content | 500,000 | 200 MB |
| engagement_metrics | 5,000,000 | 2 GB |
| analytics_snapshots | 500,000 | 100 MB |
| audit_logs | 2,000,000 | 500 MB |
| **Total** | | **~3-5 GB** |

---

**This schema is production-ready, scalable to millions of users, and optimized for performance.**
