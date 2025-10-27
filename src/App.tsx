import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, signInWithGoogle, signOutUser } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import './App.css';

interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface PromptNote {
  id: string;
  title: string;
  prompts: Prompt[];
  createdAt: Date;
  updatedAt: Date;
}

function App() {
  const [promptNotes, setPromptNotes] = useState<PromptNote[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentNote, setCurrentNote] = useState<PromptNote | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load notes based on authentication state
    const storageKey = user ? `ai-prompt-notes-${user.uid}` : 'ai-prompt-notes';
    const savedNotes = localStorage.getItem(storageKey);

    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          prompts: note.prompts.map((prompt: any) => ({
            ...prompt,
            createdAt: new Date(prompt.createdAt)
          }))
        }));
        setPromptNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading saved notes:', error);
      }
    } else {
      // Clear notes when switching between authenticated/unauthenticated states
      setPromptNotes([]);
    }
  }, [user]);

  const saveToStorage = (notes: PromptNote[]) => {
    const storageKey = user ? `ai-prompt-notes-${user.uid}` : 'ai-prompt-notes';
    localStorage.setItem(storageKey, JSON.stringify(notes));
  };

  const createNewNote = () => {
    const newNote: PromptNote = {
      id: Date.now().toString(),
      title: '',
      prompts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentNote(newNote);
  };

  const saveNote = (note: PromptNote) => {
    const updatedNotes = [...promptNotes];
    const existingIndex = updatedNotes.findIndex(n => n.id === note.id);

    if (existingIndex >= 0) {
      updatedNotes[existingIndex] = { ...note, updatedAt: new Date() };
    } else {
      updatedNotes.push(note);
    }

    setPromptNotes(updatedNotes);
    saveToStorage(updatedNotes);
    setCurrentNote(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="app">
      <motion.div
        className="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <header className="header">
          <h1 className="title">AI Prompts Manager</h1>
          <div className="header-actions">
            {authLoading ? (
              <div className="auth-loading">Loading...</div>
            ) : user ? (
              <div className="user-info">
                <span className="user-name">Hi, {user.displayName || user.email}</span>
                <button className="auth-button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button className="auth-button" onClick={handleGoogleSignIn}>
                Sign In with Google
              </button>
            )}
            <button className="new-note-button" onClick={createNewNote}>
              New Note
            </button>
          </div>
        </header>

        <main className="main-content">
          {!currentNote ? (
            <div className="notes-grid">
              {promptNotes.length === 0 ? (
                <div className="empty-state">
                  <h2>No prompts yet</h2>
                  <p>Create your first AI prompt note to get started</p>
                  <button className="cta-button" onClick={createNewNote}>
                    Create First Note
                  </button>
                </div>
              ) : (
                promptNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    className="note-card"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setCurrentNote(note)}
                  >
                    <h3>{note.title || 'Untitled'}</h3>
                    <p>{note.prompts.length} prompt{note.prompts.length !== 1 ? 's' : ''}</p>
                    <span className="date">
                      {note.updatedAt.toLocaleDateString()}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <PromptEditor
              note={currentNote}
              onSave={saveNote}
              onCancel={() => setCurrentNote(null)}
              onCopy={copyToClipboard}
            />
          )}
        </main>
      </motion.div>

      <footer className="footer">
        <div className="copyright-strip">
          <div className="lighting-animation"></div>
          <span className="copyright-text">
            © 2025 AI Prompts Manager. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

interface PromptEditorProps {
  note: PromptNote;
  onSave: (note: PromptNote) => void;
  onCancel: () => void;
  onCopy: (text: string) => void;
}

function PromptEditor({ note, onSave, onCancel, onCopy }: PromptEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [prompts, setPrompts] = useState<Prompt[]>(note.prompts);

  const addPrompt = () => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date()
    };
    setPrompts([...prompts, newPrompt]);
  };

  const updatePrompt = (id: string, field: keyof Prompt, value: string) => {
    setPrompts(prompts.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  const handleSave = () => {
    const updatedNote: PromptNote = {
      ...note,
      title,
      prompts,
      updatedAt: new Date()
    };
    onSave(updatedNote);
  };

  return (
    <motion.div
      className="prompt-editor"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="editor-header">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <div className="editor-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      <div className="prompts-list">
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt.id}
            className="prompt-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="prompt-header">
              <input
                type="text"
                placeholder="Prompt Title"
                value={prompt.title}
                onChange={(e) => updatePrompt(prompt.id, 'title', e.target.value)}
                className="prompt-title-input"
              />
              <div className="prompt-actions">
                <button
                  className="copy-button"
                  onClick={() => onCopy(prompt.content)}
                  title="Copy to clipboard"
                >
                  📋
                </button>
                <button
                  className="delete-button"
                  onClick={() => removePrompt(prompt.id)}
                  title="Delete prompt"
                >
                  🗑️
                </button>
              </div>
            </div>
            <textarea
              placeholder="Enter your AI prompt here..."
              value={prompt.content}
              onChange={(e) => updatePrompt(prompt.id, 'content', e.target.value)}
              className="prompt-content"
              rows={4}
            />
          </motion.div>
        ))}
      </div>

      <button className="add-prompt-button" onClick={addPrompt}>
        + Add Prompt
      </button>
    </motion.div>
  );
}

export default App;
