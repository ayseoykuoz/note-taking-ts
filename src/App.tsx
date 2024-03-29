/* eslint-disable @typescript-eslint/no-unused-vars */
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { NewNote } from "./pages/NewNote";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMemo } from "react";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "./pages/NoteList";
import { NoteLayout } from "./pages/NoteLayout";
import { Note } from "./pages/Notes";
import { EditNote } from "./pages/EditNote";

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};

export type Note = {
  id: string;
} & NoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type RawNote = {
  id: string;
} & RawNoteData;

export type Tag = {
  id: string;
  label: string;
};

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

  const notesWithTags = useMemo(() => {
    return notes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      };
    });
  }, [notes, tags]);

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
      ];
    });
  }

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return { ...note, ...data, tagIds: tags.map((tag) => tag.id) };
        } else {
          return note;
        }
      });
    });
  }

  function onDeleteNode(id: string) {
    setNotes((prevNotes) => {
      return prevNotes.filter((note) => note.id !== id);
    });
  }

  function addTag(tag: Tag) {
    setTags((prev) => [...prev, tag]);
  }

  function updateTag(id: string, label: string) {
    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === id) {
          return { ...tag, label };
        } else {
          return tag;
        }
      });
    });
  }
  function deleteTag(id: string) {
    setTags((prevTags) => {
      return prevTags.filter((tag) => tag.id != id);
    });
  }

  return (
    <Router>
      <Container className="my-4">
        <Routes>
          <Route
            path="/"
            element={
              <NoteList
                availableTags={tags}
                notes={notesWithTags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
            }
          />
          <Route
            path="/new"
            element={
              <NewNote
                onSubmit={onCreateNote}
                availableTags={tags}
                onAddTag={addTag}
              />
            }
          />
          <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
            <Route index element={<Note onDelete={onDeleteNode} />} />
            <Route
              path="edit"
              element={
                <EditNote
                  onSubmit={onUpdateNote}
                  availableTags={tags}
                  onAddTag={addTag}
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
