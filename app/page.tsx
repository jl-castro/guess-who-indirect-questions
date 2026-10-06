'use client';

import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type Character = { name: string; initials: string; color: string; image: string };
type Mode = 'play' | 'guess' | 'confirm' | 'result' | 'reveal';
type Call = { text: string; tone: 'play' | 'good' | 'miss' };

const characters: Character[] = [
  { name: 'Taylor Swift', initials: 'TS', color: '#c45a78', image: 'taylor-swift.jpg' },
  { name: 'Lionel Messi', initials: 'LM', color: '#2f8a96', image: 'lionel-messi.jpg' },
  { name: 'Cristiano Ronaldo', initials: 'CR', color: '#3f5cb0', image: 'cristiano-ronaldo.jpg' },
  { name: 'Shakira', initials: 'S', color: '#c9842e', image: 'shakira.jpg' },
  { name: 'Mr. Bean', initials: 'MB', color: '#6d4ea3', image: 'mr-bean.jpg' },
  { name: 'Spider-Man', initials: 'SM', color: '#b43b48', image: 'spider-man.jpg' },
  { name: 'Harry Potter', initials: 'HP', color: '#4d6a88', image: 'harry-potter.jpg' },
  { name: 'Homer Simpson', initials: 'HS', color: '#f2b544', image: 'homer-simpson.jpg' },
  { name: 'Michael Jackson', initials: 'MJ', color: '#5d5696', image: 'michael-jackson.jpg' },
  { name: 'Dwayne Johnson', initials: 'DJ', color: '#2f7a62', image: 'dwayne-johnson.jpg' },
  { name: 'Pikachu', initials: 'P', color: '#d4a21b', image: 'pikachu.jpg' },
  { name: 'Albert Einstein', initials: 'AE', color: '#8a6848', image: 'albert-einstein.jpg' },
];

const portraitSrc = (file: string) => `/images/characters/${encodeURIComponent(file)}`;

const starters = [
  'Do you know if...?',
  'Do you know whether...?',
  'Can you tell me if...?',
  'Can you tell me whether...?',
  'Could you tell me if...?',
  'Could you tell me whether...?',
];

const flash = (kind: 'good' | 'miss' | 'info', title: string, text = '') => {
  void Swal.fire({
    title,
    text,
    icon: kind === 'good' ? 'success' : kind === 'miss' ? 'error' : 'info',
    confirmButtonText: 'OK',
    buttonsStyling: false,
    customClass: {
      popup: 'swal-toy',
      title: 'swal-toy-title',
      htmlContainer: 'swal-toy-text',
      confirmButton: kind === 'miss' ? 'btn warn' : 'btn primary',
    },
  });
};

