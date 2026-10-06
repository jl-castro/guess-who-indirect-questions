'use client';

import { useState } from 'react';

type Character = { name: string; initials: string; color: string };
const characters: Character[] = [
  ['Taylor Swift', 'TS', '#d96e8d'], ['Lionel Messi', 'LM', '#48a8b8'], ['Cristiano Ronaldo', 'CR', '#5e73d0'],
  ['Shakira', 'S', '#e09b47'], ['Mr. Bean', 'MB', '#8e69bb'], ['Spider-Man', 'SM', '#c7505d'],
  ['Harry Potter', 'HP', '#6c86a9'], ['Tom Holland', 'TH', '#d36b55'], ['Michael Jackson', 'MJ', '#7f72b4'],
  ['Dwayne Johnson', 'DJ', '#4e9d80'], ['Pikachu', 'P', '#e8b83d'], ['Albert Einstein', 'AE', '#9b7d62'],
].map(([name, initials, color]) => ({ name, initials, color }));

export default function Game() {
  const [secret, setSecret] = useState<Character | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [questions, setQuestions] = useState(0);
  const [mode, setMode] = useState<'play' | 'guess' | 'confirm' | 'result' | 'reveal'>('play');
  const [selectedGuess, setSelectedGuess] = useState<Character | null>(null);
  const [message, setMessage] = useState('');

  const notify = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(''), 2200); };
  const reset = () => { setSecret(null); setEliminated([]); setQuestions(0); setMode('play'); setSelectedGuess(null); setMessage(''); };
  const choose = (character: Character) => {
    if (!secret) { setSecret(character); notify('Secret character locked.'); return; }
    if (mode === 'guess') { if (!eliminated.includes(character.name)) { setSelectedGuess(character); setMode('confirm'); } return; }
    if (mode !== 'play') return;
    setEliminated((current) => current.includes(character.name) ? current.filter((name) => name !== character.name) : [...current, character.name]);
  };
  const confirmGuess = () => {
    if (!selectedGuess) return;
    setMode(selectedGuess.name === secret?.name ? 'result' : 'play');
    notify(selectedGuess.name === secret?.name ? 'Correct! You found the character! 🎉' : 'Not this time! Keep asking questions.');
    setSelectedGuess(null);
  };
  const validQuestion = () => { if (secret && questions < 5) { const next = questions + 1; setQuestions(next); notify(next === 5 ? 'Five questions used. Make your final guess.' : 'Question counted. Nice work!'); } };
  const reveal = () => { if (secret) setMode('reveal'); };

  return <main className="app">
    <header><div><p className="eyebrow">Classroom game · Teacher controlled</p><h1>Guess Who?</h1><p className="subtitle">Indirect Questions</p></div><div className="counter"><small>Questions used</small><strong>{questions} / 5</strong></div></header>
    <div className="layout"><section className="boardwrap"><div className="bar"><div className={`status ${secret ? 'ready' : ''}`}>{secret ? 'Secret Character Selected ✓' : 'Choose a secret character to start'}</div><b>{characters.length - eliminated.length} options left</b></div><div className="board">{characters.map((character) => <button className={`card ${eliminated.includes(character.name) ? 'out' : ''}`} key={character.name} onClick={() => choose(character)} aria-label={character.name}><div className="portrait" style={{ '--c': character.color } as React.CSSProperties}><span className="avatar">{character.initials}</span></div><span className="name">{character.name}</span></button>)}</div></section>
      <aside className="side"><section className="panel"><h2>Game rules</h2><ul className="rules"><li>5 questions</li><li>5 different students</li><li>Indirect questions only</li><li>Guess after Question 3</li></ul></section><section className="panel"><h2>Need help?</h2><div className="starters">{['Do you know if...?', 'Do you know whether...?', 'Can you tell me...?', 'Could you tell me...?', 'Could you tell me where...?', 'Can you tell me what...?'].map((starter) => <span className="starter" key={starter}>{starter}</span>)}</div></section><section className="panel"><h2>Teacher controls</h2><div className="controls"><button className="btn primary" disabled={!secret || questions >= 5} onClick={validQuestion}>Valid Question</button><button className="btn danger" onClick={() => notify('Try again using an indirect question.')}>Reformulate</button><button className="btn guess" disabled={!secret || questions < 3} onClick={() => setMode('guess')}>Make a Guess</button><button className="btn secondary" disabled={!secret} onClick={reveal}>Reveal Character</button><button className="btn reset" onClick={reset}>New Game</button></div><p className="note">Click a character after answering to eliminate it. Click again to restore it.</p></section></aside>
    </div>
    {message && <div className="toast show">{message}</div>}
    {(mode === 'confirm' || mode === 'reveal' || mode === 'result') && <div className="overlay"><div className="modal">{mode === 'confirm' && <><h2>Is this your final answer?</h2><p>You chose <b>{selectedGuess?.name}</b>.</p><div className="actions"><button className="btn primary" onClick={confirmGuess}>Confirm</button><button className="btn secondary" onClick={() => setMode('guess')}>Cancel</button></div></>}{mode === 'result' && <><h2>Correct! You found the character! 🎉</h2><p>Great indirect-question teamwork.</p><button className="btn primary" onClick={() => setMode('play')}>Close</button></>}{mode === 'reveal' && secret && <><h2>The secret character was...</h2><div className="portrait revealPortrait" style={{ '--c': secret.color } as React.CSSProperties}><span className="avatar">{secret.initials}</span></div><h2 className="answer">{secret.name}</h2><button className="btn primary" onClick={() => setMode('play')}>Close</button></>}</div></div>}
  </main>;
}
