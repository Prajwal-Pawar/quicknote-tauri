const getNotesFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("quicknotes") || "");
};

const setNotesInLocalStorage = (newNote) => {
  localStorage.setItem("quicknotes", newNote);
};

export { getNotesFromLocalStorage, setNotesInLocalStorage };
