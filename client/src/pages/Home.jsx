import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './Home.css';

export default function Home() {
  const [mjList, setMjList] = useState([]);
  const [players, setPlayers] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [combats, setCombats] = useState([]);
  const [newMjName, setNewMjName] = useState('');
  const [selectedMj, setSelectedMj] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const load = async () => {
    const [mj, pl, ch, co] = await Promise.all([
      api.getMj(),
      api.getPlayers(selectedMj?.id),
      api.getCharacters(selectedPlayer?.id),
      api.getCombats(selectedMj?.id),
    ]);
    setMjList(mj);
    setPlayers(pl);
    setCharacters(ch);
    setCombats(co);
  };

  useEffect(() => {
    load();
  }, [selectedMj?.id, selectedPlayer?.id]);

  const handleCreateMj = async (e) => {
    e.preventDefault();
    if (!newMjName.trim()) return;
    await api.createMj(newMjName.trim());
    setNewMjName('');
    load();
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!selectedMj || !newPlayerName.trim()) return;
    await api.createPlayer(selectedMj.id, newPlayerName.trim());
    setNewPlayerName('');
    load();
  };

  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    if (!selectedPlayer || !newCharacterName.trim()) return;
    await api.createCharacter(selectedPlayer.id, newCharacterName.trim());
    setNewCharacterName('');
    load();
  };

  const handleNewCombat = async () => {
    if (!selectedMj) return;
    const combat = await api.createCombat(selectedMj.id);
    window.location.href = `/combat/${combat.id}`;
  };

  return (
    <div className="home">
      <h1>Wound – Gestion des blessures</h1>
      <p className="home-intro">
        Créez un compte MJ, des joueurs et des personnages. Lancez un combat pour suivre les blessures et états du corps.
      </p>

      <section className="home-section card">
        <h2>Compte MJ</h2>
        <form onSubmit={handleCreateMj} className="home-form">
          <input
            type="text"
            placeholder="Nom du MJ"
            value={newMjName}
            onChange={(e) => setNewMjName(e.target.value)}
          />
          <button type="submit">Créer</button>
        </form>
        <div className="home-list">
          {mjList.map((mj) => (
            <button
              key={mj.id}
              type="button"
              className={`chip ${selectedMj?.id === mj.id ? 'active' : ''}`}
              onClick={() => setSelectedMj(mj)}
            >
              {mj.name}
            </button>
          ))}
        </div>
      </section>

      {selectedMj && (
        <>
          <section className="home-section card">
            <h2>Joueurs</h2>
            <form onSubmit={handleCreatePlayer} className="home-form">
              <input
                type="text"
                placeholder="Nom du joueur"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
              <button type="submit">Ajouter</button>
            </form>
            <ul className="home-list-ul">
              {players.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={selectedPlayer?.id === p.id ? 'active' : ''}
                    onClick={() => setSelectedPlayer(p)}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="home-section card">
            <h2>Personnages</h2>
            {selectedPlayer ? (
              <>
                <form onSubmit={handleCreateCharacter} className="home-form">
                  <input
                    type="text"
                    placeholder="Nom du personnage"
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                  />
                  <button type="submit">Créer</button>
                </form>
                <ul className="home-list-ul">
                  {characters.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted">Sélectionnez un joueur pour gérer ses personnages.</p>
            )}
          </section>

          <section className="home-section card">
            <h2>Combats</h2>
            <button type="button" className="btn-primary" onClick={handleNewCombat}>
              Nouveau combat
            </button>
            <ul className="combat-list">
              {combats.map((c) => (
                <li key={c.id}>
                  <Link to={`/combat/${c.id}`}>
                    Combat #{c.id} {c.name ? `– ${c.name}` : ''}
                  </Link>
                  {c.saved_at && <span className="badge">Sauvegardé</span>}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {!selectedMj && mjList.length > 0 && (
        <p className="text-muted">Sélectionnez un compte MJ pour gérer joueurs, personnages et combats.</p>
      )}
    </div>
  );
}
