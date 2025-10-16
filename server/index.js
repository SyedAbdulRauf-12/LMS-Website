const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Allows us to receive JSON in request bodies

// --- ROUTES ---

// User Registration Route
app.post('/api/auth/register', async (req, res) => {
  try {
    // 1. Ensure 'university_id' is destructured from req.body
    const { fullName, email, password, role, dob, phone, semester, teacherId, section, university_id } = req.body;

    // Check if user already exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(401).json({ error: 'User already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Ensure 'university_id' is included in the final array of values
    const newUser = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, date_of_birth, phone_number, semester, teacher_id, section, university_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING user_id, email, role`,
      [fullName, email, passwordHash, role, dob, phone, semester, teacherId, section, university_id]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error('Registration Error:', err); // Log the full error for debugging
    // Check for unique constraint violation (duplicate email or university_id)
    if (err.code === '23505') {
      if (err.constraint === 'users_email_key') {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }
      if (err.constraint === 'users_university_id_key') {
        return res.status(400).json({ error: 'A user with this University ID already exists.' });
      }
    }
    res.status(500).send('Server error');
  }
});

// --- Add this after your app.post('/api/auth/register', ...) route ---
const jwt = require('jsonwebtoken');

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = userResult.rows[0];

    // 2. Compare the submitted password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. If credentials are valid, generate a JWT
    const payload = {
      userId: user.user_id,
      role: user.role, // We'll use this on the front-end
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token will expire in 1 hour
    });

    // 4. Send the token and user role back to the client
    res.json({ token, role: user.role });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- NEW ROUTE to get the logged-in user's details ---

// @route   GET /api/auth/user
// @desc    Get current user's data based on token
// @access  Private
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    // req.user is added by our auth middleware
    const user = await db.query(
      'SELECT user_id, full_name, email, role FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    // Important: NEVER send the password_hash back to the client
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- CLASSES API ROUTES ---

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (Teacher only)
app.post('/api/classes', auth, async (req, res) => {
  // Check if the logged-in user is a teacher
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied. Only teachers can create classes.' });
  }
  
  try {
    const { name, code, semester, section, description } = req.body;
    const newClass = await db.query(
      `INSERT INTO classes (teacher_id, class_name, course_code, semester, section, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, name, code, semester, section, description]
    );

    res.status(201).json(newClass.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/classes
// @desc    Get all classes for the logged-in teacher
// @access  Private (Teacher only)
app.get('/api/classes', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const classes = await db.query('SELECT * FROM classes WHERE teacher_id = $1 ORDER BY created_at DESC', [req.user.userId]);
    res.json(classes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete a class
// @access  Private (Teacher only)
app.delete('/api/classes/:id', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const classId = req.params.id;
    // We also check that the class belongs to the logged-in teacher for security
    const deleteResult = await db.query(
      'DELETE FROM classes WHERE class_id = $1 AND teacher_id = $2',
      [classId, req.user.userId]
    );
    
    // pg-pool's rowCount can tell us if a row was actually deleted
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Class not found or you do not have permission to delete it.' });
    }

    res.json({ msg: 'Class deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/classes/:id
// @desc    Get a single class by its ID
// @access  Private (Teacher only)
app.get('/api/classes/:id', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const classId = req.params.id;
    const teacherId = req.user.userId;

    const classResult = await db.query(
      'SELECT * FROM classes WHERE class_id = $1 AND teacher_id = $2',
      [classId, teacherId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found or access denied.' });
    }

    res.json(classResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/classes/:id/students
// @desc    Get all students enrolled in a specific class
// @access  Private (Teacher only)
app.get('/api/classes/:id/students', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const classId = req.params.id;
    const teacherId = req.user.userId;

    // This query JOINS the users and enrollments tables to get student details for a specific class
    // It also verifies that the class belongs to the logged-in teacher for security.
    const studentsResult = await db.query(
      `SELECT u.user_id, u.full_name, u.university_id, e.enrollment_id, e.status
       FROM users u
       JOIN enrollments e ON u.user_id = e.student_id
       WHERE e.class_id = $1
       AND e.class_id IN (SELECT class_id FROM classes WHERE teacher_id = $2)`,
      [classId, teacherId]
    );

    res.json(studentsResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/classes/:id/bulk-enroll
// @desc    Enroll all students from a given semester and section into a class
// @access  Private (Teacher only)
app.post('/api/classes/:id/bulk-enroll', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const classId = req.params.id;
    const { sourceSemester, sourceSection } = req.body;
    const teacherId = req.user.userId;

    // Security: First, ensure the teacher owns the target class
    const classCheck = await db.query('SELECT class_id FROM classes WHERE class_id = $1 AND teacher_id = $2', [classId, teacherId]);
    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Permission denied for this class.' });
    }

    // Find all students matching the source semester and section
    const studentsToEnroll = await db.query(
      "SELECT user_id FROM users WHERE role = 'student' AND semester = $1 AND section = $2",
      [sourceSemester, sourceSection]
    );

    if (studentsToEnroll.rows.length === 0) {
      return res.status(404).json({ error: `No students found for Semester ${sourceSemester}, Section ${sourceSection}.` });
    }
    
    // Prepare the values for a bulk insert
    const values = studentsToEnroll.rows.map(student => `(${student.user_id}, ${classId})`).join(',');
    
    // Use "ON CONFLICT DO NOTHING" to gracefully skip students who are already enrolled, preventing crashes
    const insertQuery = `INSERT INTO enrollments (student_id, class_id) VALUES ${values} ON CONFLICT (student_id, class_id) DO NOTHING`;

    await db.query(insertQuery);

    res.json({ msg: `${studentsToEnroll.rows.length} student(s) processed for enrollment.` });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ENROLLMENTS API ROUTES ---

// @route   GET /api/users/students
// @desc    Get a list of all users with the role 'student'
// @access  Private (Teacher only)
app.get('/api/users/students', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const students = await db.query("SELECT user_id, full_name FROM users WHERE role = 'student' ORDER BY full_name");
    res.json(students.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/classes/:id/students
// @desc    Add a student to a class (create an enrollment)
// @access  Private (Teacher only)
app.post('/api/classes/:id/students', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const classId = req.params.id;
    const { student_id } = req.body;

    // TODO: Verify the teacher owns the class before adding a student

    const newEnrollment = await db.query(
      "INSERT INTO enrollments (student_id, class_id) VALUES ($1, $2) RETURNING *",
      [student_id, classId]
    );

    // For a helpful response, get the newly added student's details
    const studentDetails = await db.query(
      `SELECT u.user_id, u.full_name, e.enrollment_id, e.status
       FROM users u
       JOIN enrollments e ON u.user_id = e.student_id
       WHERE e.enrollment_id = $1`,
      [newEnrollment.rows[0].enrollment_id]
    );

    res.status(201).json(studentDetails.rows[0]);
  } catch (err) {
    console.error(err.message);
    // Handle specific error for duplicate enrollment
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Student is already enrolled in this class.' });
    }
    res.status(500).send('Server Error');
  }
});


// @route   PUT /api/enrollments/:enrollmentId
// @desc    Update an enrollment status
// @access  Private (Teacher only)
app.put('/api/enrollments/:enrollmentId', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body; // 'eligible' or 'ineligible'

    // Security: Ensure the teacher owns the class this enrollment belongs to
    const updatedEnrollment = await db.query(
      `UPDATE enrollments SET status = $1 
       WHERE enrollment_id = $2
       AND class_id IN (SELECT class_id FROM classes WHERE teacher_id = $3)
       RETURNING *`,
      [status, enrollmentId, req.user.userId]
    );
    
    if (updatedEnrollment.rowCount === 0) {
      return res.status(404).json({ error: 'Enrollment not found or access denied.' });
    }

    res.json(updatedEnrollment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   DELETE /api/enrollments/:enrollmentId
// @desc    Remove a student from a class (delete an enrollment)
// @access  Private (Teacher only)
app.delete('/api/enrollments/:enrollmentId', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    const { enrollmentId } = req.params;

    // Security: Ensure teacher owns the class this enrollment belongs to
    const deleteResult = await db.query(
      `DELETE FROM enrollments 
       WHERE enrollment_id = $1
       AND class_id IN (SELECT class_id FROM classes WHERE teacher_id = $2)`,
      [enrollmentId, req.user.userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Enrollment not found or access denied.' });
    }

    res.json({ msg: 'Student removed from class successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ASSIGNMENTS API ROUTES ---

// @route   POST /api/classes/:classId/assignments
// @desc    Create a new assignment for a specific class
// @access  Private (Teacher only)
app.post('/api/classes/:classId/assignments', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const { classId } = req.params;
    const { title, description, dueDate } = req.body;
    
    // Security: Check if teacher owns the class
    const classCheck = await db.query(
      'SELECT teacher_id FROM classes WHERE class_id = $1 AND teacher_id = $2',
      [classId, req.user.userId]
    );
    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to add assignments to this class.' });
    }

    const newAssignment = await db.query(
      'INSERT INTO assignments (class_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [classId, title, description, dueDate]
    );

    res.status(201).json(newAssignment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/classes/:classId/assignments
// @desc    Get all assignments for a specific class
// @access  Private (Teacher only)
app.get('/api/classes/:classId/assignments', auth, async (req, res) => {
   if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
   try {
    const { classId } = req.params;
    
    // Security: Check if teacher owns the class
    const classCheck = await db.query(
      'SELECT teacher_id FROM classes WHERE class_id = $1 AND teacher_id = $2',
      [classId, req.user.userId]
    );
    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to view these assignments.' });
    }

    const assignments = await db.query(
      'SELECT * FROM assignments WHERE class_id = $1 ORDER BY due_date ASC',
      [classId]
    );
    res.json(assignments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ADD THESE ROUTES FOR EDITING AND DELETING ASSIGNMENTS ---

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
// @access  Private (Teacher only)
app.put('/api/assignments/:id', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const updatedAssignment = await db.query(
      `UPDATE assignments SET title = $1, description = $2, due_date = $3
       WHERE assignment_id = $4 
       AND class_id IN (SELECT class_id FROM classes WHERE teacher_id = $5)
       RETURNING *`,
      [title, description, dueDate, id, req.user.userId]
    );

    if (updatedAssignment.rowCount === 0) {
      return res.status(404).json({ error: 'Assignment not found or you do not have permission to edit it.' });
    }

    res.json(updatedAssignment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Teacher only)
app.delete('/api/assignments/:id', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const { id } = req.params;

    const deleteResult = await db.query(
      `DELETE FROM assignments WHERE assignment_id = $1
       AND class_id IN (SELECT class_id FROM classes WHERE teacher_id = $2)`,
      [id, req.user.userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Assignment not found or you do not have permission to delete it.' });
    }

    res.json({ msg: 'Assignment deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NOTES API ROUTES ---

// @route   POST /api/classes/:classId/notes
// @desc    Create a new note for a specific class
// @access  Private (Teacher only)
app.post('/api/classes/:classId/notes', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const { classId } = req.params;
    const { title, drive_link } = req.body;
    
    // Security check: Ensure teacher owns the class
    const classCheck = await db.query('SELECT teacher_id FROM classes WHERE class_id = $1 AND teacher_id = $2', [classId, req.user.userId]);
    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const newNote = await db.query(
      'INSERT INTO notes (class_id, title, drive_link) VALUES ($1, $2, $3) RETURNING *',
      [classId, title, drive_link]
    );

    res.status(201).json(newNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/classes/:classId/notes
// @desc    Get all notes for a specific class (for teachers)
// @access  Private (Teacher only)
app.get('/api/classes/:classId/notes', auth, async (req, res) => {
   if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }
   try {
    const { classId } = req.params;
    const notes = await db.query('SELECT * FROM notes WHERE class_id = $1 ORDER BY uploaded_at DESC', [classId]);
    res.json(notes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notes/:noteId
// @desc    Delete a note
// @access  Private (Teacher only)
app.delete('/api/notes/:noteId', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const { noteId } = req.params;
    const deleteResult = await db.query(
      `DELETE FROM notes WHERE note_id = $1 AND class_id IN (SELECT class_id FROM classes WHERE teacher_id = $2)`,
      [noteId, req.user.userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found or permission denied.' });
    }

    res.json({ msg: 'Note deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- DASHBOARD API ROUTE ---

// @route   GET /api/dashboard/teacher-summary
// @desc    Get summary data for the teacher's dashboard
// @access  Private (Teacher only)
app.get('/api/dashboard/teacher-summary', auth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const teacherId = req.user.userId;

    // A single, powerful query to get all the stats we need
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM classes WHERE teacher_id = $1) AS class_count,
        (SELECT COUNT(DISTINCT student_id) FROM enrollments WHERE class_id IN (SELECT class_id FROM classes WHERE teacher_id = $1)) AS student_count,
        (SELECT COUNT(*) FROM assignments WHERE class_id IN (SELECT class_id FROM classes WHERE teacher_id = $1) AND due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days') AS upcoming_deadlines;
    `;
    
    // A separate query to get the list of classes
    const classesQuery = 'SELECT class_id, class_name, course_code, section FROM classes WHERE teacher_id = $1 ORDER BY class_name ASC';
    
    // Run both queries concurrently
    const [statsResult, classesResult] = await Promise.all([
      db.query(statsQuery, [teacherId]),
      db.query(classesQuery, [teacherId])
    ]);
    
    const summary = {
      stats: statsResult.rows[0],
      classes: classesResult.rows,
    };

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// --- STUDENT API ROUTES ---

// @route   GET /api/student/classes
// @desc    Get all classes a student is enrolled in
// @access  Private (Student only)
app.get('/api/student/classes', auth, async (req, res) => {
  // Ensure the logged-in user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const studentId = req.user.userId;

    // This query joins three tables to get the class details and the teacher's name
    const classesResult = await db.query(
      `SELECT
          c.class_id,
          c.class_name,
          c.course_code,
          c.section,
          c.semester,
          u.full_name AS teacher_name
       FROM classes c
       JOIN enrollments e ON c.class_id = e.class_id
       JOIN users u ON c.teacher_id = u.user_id
       WHERE e.student_id = $1`,
      [studentId]
    );

    res.json(classesResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});