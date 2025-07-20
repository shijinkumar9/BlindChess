# ♟️ Accessible Chess Game

A web-based chess game built with React and Tailwind CSS that emphasizes accessibility, keyboard navigation, and voice feedback — empowering visually impaired users and promoting inclusive digital gaming.

---

## 🧠 Project Overview

**Accessible Chess Game** is an inclusive and responsive chess application designed for all users, including those with visual or motor impairments. With full keyboard support, real-time voice announcements, and a clean UI, the game aims to provide an equitable digital chess experience.

---

## 🚀 Features

- ✅ **Voice Announcements**  
  Describes selected pieces, board positions, moves, and game state using the Web Speech API.

- 🎮 **Keyboard Navigation**  
  Navigate the board using arrow keys. Select, move, or cancel pieces using intuitive key bindings.

- 🧩 **Simplified Chess Rules**  
  Supports basic legal move validation for pawns, rooks, knights, bishops, queens, and kings.

- ♿ **ARIA & Focus Support**  
  Square descriptions and focus management for screen reader compatibility.

- 📱 **Responsive Design**  
  Built with Tailwind CSS for optimal viewing across desktops, tablets, and phones.

---

## 🎯 Controls

| Key        | Action                                         |
|------------|------------------------------------------------|
| ⬅️/➡️/⬆️/⬇️ | Navigate chessboard                            |
| `Enter` / `Space` | Select or move a piece                   |
| `S`        | Speak description of the current square        |
| `B`        | Speak the current board state                  |
| `T`        | Announce whose turn it is                      |
| `C`        | Confirm a pending move                         |
| `Escape`   | Cancel pending move or clear selection         |

---

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/shijinkumar9/BlindChess.git
cd accessible-chess-game

# Install dependencies
npm install

# Start the development server
npm run dev
