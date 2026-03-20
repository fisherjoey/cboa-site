-- =============================================
-- Contact Form Submissions Table
-- Track all contact form submissions for admin review
-- =============================================

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Sender info
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,

    -- Form fields
    category VARCHAR(100) NOT NULL,
    category_label VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,

    -- Routing
    recipient_email VARCHAR(255) NOT NULL,

    -- Attachments
    attachment_urls JSONB,

    -- Admin tracking
    status VARCHAR(50) DEFAULT 'new' NOT NULL, -- 'new', 'read', 'responded', 'archived'
    notes TEXT,

    -- Reference to email_history entry
    email_history_id UUID REFERENCES email_history(id)
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_category ON contact_submissions(category);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_sender_email ON contact_submissions(sender_email);

-- =============================================
-- Auto-update updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_submissions_updated_at();

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Service role can insert (from Netlify functions)
CREATE POLICY "Service role can insert contact submissions" ON contact_submissions
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.user_id::text = auth.uid()::text
            AND members.role = 'Admin'
        )
    );

-- Service role can view all
CREATE POLICY "Service role can view contact submissions" ON contact_submissions
    FOR SELECT
    TO service_role
    USING (true);

-- Service role can update (for status/notes changes via API)
CREATE POLICY "Service role can update contact submissions" ON contact_submissions
    FOR UPDATE
    TO service_role
    USING (true);

-- Admins can update (status and notes)
CREATE POLICY "Admins can update contact submissions" ON contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.user_id::text = auth.uid()::text
            AND members.role = 'Admin'
        )
    );

COMMENT ON TABLE contact_submissions IS 'Contact form submissions from the public website, with admin tracking.';
