const connection = require("./database");

const saveUserDataHandler = (req, res) => {
  const { name, gender, date_of_birth, email, password, role } = req.body;

  // Check if any of the required fields are empty
  if (!name || !gender || !date_of_birth || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  // Check if the email already exists in the database
  const emailCheckQuery = `SELECT * FROM user WHERE email = ?`;
  connection.query(emailCheckQuery, [email], (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else if (results.length > 0) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      // Proceed to save the user data if the email is not found in the database
      const insertQuery = `INSERT INTO user (name, gender, date_of_birth, email, password, role) VALUES (?, ?, ?, ?, ?, ?)`;
      connection.query(
        insertQuery,
        [name, gender, date_of_birth, email, password, role],
        (error, results) => {
          if (error) {
            res.status(500).json({ error: error.message });
          } else {
            res.json({ message: "User data saved successfully" });
          }
        }
      );
    }
  });
};

const updateUserDataHandler = (req, res) => {
  // const userId = req.params.id;
  const { uid, name, gender, date_of_birth, email, password, role } = req.body;

  // Check if any of the required fields are empty
  if (!name || !gender || !date_of_birth || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  // Check if the email already exists for a different user
  const emailCheckQuery = `SELECT * FROM user WHERE email = ? AND uid != ?`;
  connection.query(emailCheckQuery, [email, uid], (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else if (results.length > 0) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      // Proceed to update the user data
      const updateQuery = `UPDATE user SET name = ?, gender = ?, date_of_birth = ?, email = ?, password = ?, role = ? WHERE uid = ?`;
      connection.query(
        updateQuery,
        [name, gender, date_of_birth, email, password, role, uid],
        (error, results) => {
          if (error) {
            res.status(500).json({ error: error.message });
          } else {
            res.json({ message: "User data updated successfully" });
          }
        }
      );
    }
  });
};

const deleteUserDataHandler = (req, res) => {
  const { uid } = req.body;

  // Check if uid is provided
  if (!uid) {
    return res
      .status(400)
      .json({ error: "UID is missing in the request body" });
  }

  // Proceed to delete the user data
  const deleteQuery = `DELETE FROM user WHERE uid = ?`;
  connection.query(deleteQuery, [uid], (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      if (results.affectedRows > 0) {
        res.json({ message: "User data deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  });
};

const getAllUserDataHandler = (req, res) => {
  // Create a SELECT query to fetch all user data
  const selectQuery = `SELECT * FROM user`;

  // Execute the query
  connection.query(selectQuery, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      // User data found, send it as a response
      res.json(results);
    }
  });
};

const loginHandler = (req, res) => {
  const { email, password } = req.body;

  // Check if any of the required fields are empty
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide both email and password" });
  }

  // Check if the email exists in the database and the password is correct
  const loginQuery = `SELECT * FROM user WHERE email = ? AND password = ?`;
  connection.query(loginQuery, [email, password], (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Invalid email or password" });
    } else {
      // User found and password is correct, proceed with login
      const user = results[0];
      const userData = {
        uid: user.uid,
        name: user.name,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        email: user.email,
        password: user.password,
        role: user.role,
      };
      res.json({ message: "Login successful", user: userData });
    }
  });
};

module.exports = {
  saveUserDataHandler,
  getAllUserDataHandler,
  loginHandler,
  updateUserDataHandler,
  deleteUserDataHandler,
};
