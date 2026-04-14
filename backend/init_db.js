const db = require('./config/db');

function initDB() {
    db.serialize(() => {
        // Users table (Both Teachers and Students)
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT CHECK(role IN ('teacher', 'student')) NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                firebase_uid TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tests table
        db.run(`
            CREATE TABLE IF NOT EXISTS tests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                category TEXT,
                difficulty TEXT DEFAULT 'medium',
                test_type TEXT CHECK(test_type IN ('mock', 'challenge', 'scoring')) NOT NULL,
                duration_minutes INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Questions table
        db.run(`
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                question_type TEXT DEFAULT 'standard',
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_option TEXT NOT NULL,
                extended_data TEXT, -- JSON stored as text
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
            );
        `);

        // Results table
        db.run(`
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                test_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                accuracy_percentage REAL,
                time_taken_seconds INTEGER,
                attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
            );
        `, (err) => {
            if (err) {
                console.error("Error creating tables:", err.message);
            } else {
                console.log("All tables initialized successfully in SQLite!");
            }
            db.close();
        });
    });
}

initDB();
