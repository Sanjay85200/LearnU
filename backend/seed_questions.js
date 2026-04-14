const db = require('./config/db');

// Sample data extracted directly from the user's uploaded images
// Note: We use JSON.stringify for extended_data
const questions = [
  {
    test_id: 1, // Assumes Test 1 created below
    question_text: "In soccer, from out of the following, mark the official whose responsibility is discharged additionally by some other official",
    question_type: "standard",
    option_a: "Referee",
    option_b: "Assistant Referee",
    option_c: "Time keeper",
    option_d: "Additional Assistant Referee",
    correct_option: "c",
    extended_data: null
  },
  {
    test_id: 1,
    question_text: "In foot ball, with in the penalty area, the penalty spot is marked in front and centre of the midpoint of the goal line at a distance of",
    question_type: "standard",
    option_a: "10 yards",
    option_b: "11 yards",
    option_c: "12 yards",
    option_d: "13 yards",
    correct_option: "c",
    extended_data: null
  },
  {
    test_id: 1,
    question_text: "From out of the following, name the nation where cricket is no craze at all much less played",
    question_type: "standard",
    option_a: "West indies",
    option_b: "Germany",
    option_c: "Newzeland",
    option_d: "England",
    correct_option: "b",
    extended_data: null
  },
  {
    test_id: 1,
    question_text: "Match list-I and List-II and select the correct option from the codes provided below.",
    question_type: "matching",
    option_a: "1, 2, 3, 4",
    option_b: "3, 1, 4, 2",
    option_c: "2, 4, 1, 3",
    option_d: "4, 3, 1, 2",
    correct_option: "b",
    extended_data: JSON.stringify({
      listI: ["i) Gully", "ii) Pivot", "iii) Photo finish", "iv) Deuce"],
      listII: ["1. Cricket", "2. Basket ball", "3. Athletics", "4. Tennikoit"]
    })
  },
  {
    test_id: 1,
    question_text: "Using the codes given below, Identify the play situations in cricket where in a batter is declared out",
    question_type: "multiple_codes",
    option_a: "i, iii and v",
    option_b: "i, ii, iv and vi",
    option_c: "i, ii, iii and vi",
    option_d: "i, iii, iv and v",
    correct_option: "b",
    extended_data: JSON.stringify({
      statements: [
        "i) Caught and bowled", 
        "ii) Hitting a ball twice", 
        "iii) Hitting a fly ball", 
        "iv) Leg before wicket", 
        "v) Flicking the ball", 
        "vi) Touching the ball with hand"
      ]
    })
  }
];

function seedDB() {
  db.serialize(() => {
    // Upsert a test first to hold these questions
    db.run(`INSERT INTO tests (id, teacher_id, title, category, test_type, duration_minutes) VALUES (1, 1, 'Physical Education Demo Test', 'Sports', 'challenge', 30)`, function(err) {
      if (err) {
        console.log("Test 1 already exists or error:", err.message);
      }
      
      const stmt = db.prepare(`INSERT INTO questions (test_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_option, extended_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      for (const q of questions) {
        stmt.run(q.test_id, q.question_text, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.extended_data);
      }
      
      stmt.finalize();
      console.log("Successfully seeded questions from the physical education templates.");
    });
  });
}

// We need a dummy teacher to satisfy the foreign key constraint
db.run(`INSERT INTO users (id, role, name, email) VALUES (1, 'teacher', 'Admin Teacher', 'admin@learnu.com')`, function(err) {
  seedDB();
});
