import React, { useState, useEffect } from 'react';
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
      {/* Logo in top-left corner */}
      <h1 className="title">aiprompts.my</h1>

      <div className="dashboard">
        {/* Small corner login button */}
        <div className="login-corner">
          {authLoading ? (
            <div className="auth-loading" style={{ fontSize: '0.8rem' }}>Loading...</div>
          ) : user ? (
            <div className="user-info" style={{ gap: '0.5rem' }}>
              <span className="user-name" style={{ fontSize: '0.7rem' }}>
                Hi, {user.displayName?.split(' ')[0] || user.email}
              </span>
              <button className="login-button-small" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="login-button-small" onClick={handleGoogleSignIn}>
              Sign In
            </button>
          )}
        </div>

        {/* Data warning for non-logged in users */}
        {!user && !authLoading && (
          <div className="data-warning">
            ⚠️ Sign in to save your data permanently
          </div>
        )}

        <div className="sidebar">
          <button className="new-note-button" onClick={createNewNote} style={{ marginBottom: '1rem', width: '100%' }}>
            + New Note
          </button>

          <div className="sidebar-list">
            {promptNotes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No prompts yet
              </div>
            ) : (
              promptNotes.map((note) => (
                <div
                  key={note.id}
                  className={`sidebar-item ${currentNote?.id === note.id ? 'active' : ''}`}
                  onClick={() => setCurrentNote(note)}
                >
                  <h4>{note.title || 'Untitled'}</h4>
                  <p>{note.prompts.length} prompt{note.prompts.length !== 1 ? 's' : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="main-content">
          {currentNote ? (
            <PromptEditor
              note={currentNote}
              onSave={saveNote}
              onCancel={() => setCurrentNote(null)}
              onCopy={copyToClipboard}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              <div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Select a note from the sidebar</h2>
                <p>Choose a prompt collection to view and edit its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="trust-section">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Secure & Private</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span className="trust-text">Fast & Reliable</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🆓</span>
              <span className="trust-text">Free to Use</span>
            </div>
          </div>

          <div className="contact-section">
            <div className="contact-item">
              <span className="contact-label">Support:</span>
              <a href="mailto:support@aiprompts.my" className="contact-link">
                support@aiprompts.my
              </a>
            </div>
            <div className="contact-item">
              <span className="contact-label">Contact:</span>
              <a href="mailto:hello@aiprompts.my" className="contact-link">
                hello@aiprompts.my
              </a>
            </div>
          </div>
        </div>

        <div className="copyright-strip">
          <div className="lighting-animation"></div>
          <span className="copyright-text">
            © 2025 aiprompts.my. All rights reserved.
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
    <div className="prompt-editor">
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
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="prompt-item"
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
          </div>
        ))}
      </div>

      <button className="add-prompt-button" onClick={addPrompt}>
        + Add Prompt
      </button>
    </div>
  );
}

export default App;
