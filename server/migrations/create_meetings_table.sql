-- Migration: Create meetings table
-- Date: 2024-10-23

CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 60, -- in minutes
    platform VARCHAR(50) NOT NULL, -- zoom, teams, googleMeet, webrtc
    meeting_type VARCHAR(50) NOT NULL, -- academic, administrative, counseling, parent-teacher, student-group, staff, other
    host_id VARCHAR(255) NOT NULL,
    host_name VARCHAR(255) NOT NULL,
    host_email VARCHAR(255),
    max_participants INTEGER,
    join_url TEXT,
    meeting_code VARCHAR(255),
    password VARCHAR(255),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, active, ended, cancelled
    participants JSONB DEFAULT '[]',
    settings JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    started_by VARCHAR(255),
    ended_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_time ON meetings(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_platform ON meetings(platform);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_type ON meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);
