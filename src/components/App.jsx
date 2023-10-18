import { useState, useEffect } from "react";
// to write, read, and remove files api from tauri
import { writeTextFile, readTextFile, removeFile } from "@tauri-apps/api/fs";
// to save files dialog from tauri
import { save } from "@tauri-apps/api/dialog";
import { note_icon, plus_icon, delete_icon } from "../assets/image/image";
import {
  getNotesFromLocalStorage,
  setNotesInLocalStorage,
} from "../helpers/getFromLocalStorage";
import dayjs from "dayjs";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(0);
  const [activeNoteContent, setActiveNoteContent] = useState("");

  // update local storage with new notes
  const updateNotes = (notes) => {
    setNotes([...notes]);
    setNotesInLocalStorage(JSON.stringify(notes));
  };

  // delete note
  const deleteNote = async (noteId) => {
    await removeFile(notes[noteId].location);

    notes.splice(noteId, 1);
    updateNotes(notes);

    if (activeNote >= noteId) {
      setActiveNoteData(activeNote >= 1 ? activeNote - 1 : 0);
    }
  };

  // add note
  const addNote = async () => {
    const savePath = await save();

    if (!savePath) {
      return;
    }

    await writeTextFile(`${savePath}.txt`, "");

    const newNote = {
      title: "New Note",
      createdAt: `${dayjs().format("ddd, DD MM YYYY")} at ${dayjs().format(
        "hh:mm A"
      )}`,
      location: `${savePath}.txt`,
    };

    // saving new note to localstorage
    updateNotes([{ ...newNote }, ...notes]);
    setActiveNote(0);
    setActiveNoteContent("");
  };

  const handleChange = ({ target: { value } }) => {
    const header = value.split(/\r?\n/)[0];

    if (notes.length !== 0 && notes[activeNote].title !== header) {
      notes[activeNote].title = header;
      updateNotes([...notes]);
    }

    setActiveNoteContent(value);
    writeTextFile(notes[activeNote].location, value);
  };

  const setActiveNoteData = async (index) => {
    setActiveNote(index);

    if (notes.length === 0) {
      setActiveNoteContent("");
    } else {
      const contents = await readTextFile(notes[index].location);
      setActiveNoteContent(contents);
    }
  };

  useEffect(() => {
    const getNotesFromStorage = async () => {
      const myNotes = await getNotesFromLocalStorage();

      setNotes(myNotes);
    };

    getNotesFromStorage();
  }, []);

  return (
    <div className="container flex flex flex-row h-screen">
      <div className="container__left  w-2/5 border-2 border-slate-200">
        <div className="container__left__header m-2">
          <div className="container__left__header flex flex-row items-center justify-between">
            <div className="flex flex-row">
              <img src={note_icon} alt="Notes Icon" className="h-8 w-8 m-2.5" />
              <p className="text-xl font-semibold m-2.5">My Notes</p>
            </div>
            <div
              className="container__left__header__action flex flex-row items-center border-2 rounded-md border-red-500 w-1/4 mr-3 hover:cursor-pointer"
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
        <div className="container__left__content">
          {notes.map((item, index) => (
            <div
              key={`${item.title}_${index}`}
              // className={`container__left__content__row ${
              //   index === activeNote && "active"
              // }`}
              className="flex flex-row justify-between items-center border-t-2 border-slate-200 p-4"
              onClick={() => setActiveNoteData(index)}
            >
              <div className="container__left__content__row__left">
                <p className="container__left__content__row__left__title text-xl">
                  {item.title || "Untitled"}
                </p>
                <p className="container__left__content__row__left__date text-sm text-gray-500">
                  {item.createdAt}
                </p>
              </div>

              <img
                src={delete_icon}
                alt="Delete Note Icon"
                className="container__left__content__row__action h-8 w-8"
                onClick={() => deleteNote(index)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="container__right flex flex-col w-3/5">
        <p className="container__right__date text-sm text-gray-500 text-center mt-2 mb-2">
          {notes[activeNote]?.createdAt}
        </p>
        <textarea
          name="note_input"
          placeholder="Write Your Note Here"
          onChange={handleChange}
          value={activeNoteContent}
          className="h-screen m-4 mr-8"
          disabled={activeNoteContent ? false : true}
        ></textarea>
      </div>
    </div>
  );
}

export default App;
