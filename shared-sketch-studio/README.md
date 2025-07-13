# Shared Sketch Studio - Multiplayer Drawing Game

A real-time collaborative drawing application with an integrated multiplayer word guessing game. Players can draw together and play "Draw & Guess" where one player draws while others try to guess the word.

## Features

### 🎨 Collaborative Drawing
- Real-time drawing collaboration
- Multiple brush sizes and colors
- Eraser tool
- Undo/redo functionality
- PNG download capability
- Live cursor tracking

### 🎮 Multiplayer Word Guessing Game
- Create or join game rooms with unique codes
- Role-based gameplay (drawer vs guesser)
- Automatic word selection from a curated list
- Progressive letter revelation every 10 seconds
- Score tracking and leaderboards
- Multiple rounds with rotating roles

## Game Rules

1. **Room Creation**: Host creates a room and gets a unique 6-character code
2. **Joining**: Players join using the room code
3. **Gameplay**: 
   - One player is randomly selected as the drawer
   - Drawer sees the word to draw
   - Other players try to guess the word
   - Letters are revealed every 10 seconds as hints
   - Round ends when word is guessed or time runs out
4. **Scoring**: Points awarded based on time remaining when word is guessed
5. **Rounds**: Multiple rounds with different players drawing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shared-sketch-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
   - Local: `http://localhost:8080`
   - Network: `http://your-ip:8080` (for multiplayer)

### Building for Production

```bash
npm run build
```

## How to Play

### Starting a Game
1. Click "Play Draw & Guess" on the welcome screen
2. Enter your name
3. Click "Create New Room" to host or "Join Existing Room" to join
4. Share the room code with friends

### Playing the Game
- **As Drawer**: Draw the word you see on screen
- **As Guesser**: Type your guesses in the input field
- Watch the timer and revealed letters for hints
- Try to guess before time runs out!

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite
- **State Management**: React Context + Hooks
- **Real-time Collaboration**: WebSocket (ready for backend integration)

## Project Structure

```
src/
├── components/
│   ├── GameProvider.tsx      # Game state management
│   ├── GameLobby.tsx         # Room creation/joining UI
│   ├── GameInterface.tsx     # Game UI and controls
│   ├── DrawingCanvas.tsx     # Drawing functionality
│   ├── DrawingToolbar.tsx    # Drawing tools
│   ├── CollaborationProvider.tsx # Real-time collaboration
│   └── ui/                   # shadcn/ui components
├── pages/
│   └── Index.tsx             # Main application page
└── hooks/
    └── use-toast.ts          # Toast notifications
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Future Enhancements

- [ ] Backend WebSocket server for real-time collaboration
- [ ] User authentication and profiles
- [ ] Custom word lists and categories
- [ ] Voice chat integration
- [ ] Mobile app version
- [ ] Tournament mode
- [ ] Custom drawing tools and effects
