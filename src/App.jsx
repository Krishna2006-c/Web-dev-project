import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./index.css";

/* ============================================================
   SIDEBAR COMPONENT
   - Navigation links to all pages
   ============================================================ */
function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>📚 LibSys</h2>
        
      </div>
      <ul className="menu">
        <li><Link to="/">📊 Dashboard</Link></li>
        <li><Link to="/books">📖 Books</Link></li>
        <li><Link to="/notifications">🔔 Notifications</Link></li>
        <li><Link to="/members">👥 Members</Link></li>
        <li><Link to="/settings">⚙️ Settings</Link></li>
      </ul>
    </div>
  );
}

/* ============================================================
   LOGIN MODAL COMPONENT
   - Simple authentication (demo: user/pass = admin/admin)
   - On success, stores login state in localStorage
   ============================================================ */
function Login({ close, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Demo credentials - in real app, call an API
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", username);
      onLoginSuccess();
      close();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>🔐 Login to Library System</h2>
        <input 
          type="text" 
          placeholder="Username (admin)" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password (admin)" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleLogin}>Login</button>
          <button className="btn btn-secondary" onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD PAGE
   - Shows statistics: total books, issued, available, members
   - Displays popular books from the global book list
   - Includes video banner and login button
   ============================================================ */
function Dashboard({ books, members }) {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status from localStorage on mount
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  // Calculate statistics
  const totalBooks = books.length;
  const issuedBooks = books.filter(b => b.status === "issued").length;
  const availableBooks = totalBooks - issuedBooks;
  const totalMembers = members.length;

  // Get first 4 books for popular section
  const popularBooks = books.slice(0, 4);

  return (
    <div>
      {showLogin && <Login close={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />}

      <div className="top-bar">
        <div className="search-wrapper">
          <input type="text" placeholder="🔍 Search books, members..." />
        </div>
        <div className="user-area">
          {isLoggedIn ? (
            <>
              <span className="user-name">👤 {localStorage.getItem("user")}</span>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Hero Video Banner */}
      <div className="banner">
        <video autoPlay muted loop playsInline >
          <source src="library-video.mp4" type="video/mp4" />        
          Your browser does not support the video tag.
        </video>
        <div className="banner-overlay">
          <h1>Welcome to Library Management System</h1>
          <p>Manage books, members, and issuances seamlessly</p>
        </div>
      </div>

      <h1 className="page-title">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="cards">
        <div className="card">
          <h3>📚 Total Books</h3>
          <p>{totalBooks}</p>
        </div>
        <div className="card">
          <h3>📖 Issued</h3>
          <p>{issuedBooks}</p>
        </div>
        <div className="card">
          <h3>✅ Available</h3>
          <p>{availableBooks}</p>
        </div>
        <div className="card">
          <h3>👥 Members</h3>
          <p>{totalMembers}</p>
        </div>
      </div>

      <h2>🔥 Popular Books</h2>
      <div className="book-grid">
        {popularBooks.map((book) => (
          <div key={book.id} className="book-card">
            <h4>{book.title}</h4>
            <p className="book-author">{book.author}</p>
            <span className={`status-badge ${book.status}`}>
              {book.status === "available" ? "Available" : "Issued"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   BOOKS PAGE
   - List all books with search, filter by status
   - Add new book (modal form)
   - Issue / Return actions (update status and create notifications)
   ============================================================ */
function Books({ books, setBooks, addNotification }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "" });

  // Filter books based on search text and status
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                          book.author.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleIssue = (bookId) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId && book.status === "available"
          ? { ...book, status: "issued" }
          : book
      )
    );
    addNotification(`📘 Book "${books.find(b => b.id === bookId)?.title}" has been issued.`);
  };

  const handleReturn = (bookId) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId && book.status === "issued"
          ? { ...book, status: "available" }
          : book
      )
    );
    addNotification(`✅ Book "${books.find(b => b.id === bookId)?.title}" has been returned.`);
  };

  const handleAddBook = () => {
    if (!newBook.title || !newBook.author) return;
    const newId = Date.now(); // simple unique id
    const bookToAdd = {
      id: newId,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn || "N/A",
      status: "available"
    };
    setBooks(prev => [...prev, bookToAdd]);
    addNotification(`📚 New book "${newBook.title}" added to library.`);
    setNewBook({ title: "", author: "", isbn: "" });
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Books Collection</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Book</button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
        </select>
      </div>

      <div className="book-grid">
        {filteredBooks.map((book) => (
          <div key={book.id} className="book-card">
            <h4>{book.title}</h4>
            <p className="book-author">by {book.author}</p>
            <p className="book-isbn">ISBN: {book.isbn}</p>
            <span className={`status-badge ${book.status}`}>
              {book.status === "available" ? "Available" : "Issued"}
            </span>
            <div className="book-actions">
              {book.status === "available" ? (
                <button className="btn btn-success" onClick={() => handleIssue(book.id)}>Issue</button>
              ) : (
                <button className="btn btn-warning" onClick={() => handleReturn(book.id)}>Return</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Book</h2>
            <input
              type="text"
              placeholder="Book Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              type="text"
              placeholder="ISBN (optional)"
              value={newBook.isbn}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleAddBook}>Add Book</button>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS PAGE
   - Displays all system notifications (issue, return, new book, etc.)
   - Option to clear all
   ============================================================ */
function Notifications({ notifications, clearNotifications }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        {notifications.length > 0 && (
          <button className="btn btn-secondary" onClick={clearNotifications}>Clear All</button>
        )}
      </div>
      <div className="notifications-list">
        {notifications.length === 0 && (
          <div className="empty-state">✨ No new notifications</div>
        )}
        {notifications.map((note, idx) => (
          <div key={idx} className="notification-item">
            <span className="note-icon">🔔</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MEMBERS PAGE
   - List all members
   - Add new member
   - Delete member
   ============================================================ */
function Members({ members, setMembers, addNotification }) {
  const [newMemberName, setNewMemberName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newMember = {
      id: Date.now(),
      name: newMemberName.trim(),
      joined: new Date().toLocaleDateString()
    };
    setMembers(prev => [...prev, newMember]);
    addNotification(`👤 New member "${newMemberName}" joined.`);
    setNewMemberName("");
    setShowAddMember(false);
  };

  const handleDeleteMember = (id, name) => {
    if (window.confirm(`Remove member "${name}"?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      addNotification(`❌ Member "${name}" removed.`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Library Members</h1>
        <button className="btn btn-primary" onClick={() => setShowAddMember(true)}>+ Add Member</button>
      </div>

      <div className="members-grid">
        {members.map(member => (
          <div key={member.id} className="member-card">
            <div className="member-avatar">👤</div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <p>Member since: {member.joined}</p>
            </div>
            <button className="btn btn-danger" onClick={() => handleDeleteMember(member.id, member.name)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Member</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleAddMember}>Add Member</button>
              <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS PAGE
   - Placeholder for future settings (theme, rules, etc.)
   ============================================================ */
function Settings() {
  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <div className="settings-card">
        <div className="setting-item">
          <span>🌙 Dark Mode</span>
          <span className="coming-soon">Coming soon</span>
        </div>
        <div className="setting-item">
          <span>🔔 Email Notifications</span>
          <span className="coming-soon">Coming soon</span>
        </div>
        <div className="setting-item">
          <span>📄 Export Data (CSV)</span>
          <span className="coming-soon">Coming soon</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP COMPONENT
   - Central state: books, members, notifications
   - Persist data to localStorage on every change
   - Provide addNotification helper to child components
   ============================================================ */
function App() {
  // Load initial data from localStorage or use default demo data
  const loadInitialBooks = () => {
    const saved = localStorage.getItem("library_books");
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", status: "available" },
      { id: 2, title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", status: "issued" },
      { id: 3, title: "Design Patterns", author: "GoF", isbn: "9780201633610", status: "available" },
      { id: 4, title: "AI Basics", author: "Stuart Russell", isbn: "9780136610993", status: "available" },
      { id: 5, title: "Web Development", author: "Jon Duckett", isbn: "9781118907443", status: "issued" },
      { id: 6, title: "Cyber Security", author: "Bruce Schneier", isbn: "9780471394886", status: "available" },
    ];
  };

  const loadInitialMembers = () => {
    const saved = localStorage.getItem("library_members");
    if (saved) return JSON.parse(saved);
    return [
      { id: 101, name: "Devansh Jain", joined: "2024-01-15" },
      { id: 102, name: "Krishna Mahajan", joined: "2024-02-20" },
      { id: 103, name: "Aditi Sharma", joined: "2024-03-10" },
      { id: 104, name: "Rahul Verma", joined: "2024-04-05" },
    ];
  };

  const loadInitialNotifications = () => {
    const saved = localStorage.getItem("library_notifications");
    if (saved) return JSON.parse(saved);
    return [
      "📢 Welcome to Library Management System!",
      "📚 New book 'Clean Code' added.",
      "⏰ Return reminder: 'Atomic Habits' due soon."
    ];
  };

  const [books, setBooks] = useState(loadInitialBooks);
  const [members, setMembers] = useState(loadInitialMembers);
  const [notifications, setNotifications] = useState(loadInitialNotifications);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("library_books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("library_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("library_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Helper to add a new notification (with max limit 50)
  const addNotification = (message) => {
    setNotifications(prev => [message, ...prev].slice(0, 50));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard books={books} members={members} />} />
            <Route path="/books" element={<Books books={books} setBooks={setBooks} addNotification={addNotification} />} />
            <Route path="/notifications" element={<Notifications notifications={notifications} clearNotifications={clearNotifications} />} />
            <Route path="/members" element={<Members members={members} setMembers={setMembers} addNotification={addNotification} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;