export default function Game() {
  const [secret, setSecret] = useState<Character | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [questions, setQuestions] = useState(0);
  const [mode, setMode] = useState<Mode>('play');
  const [selectedGuess, setSelectedGuess] = useState<Character | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [usedStarters, setUsedStarters] = useState<string[]>([]);
  const callTimer = useRef(0);

  const notify = (text: string, tone: Call['tone'] = 'play') => {
    window.clearTimeout(callTimer.current);
    setCall({ text, tone });
    callTimer.current = window.setTimeout(() => setCall(null), 4000);
  };

  const reset = () => {
    window.clearTimeout(callTimer.current);
    Swal.close();
    setSecret(null);
    setEliminated([]);
    setQuestions(0);
    setMode('play');
    setSelectedGuess(null);
    setCall(null);
    setUsedStarters([]);
  };

  const choose = (character: Character) => {
    if (!secret) {
      setSecret(character);
      notify('Secret locked. Keep it quiet.');
      return;
    }
    if (mode === 'guess') {
      if (!eliminated.includes(character.name)) {
        setSelectedGuess(character);
        setMode('confirm');
      }
      return;
    }
    if (mode !== 'play') return;
    setEliminated((current) =>
      current.includes(character.name)
        ? current.filter((name) => name !== character.name)
        : [...current, character.name]
    );
  };

  const confirmGuess = () => {
    if (!selectedGuess) return;
    if (selectedGuess.name === secret?.name) {
      setMode('result');
      flash('good', 'You found them.', selectedGuess.name);
      return;
    }
    setMode('play');
    flash('miss', 'Not this face.', 'Keep asking.');
    setSelectedGuess(null);
  };

  const validQuestion = () => {
    if (!secret || questions >= 5) return;
    const next = questions + 1;
    setQuestions(next);
    if (next === 5) {
      flash('info', 'Five questions.', 'Time to guess.');
    } else {
      flash('good', 'Question counted.');
    }
  };

  const isDown = (name: string) => {
    if (mode === 'result' && selectedGuess) return name !== selectedGuess.name;
    if (mode === 'reveal' && secret) return name !== secret.name;
    return eliminated.includes(name);
  };

  const standing = characters.filter((character) => !isDown(character.name)).length;
  const boardLocked = mode === 'confirm' || mode === 'result' || mode === 'reveal';
  const visibleStarters = starters.filter((starter) => !usedStarters.includes(starter));

  return (
    <main className="desk">
      <div className="toy">
        <header className="lid">
          <div className="brand">
            <p className="kicker">Indirect questions</p>
            <h1>Guess Who?</h1>
          </div>
          <div className="meter" aria-label={`${questions} of 5 questions used`}>
            <span className="meter-label">Questions</span>
            <ol className="pips">
              {Array.from({ length: 5 }, (_, index) => (
                <li key={index} className={index < questions ? 'on' : ''} />
              ))}
            </ol>
          </div>
        </header>

        <section className="well" aria-label="Character board">
          <div className="well-bar">
            {call ? (
              <p className={`call ${call.tone}`} role="status">{call.text}</p>
            ) : (
              <>
                <p className={`lock ${secret ? 'ready' : ''}`}>
                  {secret ? 'Secret locked' : 'Pick the secret face'}
                </p>
                <p className="standing">
                  <b>{standing}</b> standing
                </p>
              </>
            )}
          </div>

          <div className="board-wrap">
          <div className="board">
            {characters.map((character) => {
              const down = isDown(character.name);
              const picked = selectedGuess?.name === character.name && (mode === 'confirm' || mode === 'result');
              const revealed = mode === 'reveal' && secret?.name === character.name;
              const won = mode === 'result' && selectedGuess?.name === character.name;
              return (
                <button
                  type="button"
                  className={`tile${down ? ' down' : ''}${picked ? ' picked' : ''}${revealed || won ? ' found' : ''}${mode === 'guess' && !down ? ' pickable' : ''}`}
                  key={character.name}
                  onClick={() => choose(character)}
                  disabled={boardLocked}
                  aria-label={character.name}
                  aria-pressed={down}
                >
                  <span className="window">
                    <span className="flip">
                      <span className="front" style={{ '--c': character.color } as React.CSSProperties}>
                        <img
                          className="face"
                          src={portraitSrc(character.image)}
                          alt=""
                          draggable={false}
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                        />
                      </span>
                      <span className="back" aria-hidden="true">
                        <span className="avatar">{character.initials}</span>
                      </span>
                    </span>
                  </span>
                  <span className="plate">{character.name}</span>
                </button>
              );
            })}
          </div>
          </div>
        </section>

        <aside className="drawer">
          {mode === 'play' && (
            <>
              <div className="prompts">
                <div className="prompts-head">
                  <p>Prompts</p>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={usedStarters.length === 0}
                    onClick={() => setUsedStarters([])}
                    aria-label="Reset prompts"
                  >
                    <RotateCcw size={18} strokeWidth={2.4} />
                  </button>
                </div>
                <div className="starters" aria-label="Indirect question starters">
                  {visibleStarters.map((starter) => (
                    <button
                      type="button"
                      className="starter"
                      key={starter}
                      onClick={() => setUsedStarters((current) => [...current, starter])}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
                {visibleStarters.length === 0 && (
                  <p className="hint">None left.</p>
                )}
              </div>
              <div className="controls">
                <button type="button" className="btn primary" disabled={!secret || questions >= 5} onClick={validQuestion}>
                  Valid question
                </button>
                <button type="button" className="btn warn" disabled={!secret} onClick={() => flash('miss', 'Try an indirect question.')}>
                  Reformulate
                </button>
                <button
                  type="button"
                  className={`btn ${questions >= 5 ? 'primary' : 'guess'}`}
                  disabled={!secret || questions < 3}
                  onClick={() => setMode('guess')}
                >
                  Guess
                </button>
                <button type="button" className="btn ghost" disabled={!secret} onClick={() => setMode('reveal')}>
                  Reveal
                </button>
                <button type="button" className="btn quiet" onClick={reset}>
                  New game
                </button>
              </div>
            </>
          )}

          {mode === 'guess' && (
            <div className="prompt">
              <h2>Pick a face</h2>
              <p>Tap the person you think it is.</p>
              <button type="button" className="btn ghost" onClick={() => setMode('play')}>
                Not yet
              </button>
            </div>
          )}

          {mode === 'confirm' && selectedGuess && (
            <div className="prompt">
              <h2>Guess {selectedGuess.name}?</h2>
              <p>This is your answer.</p>
              <div className="pair">
                <button type="button" className="btn primary" onClick={confirmGuess}>
                  Yes, guess
                </button>
                <button type="button" className="btn ghost" onClick={() => { setSelectedGuess(null); setMode('guess'); }}>
                  Pick another
                </button>
              </div>
            </div>
          )}

          {mode === 'result' && selectedGuess && (
            <div className="prompt">
              <h2>You found {selectedGuess.name}.</h2>
              <p>Nice indirect-question work.</p>
              <button type="button" className="btn primary" onClick={reset}>
                New game
              </button>
            </div>
          )}

          {mode === 'reveal' && secret && (
            <div className="prompt">
              <h2>It was {secret.name}.</h2>
              <p>The other faces are down so the class can see.</p>
              <button type="button" className="btn primary" onClick={() => setMode('play')}>
                Back to the board
              </button>
            </div>
          )}
        </aside>
      </div>

    </main>
  );
}
