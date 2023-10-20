import { useState, useEffect } from "react";
// to write, read, and remove files api from tauri
import { writeTextFile, readTextFile, removeFile } from "@tauri-apps/api/fs";
// to save files dialog from tauri
import { save } from "@tauri-apps/api/dialog";
// to get documents directory
import { documentDir } from "@tauri-apps/api/path";
import { note_icon, plus_icon, delete_icon } from "../assets/image/image";
import {
  initDB,
  getNotesFromDB,
  saveNoteInDB,
  deleteNoteFromDatabase,
} from "../utils/database";
import dayjs from "dayjs";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(0);
  const [activeNoteContent, setActiveNoteContent] = useState("");

  // update notes state
  const updateNotes = (notes) => {
    setNotes([...notes]);
  };

  // find notes by note.id from notes array state
  const findNoteById = (notes, id) => {
    return notes.find((note) => note.id === id);
  };

  // delete note from database and notes state
  const deleteNote = async (note) => {
    // delete file from local users disk
    await removeFile(note.location);

    await deleteNoteFromDatabase(note.id);

    const updatedNotes = notes.filter((n) => n.id !== note.id);
    updateNotes(updatedNotes);

    // if (activeNote >= note.id) {
    //   setActiveNoteData(activeNote >= 1 ? activeNote - 1 : 0);
    // }

    if (activeNote.id === note.id) {
      setActiveNote(0);
    }
  };

  // add note in database and in notes state
  const addNote = async () => {
    const savePath = await save({
      // only show text and markdown files
      filters: [{ name: "Text/Markdown", extensions: ["txt", "md"] }],
      // defaultly open document directory
      defaultPath: (await documentDir()) + "/",
    });

    if (!savePath) {
      return;
    }

    // write file in local users disk
    await writeTextFile(`${savePath}.txt`, "");

    // set filename as notes title
    const filename = savePath.split("/").pop();

    const newNote = {
      // title: "New Note",
      title: filename,
      createdAt: `${dayjs().format("ddd, DD MM YYYY")} at ${dayjs().format(
        "hh:mm A"
      )}`,
      location: `${savePath}.txt`,
    };

    // save note in db
    await saveNoteInDB(newNote);

    // saving new note to notes state
    updateNotes([{ ...newNote }, ...notes]);
    setActiveNote(0);
    setActiveNoteContent("");
  };

  // handle text input
  /* { target: { value } } is events child, like we do event.target.value 
    while getting text input */
  const handleChange = ({ target: { value } }) => {
    /* { target: { value } } is events child, like we do event.target.value 
    while getting text input */
    // set notes first line as notes title
    // const header = value.split(/\r?\n/)[0];

    // if (notes.length !== 0 && activeNote.title !== header) {
    //   activeNote.title = header;
    //   updateNotes([...notes]);
    // }

    setActiveNoteContent(value);
    // write file in local users disk
    writeTextFile(activeNote.location, value);
  };

  const setActiveNoteData = async (note) => {
    const currentNote = findNoteById(notes, note.id);

    console.log("active note data", currentNote);

    setActiveNote(currentNote);

    if (notes.length === 0) {
      setActiveNoteContent("");
    } else {
      const contents = await readTextFile(currentNote.location);
      setActiveNoteContent(contents);
    }
  };

  useEffect(() => {
    // initialize database
    initDB();

    const getNotesFromStorage = async () => {
      const myNotes = await getNotesFromDB();

      console.log("fetched noted", myNotes);

      // set notes we got from database in state
      setNotes(myNotes);
    };

    getNotesFromStorage();
  }, []);

  return (
    <div className="container flex flex flex-row h-screen">
      <div className="container_left  w-2/5 border-2 border-slate-200">
        <div className="container_left__header m-2">
          <div className="container_left__header flex flex-row items-center justify-between">
            <div className="flex flex-row">
              <img src={note_icon} alt="Notes Icon" className="h-8 w-8 m-2.5" />
              <p className="text-xl font-semibold m-2.5">Your Notes</p>
            </div>
            <div
              className="container_left_header_action flex flex-row items-center border-2 rounded-md border-red-500 w-1/4 mr-3 hover:cursor-pointer"
              onClick={addNote}
            >
              <img
                src={plus_icon}
                alt="Add New Note Icon"
                className="h-8 w-8"
              />
              <p className="text-red-500 font-semibold pl-1">New Note</p>
            </div>
          </div>
        </div>
        <div className="container_left_content">
          {notes.map((note, index) => (
            <div
              key={`${note.title}_${index}`}
              className="flex flex-row justify-between items-center border-t-2 border-slate-200 p-4 hover:cursor-pointer"
              onClick={() => setActiveNoteData(note)}
            >
              <div className="container_left_content_row_left">
                <p className="container_left_content_row_left_title text-xl">
                  {note.title || "Untitled"}
                </p>
                <p className="container_left_content_row_left_date text-sm text-gray-500">
                  {note.createdAt}
                </p>
              </div>

              <img
                src={delete_icon}
                alt="Delete Note Icon"
                className="container_left_content_row_action h-8 w-8"
                // onClick={() => deleteNote(index)}
                onClick={() => deleteNote(note)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="container_right flex flex-col w-3/5">
        <p className="container_right_date text-sm text-gray-500 text-center mt-2 mb-2">
          {activeNote?.createdAt}
        </p>
        <textarea
          name="note_input"
          placeholder="Write Your Note Here"
          onChange={handleChange}
          value={activeNote ? activeNoteContent : ""}
          className="h-screen m-4 mr-8"
          disabled={activeNote ? false : true}
        ></textarea>
      </div>
    </div>
  );
}

export default App;
