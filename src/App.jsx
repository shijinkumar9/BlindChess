import { useState, useEffect, useRef } from "react";

// Initial chess board setup
const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceNames = {
  'K': 'White King', 'Q': 'White Queen', 'R': 'White Rook', 
  'B': 'White Bishop', 'N': 'White Knight', 'P': 'White Pawn',
  'k': 'Black King', 'q': 'Black Queen', 'r': 'Black Rook', 
  'b': 'Black Bishop', 'n': 'Black Knight', 'p': 'Black Pawn'
};

const pieceSymbols = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

export default function App() {
  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [gameStatus, setGameStatus] = useState('');
  const [pendingMove, setPendingMove] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [boardDescription, setBoardDescription] = useState('');
  const [focusedSquare, setFocusedSquare] = useState([0, 0]);
  const [isMobile, setIsMobile] = useState(false);

  const squareRefs = useRef({});

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Speech synthesis
  const speak = (text, interrupt = false) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    if (interrupt) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  // Convert position to chess notation
  const positionToNotation = (row, col) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  };

  // Describe current square
  const describeSquare = (row, col) => {
    const notation = positionToNotation(row, col);
    const piece = board[row][col];
    
    if (piece) {
      return `${notation}, ${pieceNames[piece]}`;
    } else {
      return `${notation}, empty square`;
    }
  };

  // Get all pieces positions for board description
  const describeBoardState = () => {
    const whitePieces = [];
    const blackPieces = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const position = positionToNotation(row, col);
          const pieceName = pieceNames[piece].split(' ')[1]; // Get just the piece type
          
          if (piece === piece.toUpperCase()) {
            whitePieces.push(`${pieceName} on ${position}`);
          } else {
            blackPieces.push(`${pieceName} on ${position}`);
          }
        }
      }
    }
    
    return `White pieces: ${whitePieces.join(', ')}. Black pieces: ${blackPieces.join(', ')}.`;
  };

  // Move validation (simplified)
  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    if (!piece) return false;
    
    // Can't capture your own pieces
    if (targetPiece) {
      const isPieceWhite = piece === piece.toUpperCase();
      const isTargetWhite = targetPiece === targetPiece.toUpperCase();
      if (isPieceWhite === isTargetWhite) return false;
    }

    // Basic move validation
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch (piece.toLowerCase()) {
      case 'p': // Pawn
        const direction = piece === piece.toUpperCase() ? -1 : 1;
        const startRow = piece === piece.toUpperCase() ? 6 : 1;
        
        if (fromCol === toCol) { // Moving forward
          if (toRow === fromRow + direction && !targetPiece) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) return true;
        } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) {
          return true; // Diagonal capture
        }
        return false;
      
      case 'r': // Rook
        return (rowDiff === 0 || colDiff === 0);
      
      case 'n': // Knight
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      
      case 'b': // Bishop
        return rowDiff === colDiff;
      
      case 'q': // Queen
        return (rowDiff === colDiff) || (rowDiff === 0 || colDiff === 0);
      
      case 'k': // King
        return rowDiff <= 1 && colDiff <= 1;
      
      default:
        return false;
    }
  };

  // Handle square selection
  const handleSquareSelect = (row, col) => {
    const piece = board[row][col];
    const notation = positionToNotation(row, col);
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      
      if (fromRow === row && fromCol === col) {
        // Deselect
        setSelectedSquare(null);
        speak(`Deselected ${notation}`);
        return;
      }
      
      // Try to make move
      if (isValidMove(fromRow, fromCol, row, col)) {
        const movingPiece = board[fromRow][fromCol];
        const fromNotation = positionToNotation(fromRow, fromCol);
        const capturedPiece = board[row][col];
        
        let moveDescription = `Move ${pieceNames[movingPiece]} from ${fromNotation} to ${notation}`;
        if (capturedPiece) {
          moveDescription += `, capturing ${pieceNames[capturedPiece]}`;
        }
        
        setPendingMove({
          from: [fromRow, fromCol],
          to: [row, col],
          description: moveDescription
        });
        
        speak(`${moveDescription}. Press C to confirm or Escape to cancel.`);
      } else {
        speak(`Invalid move from ${positionToNotation(fromRow, fromCol)} to ${notation}`);
      }
    } else {
      // Select piece
      if (piece) {
        const isPieceWhite = piece === piece.toUpperCase();
        const canMove = (currentPlayer === 'white' && isPieceWhite) || (currentPlayer === 'black' && !isPieceWhite);
        
        if (canMove) {
          setSelectedSquare([row, col]);
          speak(`Selected ${pieceNames[piece]} on ${notation}`);
        } else {
          speak(`Cannot move ${pieceNames[piece]} - it's ${currentPlayer}'s turn`);
        }
      } else {
        speak(`Empty square ${notation}`);
      }
    }
  };

  // Confirm move
  const confirmMove = () => {
    if (!pendingMove) return;
    
    const { from, to } = pendingMove;
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    const newBoard = board.map(row => [...row]);
    const movingPiece = newBoard[fromRow][fromCol];
    const capturedPiece = newBoard[toRow][toCol];
    
    newBoard[toRow][toCol] = movingPiece;
    newBoard[fromRow][fromCol] = null;
    
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    setSelectedSquare(null);
    setPendingMove(null);
    
    speak(`Move confirmed. ${currentPlayer === 'white' ? 'Black' : 'White'}'s turn.`);
  };

  // Cancel move
  const cancelMove = () => {
    setPendingMove(null);
    speak("Move cancelled");
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const [row, col] = focusedSquare;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) setFocusedSquare([row - 1, col]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < 7) setFocusedSquare([row + 1, col]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) setFocusedSquare([row, col - 1]);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (col < 7) setFocusedSquare([row, col + 1]);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSquareSelect(row, col);
        break;
      case 's':
      case 'S':
        e.preventDefault();
        speak(describeSquare(row, col));
        break;
      case 'b':
      case 'B':
        e.preventDefault();
        speak(describeBoardState());
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        if (pendingMove) confirmMove();
        break;
      case 'Escape':
        e.preventDefault();
        if (pendingMove) {
          cancelMove();
        } else if (selectedSquare) {
          setSelectedSquare(null);
          speak("Selection cleared");
        }
        break;
      case 't':
      case 'T':
        e.preventDefault();
        speak(`It's ${currentPlayer}'s turn`);
        break;
    }
  };

  // Focus management
  useEffect(() => {
    const [row, col] = focusedSquare;
    const key = `${row}-${col}`;
    if (squareRefs.current[key]) {
      squareRefs.current[key].focus();
    }
  }, [focusedSquare]);

  // Announce focus changes
  useEffect(() => {
    const [row, col] = focusedSquare;
    speak(describeSquare(row, col));
  }, [focusedSquare, board]);

  // Initial game announcement
  useEffect(() => {
    speak("Welcome to Accessible Chess. White's turn. Use arrow keys to navigate, Enter to select, S to describe square, B for board state, T for current turn.");
  }, []);

  // Responsive styles
  const containerStyle = {
    padding: isMobile ? '10px' : '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#a81358',
    color: '#fff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const boardContainerStyle = {
    display: 'inline-block',
    border: '3px solid #8B4513',
    backgroundColor: '#DEB887',
    maxWidth: '100vw',
    overflow: 'hidden'
  };

  const squareSize = isMobile ? 
    Math.min(40, Math.floor((window.innerWidth - 40) / 8)) : 60;

  const buttonStyle = {
    padding: isMobile ? '10px 15px' : '15px 25px',
    fontSize: isMobile ? '14px' : '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '5px',
    minWidth: isMobile ? '120px' : 'auto'
  };

  const controlsStyle = {
    textAlign: 'center',
    maxWidth: isMobile ? '100%' : '600px',
    width: '100%'
  };

  return (
    <div 
      style={containerStyle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 style={{ 
        fontSize: isMobile ? '24px' : '32px',
        textAlign: 'center',
        margin: isMobile ? '10px 0' : '20px 0'
      }}>
        Accessible Chess Game
      </h1>
      
      <div style={{ 
        marginBottom: isMobile ? '15px' : '20px',
        width: '100%',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ fontSize: isMobile ? '16px' : '18px' }}>
            Current Turn: {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}
          </strong>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: isMobile ? '14px' : '16px' }}>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Voice Announcements
          </label>
        </div>

        {pendingMove && (
          <div style={{ 
            backgroundColor: '#333', 
            padding: isMobile ? '10px' : '15px', 
            margin: '10px 0',
            borderRadius: '5px',
            border: '2px solid #FFD700'
          }}>
            <p style={{ 
              margin: '0 0 10px 0',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              <strong>Pending Move:</strong> {pendingMove.description}
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={confirmMove}
                style={{ 
                  ...buttonStyle,
                  backgroundColor: '#4CAF50'
                }}
              >
                Confirm (C)
              </button>
              <button 
                onClick={cancelMove}
                style={{ 
                  ...buttonStyle,
                  backgroundColor: '#f44336'
                }}
              >
                Cancel (Esc)
              </button>
            </div>
          </div>
        )}
      </div>

      {!isMobile && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Keyboard Controls:</h3>
          <ul style={{ textAlign: 'left', maxWidth: '600px' }}>
            <li><strong>Arrow Keys:</strong> Navigate the board</li>
            <li><strong>Enter/Space:</strong> Select piece or make move</li>
            <li><strong>S:</strong> Describe current square</li>
            <li><strong>B:</strong> Describe entire board state</li>
            <li><strong>T:</strong> Announce current turn</li>
            <li><strong>C:</strong> Confirm pending move</li>
            <li><strong>Escape:</strong> Cancel move or clear selection</li>
          </ul>
        </div>
      )}

      <div style={boardContainerStyle}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
              const isFocused = focusedSquare[0] === rowIndex && focusedSquare[1] === colIndex;
              const isPendingMove = pendingMove && 
                ((pendingMove.from[0] === rowIndex && pendingMove.from[1] === colIndex) ||
                 (pendingMove.to[0] === rowIndex && pendingMove.to[1] === colIndex));
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  ref={el => squareRefs.current[`${rowIndex}-${colIndex}`] = el}
                  style={{
                    width: `${squareSize}px`,
                    height: `${squareSize}px`,
                    backgroundColor: isPendingMove ? '#FFB6C1' : 
                                   isSelected ? '#FFD700' : 
                                   isFocused ? '#87CEEB' :
                                   (isLight ? '#F0D9B5' : '#B58863'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? `${Math.max(16, squareSize * 0.6)}px` : '32px',
                    border: isFocused ? '3px solid #0066CC' : '1px solid #8B4513',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: `${squareSize}px`,
                    minHeight: `${squareSize}px`
                  }}
                  onClick={() => handleSquareSelect(rowIndex, colIndex)}
                  onFocus={() => setFocusedSquare([rowIndex, colIndex])}
                  aria-label={describeSquare(rowIndex, colIndex)}
                >
                  {piece && pieceSymbols[piece]}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {isMobile && (
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px',
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#333',
          borderRadius: '5px',
          maxWidth: '100%'
        }}>
          <p><strong>Touch Controls:</strong> Tap squares to select/move</p>
          <p><strong>Keyboard shortcuts available when using external keyboard</strong></p>
        </div>
      )}

      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => {
            setBoard(initialBoard);
            setSelectedSquare(null);
            setCurrentPlayer('white');
            setPendingMove(null);
            speak("Game reset. White's turn.");
          }}
          style={buttonStyle}
        >
          Reset Game
        </button>
        
        <button 
          onClick={() => speak(describeBoardState())}
          style={{
            ...buttonStyle,
            backgroundColor: '#2196F3'
          }}
        >
          Describe Board
        </button>
      </div>
    </div>
  );
}