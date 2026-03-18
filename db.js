const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('chatbotia.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQlite database.');
    }
});

// Create tables
const createTables = () => {
    const appointmentsTable = `CREATE TABLE IF NOT EXISTS appointments (` +
        `id INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `customer_id INTEGER NOT NULL,` +
        `appointment_date TEXT NOT NULL,` +
        `service TEXT NOT NULL,` +
        `FOREIGN KEY (customer_id) REFERENCES customers (id)` +
    `);`;

    const menuItemsTable = `CREATE TABLE IF NOT EXISTS menu_items (` +
        `id INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `name TEXT NOT NULL,` +
        `description TEXT,` +
        `price REAL NOT NULL` +
    `);`;

    const promotionsTable = `CREATE TABLE IF NOT EXISTS promotions (` +
        `id INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `title TEXT NOT NULL,` +
        `discount REAL NOT NULL,` +
        `start_date TEXT NOT NULL,` +
        `end_date TEXT NOT NULL` +
    `);`;

    const customersTable = `CREATE TABLE IF NOT EXISTS customers (` +
        `id INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `name TEXT NOT NULL,` +
        `email TEXT NOT NULL UNIQUE` +
    `);`;

    // Execute table creation queries
    db.serialize(() => {
        db.run(appointmentsTable);
        db.run(menuItemsTable);
        db.run(promotionsTable);
        db.run(customersTable);
    });
};

// Initialize the database
createTables();

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database connection ' + err.message);
    } else {
        console.log('Database connection closed.');
    }
});