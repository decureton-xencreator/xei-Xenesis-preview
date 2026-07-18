PRAGMA foreign_keys = ON;

CREATE TABLE invites (
  token_hash TEXT PRIMARY KEY,
  audience TEXT NOT NULL CHECK (audience IN ('ed','kim','ahmer')),
  label TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT
);

CREATE TABLE events (
  event_id TEXT PRIMARY KEY,
  invite_hash TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('premiere_started','path_selected','premiere_completed','second_appointment_continued')),
  selected_path TEXT CHECK (selected_path IS NULL OR selected_path IN ('bdc','company','compare')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invite_hash) REFERENCES invites(token_hash)
);

CREATE INDEX events_invite_created_idx ON events(invite_hash, created_at DESC);
CREATE INDEX events_type_created_idx ON events(event_type, created_at DESC);
