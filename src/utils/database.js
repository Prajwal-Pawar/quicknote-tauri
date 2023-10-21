import Database from "tauri-plugin-sql-api";

// for sqlite
// const db = await Database.load("sqlite:quicknote.db");

let db;

const databaseInit = async () => {
  db = await Database.load("sqlite:quicknote.db");

  return db;
};

databaseInit();

if (!db) {
  console.log(`Database not initialized`);
}

console.log(`Database initialized`);

// initialize database
const initDB = async () => {
  try {
    const result = await db.execute(
      "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, createdAt TEXT, location TEXT)"
    );

    console.log(`in init database`, result);

    return result;
  } catch (err) {
    console.error(err);
    return;
  }
};

// get notes from database
const getNotesFromDB = async () => {
  try {
    const result = await db.select("SELECT * FROM notes");

    console.log("notes from database", result);

    return result;
  } catch (err) {
    console.error(err);
    return;
  }
};

// save notes in database
const saveNoteInDB = async (note) => {
  const result = await db.execute(
    "INSERT INTO notes (title, createdAt, location) VALUES ($1, $2, $3)",
    [note.title, note.createdAt, note.location]
  );

  console.log("note inserted in database", result);

  return result;
};

// delete notes from database
const deleteNoteFromDatabase = async (noteId) => {
  console.log("note deleted in database idd", noteId);
  const result = await db.execute("DELETE FROM notes WHERE id = $1", [noteId]);

  console.log("note deleted in database", result);

  return result;
};

export { initDB, getNotesFromDB, saveNoteInDB, deleteNoteFromDatabase };
