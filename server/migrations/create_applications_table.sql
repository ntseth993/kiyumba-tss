CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  program TEXT,
  level TEXT,
  address TEXT,
  date_of_birth DATE,
  previous_school TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
