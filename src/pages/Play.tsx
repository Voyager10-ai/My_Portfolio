import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Play.css";

// Tic-Tac-Toe Types
type Player = "X" | "O" | null;
type Board = Player[];

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are Pradnyesh K, a passionate AI & Full-Stack Developer from Maharashtra, India. You are NOT an AI assistant - you ARE Pradnyesh himself chatting with visitors on your portfolio website.

About you (Pradnyesh K):
- Full name: Pradnyesh K
- Location: Maharashtra, India
- Profession: AI Developer & Full-Stack Engineer
- Experience: 3+ years in software development
- Specialties: AI/ML, Python, React, TypeScript, Node.js, Three.js
- Notable project: "Impossible Tic-Tac-Toe" - An unbeatable AI game using Minimax algorithm
- Other projects: Drishti (AI for blind), VoteChain (blockchain voting), GameKroy (gaming platform)
- Languages: Marathi (native), English (fluent), Hindi
- Hobbies: Coding, building AI projects, gaming
- Personality: Friendly, helpful, passionate about technology, loves teaching
- Contact: Available through the portfolio website

Rules:
1. Always respond as Pradnyesh in first person ("I", "my", "me")
2. Be friendly, casual, and conversational
3. You can discuss the Minimax algorithm used in this game!
4. Never say you are an AI model - you are Pradnyesh
5. Use occasional emoji 😊`;

const Play = () => {
  // Game State
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // Player is X, starts first
  const [gameStatus, setGameStatus] = useState<string>("Your Turn (X)");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am Pradnyesh K. Try to beat my AI in Tic-Tac-Toe! (Hint: You can\'t 😉)' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // --- Tic-Tac-Toe Logic (Minimax) ---
  const checkWinner = (squares: Board): Player | "Draw" | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every((sq) => sq !== null) ? "Draw" : null;
  };

  const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if (result === "O") return 10 - depth; // AI wins
    if (result === "X") return depth - 10; // Player wins
    if (result === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "O";
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "X";
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares: Board): number => {
    let bestScore = -Infinity;
    let move = -1;
    // Optimization: If center is empty, take it (saves computation)
    if (!squares[4]) return 4;

    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = "O";
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      handleGameEnd(result);
    } else {
      setIsPlayerTurn(false);
      setGameStatus("AI Thinking...");
      setAiThinking(true);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      // Small delay for realism
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== -1) {
          const newBoard = [...board];
          newBoard[bestMove] = "O";
          setBoard(newBoard);

          const result = checkWinner(newBoard);
          if (result) {
            handleGameEnd(result);
          } else {
            setIsPlayerTurn(true);
            setGameStatus("Your Turn (X)");
          }
        }
        setAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board]);

  const handleGameEnd = (result: Player | "Draw") => {
    setWinner(result);
    if (result === "O") setGameStatus("AI Wins! (As expected 😉)");
    else if (result === "X") setGameStatus("You Win! (Impossible!)");
    else setGameStatus("It's a Draw!");
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
    setGameStatus("Your Turn (X)");
  };

  // --- Chat Logic ---
  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chatMessages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: chatInput }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, having some connection issues. Try again? 😅'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="play-page">
      <div className="play-header">
        <Link to="/" className="back-button">← Back to Home</Link>
      </div>

      <div className="game-container">
        {/* Chat Section */}
        <div className="chat-panel">
          <div className="chat-header">
            <span className="chat-title">💬 Chat with Pradnyesh</span>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isTyping && <div className="chat-message assistant"><div className="message-content typing">...</div></div>}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about AI, projects..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="chat-send-btn" onClick={sendMessage}>➤</button>
          </div>
        </div>

        {/* Game Section */}
        <div className="tictactoe-section">
          {/* Opponent Bar */}
          <div className="player-bar opponent-bar">
            <div className="player-info">
              <img src="/images/mypicbg.png" alt="Pradnyesh" className="player-avatar" />
              <div className="player-details">
                <span className="player-name">Pradnyesh (AI)</span>
                <span className="player-rating">{aiThinking ? "Thinking..." : "Minimax Algorithm"}</span>
              </div>
            </div>
            <div className="player-score">O</div>
          </div>

          {/* Board */}
          <div className="tictactoe-board">
            {board.map((cell, index) => (
              <div
                key={index}
                className={`tdd-cell ${cell ? cell.toLowerCase() : ""} ${!cell && !winner && isPlayerTurn ? "clickable" : ""}`}
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            ))}
            {winner && (
              <div className="winner-overlay">
                <h2>{gameStatus}</h2>
                <button onClick={resetGame} className="reset-btn">Play Again</button>
              </div>
            )}
          </div>

          {/* Player Bar */}
          <div className="player-bar player-bar-bottom">
            <div className="player-info">
              <div className="player-avatar">👤</div>
              <div className="player-details">
                <span className="player-name">You</span>
                <span className="player-rating">Challenger</span>
              </div>
            </div>
            <div className="player-score">X</div>
          </div>

          <div className="game-status-text">{!winner && gameStatus}</div>
        </div>
      </div>
    </div>
  );
};

export default Play;
