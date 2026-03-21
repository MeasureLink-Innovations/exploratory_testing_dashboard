CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  mission TEXT NOT NULL,
  charter TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in-progress, completed
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
