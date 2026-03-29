CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  mission TEXT NOT NULL,
  charter TEXT NOT NULL,
  machine_name VARCHAR(255),
  software_version VARCHAR(255),
  status VARCHAR(50) DEFAULT 'planned', -- planned, in-progress, debriefing, completed
  duration_minutes INTEGER DEFAULT 60,
  debrief_summary TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- note, finding, issue
  author VARCHAR(50) NOT NULL, -- tester, machine
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artifacts (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- log, measurement, screenshot
  data BYTEA NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS log_artifacts (
  log_id INTEGER REFERENCES logs(id) ON DELETE CASCADE,
  artifact_id INTEGER REFERENCES artifacts(id) ON DELETE CASCADE,
  PRIMARY KEY (log_id, artifact_id)
);

CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs(session_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_session_id ON artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_log_artifacts_log_id ON log_artifacts(log_id);
CREATE INDEX IF NOT EXISTS idx_log_artifacts_artifact_id ON log_artifacts(artifact_id);
