import { useState, useEffect } from "react";
// to write, read, and remove files api from tauri
import {
  writeTextFile,
  readTextFile,
  removeFile,
  createDir,
  exists,
  BaseDirectory,
} from "@tauri-apps/api/fs";
// to save files dialog from tauri
import { save } from "@tauri-apps/api/dialog";
// to get documents directory
import { documentDir } from "@tauri-apps/api/path";
import { Edit, FileText, Sun, Moon, FilePlus, Trash2 } from "react-feather";
import {
  initDB,
  getNotesFromDB,
  saveNoteInDB,
  deleteNoteFromDatabase,
} from "../utils/database";
// for using markdown format
import { marked } from "marked";
import dayjs from "dayjs";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(0);
  const [activeNoteContent, setActiveNoteContent] = useState("");
  const [saveNotesFolderName, setSaveNotesFolderName] = useState("quicknotes");
  // for rendering notes in markdown
  const [renderedMarkdown, setRenderedMarkdown] = useState(activeNoteContent);
  const [isRenderingMarkdown, setIsRenderingMarkdown] = useState(false);
  // dark mode
  const [darkMode, setDarkMode] = useState(false);

  // create a folder to save notes as soon as app launches
  const createNotesFolder = async () => {
    try {
      // const folderPath = (await documentDir()) + "quicknotes";
      const folderPath = (await documentDir()) + saveNotesFolderName;

      const folderExists = await exists(folderPath);

      console.log("notesfolder folderpath", folderPath, folderExists);

      if (folderExists) {
        return;
      }

      // const createFolder = await createDir(folderPath);
      const createFolder = await createDir("quicknotes", {
        dir: BaseDirectory.Document,
        recursive: true,
        sync: false,
      });

      console.log("folder created");
    } catch (err) {
      console.log(err);
      return;
    }
  };

  createNotesFolder();

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
      // defaultPath: (await documentDir()) + "/",
      // defaultly open quicknotes folder in document directory
      defaultPath: (await documentDir()) + saveNotesFolderName,
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
      // location: `${savePath}.md`,
    };

    // save note in db
    await saveNoteInDB(newNote);

    // saving new note to notes state
    updateNotes([...notes, { ...newNote }]);
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

  const handleRenderMarkdown = () => {
    if (activeNoteContent) {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function (code) {
          return hljs.highlightAuto(code).value;
        },
      });

      const renderMarkdown = marked(activeNoteContent, { sanitize: true });
      // Update the component's state with the rendered markdown/HTML
      setRenderedMarkdown(renderMarkdown);
      // toggling textarea and markdown rendering area
      setIsRenderingMarkdown(!isRenderingMarkdown);
    }
  };

  // toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`container flex flex flex-row h-screen ${
        darkMode ? "dark" : "light"
      }`}
    >
      <div className="container_left w-1/4 border-2 border-slate-200 rounded dark:border-gray-600">
        <div className="container_left__header m-2">
          <div className="container_left__header flex flex-row items-center justify-between">
            <div
              className="flex flex-row hover:cursor-pointer"
              onClick={handleRenderMarkdown}
            >
              {isRenderingMarkdown ? (
                <Edit
                  size={28}
                  color={`${darkMode ? "white" : "black"}`}
                  className="m-2.5"
                />
              ) : (
                <FileText
                  size={28}
                  color={`${darkMode ? "white" : "black"}`}
                  className="m-2.5"
                />
              )}
            </div>
            <div className="hover:cursor-pointer" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun size={28} color={`${darkMode ? "white" : "black"}`} />
              ) : (
                <Moon size={28} color={`${darkMode ? "white" : "black"}`} />
              )}
            </div>
            <div
              className="container_left_header_action hover:cursor-pointer"
              onClick={addNote}
            >
              <FilePlus size={28} color="#687EFF" />
            </div>
          </div>
        </div>
        <div className="container_left_content">
          {notes.map((note, index) => (
            <div
              key={`${note.title}_${index}`}
              className={`flex flex-row justify-between items-center border-t-2 border-slate-200 p-4 hover:cursor-pointer hover:bg-indigo-100 dark:border-gray-600 dark:hover:bg-cyan-700 ${
                // if note is active give some styling
                activeNote.id === note.id
                  ? "bg-indigo-200 m-2 rounded dark:bg-cyan-800"
                  : ""
              }`}
              onClick={() => setActiveNoteData(note)}
            >
              <div className="container_left_content_row_left">
                <p className="container_left_content_row_left_title text-xl">
                  {note.title || "Untitled"}
                </p>
                <p className="container_left_content_row_left_date text-sm text-gray-500 dark:text-gray-400">
                  {note.createdAt}
                </p>
              </div>

              <div
                className="container_left_content_row_action"
                onClick={() => deleteNote(note)}
              >
                <Trash2 size={28} color="#D80031" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container_right flex flex-col w-3/4">
        <p className="container_right_date text-sm text-gray-500 text-center mt-2 mb-2 dark:text-gray-400">
          {activeNote?.createdAt}
        </p>

        {/* isRenderingMarkdown if textarea or markdown area is displayed */}
        {isRenderingMarkdown ? (
          <div
            className="markdown-preview prose prose-stone prose-lg m-5 dark:prose-invert"
            // change this for scroll view
            style={{ maxHeight: "100vh", overflowY: "auto" }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: renderedMarkdown,
              }}
            ></div>
          </div>
        ) : (
          <textarea
            name="note_input"
            placeholder="Write Your Note Here"
            onChange={handleChange}
            value={activeNote ? activeNoteContent : ""}
            className="h-screen m-4 mr-8 p-3 rounded bg-stone-100 dark:bg-stone-700"
            style={{ fontFamily: "Roboto Mono" }}
            disabled={activeNote ? false : true}
          ></textarea>
        )}
      </div>
    </div>
  );
}

export default App;
