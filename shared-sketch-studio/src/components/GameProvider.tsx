import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Game types
export interface GameUser {
  id: string;
  name: string;
  color: string;
  isDrawer: boolean;
  score: number;
  hasGuessed: boolean;
}

export interface GameState {
  roomCode: string;
  status: 'waiting' | 'playing' | 'round-end' | 'game-end';
  currentWord: string;
  revealedLetters: string[];
  timeLeft: number;
  roundNumber: number;
  maxRounds: number;
  users: GameUser[];
  currentDrawer: GameUser | null;
  correctGuesses: string[];
  wrongGuesses: string[];
}

interface GameContextType {
  gameState: GameState;
  currentUser: GameUser | null;
  isHost: boolean;
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  startGame: () => void;
  makeGuess: (guess: string) => void;
  nextRound: () => void;
  endGame: () => void;
  updateUser: (user: Partial<GameUser>) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

// Word list for the game
const WORD_LIST = [
  'CAT', 'DOG', 'HOUSE', 'TREE', 'SUN', 'MOON', 'STAR', 'FLOWER', 'BOOK', 'CAR',
  'BIRD', 'FISH', 'APPLE', 'BANANA', 'PIZZA', 'CAKE', 'COFFEE', 'TEA', 'WATER', 'FIRE',
  'MOUNTAIN', 'OCEAN', 'RIVER', 'BRIDGE', 'ROAD', 'STREET', 'BUILDING', 'SCHOOL', 'HOSPITAL', 'PARK',
  'GARDEN', 'FOREST', 'DESERT', 'SNOW', 'RAIN', 'CLOUD', 'WIND', 'STORM', 'LIGHTNING', 'THUNDER',
  'COMPUTER', 'PHONE', 'TV', 'CAMERA', 'MUSIC', 'DANCE', 'SING', 'PAINT', 'DRAW', 'WRITE',
  'READ', 'STUDY', 'WORK', 'PLAY', 'RUN', 'WALK', 'JUMP', 'SWIM', 'FLY', 'DRIVE',
  'COOK', 'EAT', 'SLEEP', 'WAKE', 'SMILE', 'LAUGH', 'CRY', 'TALK', 'LISTEN', 'WATCH'
];

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    status: 'waiting',
    currentWord: '',
    revealedLetters: [],
    timeLeft: 120, // 2 minutes per round
    roundNumber: 1,
    maxRounds: 5,
    users: [],
    currentDrawer: null,
    correctGuesses: [],
    wrongGuesses: [],
  });

  const [currentUser, setCurrentUser] = useState<GameUser | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const { toast } = useToast();

  // Generate random room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Generate random word
  const getRandomWord = () => {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  };

  // Create a new room
  const createRoom = () => {
    const roomCode = generateRoomCode();
    const user: GameUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      isDrawer: false,
      score: 0,
      hasGuessed: false,
    };

    setCurrentUser(user);
    setIsHost(true);
    setGameState(prev => ({
      ...prev,
      roomCode,
      users: [user],
    }));

    toast({
      title: "Room Created",
      description: `Room code: ${roomCode}`,
    });
  };

  // Join an existing room
  const joinRoom = (roomCode: string) => {
    const user: GameUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      isDrawer: false,
      score: 0,
      hasGuessed: false,
    };

    setCurrentUser(user);
    setIsHost(false);
    setGameState(prev => ({
      ...prev,
      roomCode,
      users: [...prev.users, user],
    }));

    toast({
      title: "Joined Room",
      description: `Successfully joined room ${roomCode}`,
    });
  };

  // Start the game
  const startGame = () => {
    if (gameState.users.length < 2) {
      toast({
        title: "Not Enough Players",
        description: "Need at least 2 players to start",
        variant: "destructive",
      });
      return;
    }

    const randomDrawer = gameState.users[Math.floor(Math.random() * gameState.users.length)];
    const word = getRandomWord();
    
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      currentWord: word,
      revealedLetters: [],
      timeLeft: 120,
      roundNumber: 1,
      currentDrawer: randomDrawer,
      users: prev.users.map(user => ({
        ...user,
        isDrawer: user.id === randomDrawer.id,
        hasGuessed: false,
      })),
      correctGuesses: [],
      wrongGuesses: [],
    }));

    // Start timer
    startTimer();
  };

  // Start the round timer
  const startTimer = () => {
    if (timer) clearInterval(timer);

    const newTimer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(newTimer);
          return {
            ...prev,
            status: 'round-end',
            timeLeft: 0,
          };
        }

        const newTimeLeft = prev.timeLeft - 1;
        const newRevealedLetters = [...prev.revealedLetters];

        // Reveal a letter every 10 seconds
        if (newTimeLeft % 10 === 0 && newTimeLeft > 0) {
          const unrevealedIndices = prev.currentWord
            .split('')
            .map((letter, index) => ({ letter, index }))
            .filter(({ index }) => !newRevealedLetters.includes(index.toString()));
          
          if (unrevealedIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * unrevealedIndices.length);
            newRevealedLetters.push(unrevealedIndices[randomIndex].index.toString());
          }
        }

        return {
          ...prev,
          timeLeft: newTimeLeft,
          revealedLetters: newRevealedLetters,
        };
      });
    }, 1000);

    setTimer(newTimer);
  };

  // Make a guess
  const makeGuess = (guess: string) => {
    if (!currentUser || currentUser.isDrawer || currentUser.hasGuessed) return;

    const upperGuess = guess.toUpperCase();
    
    if (upperGuess === gameState.currentWord) {
      // Correct guess
      const points = Math.max(10, gameState.timeLeft);
      
      setGameState(prev => ({
        ...prev,
        correctGuesses: [...prev.correctGuesses, currentUser.id],
        users: prev.users.map(user => 
          user.id === currentUser.id 
            ? { ...user, score: user.score + points, hasGuessed: true }
            : user
        ),
        status: 'round-end',
      }));

      if (timer) clearInterval(timer);

      toast({
        title: "Correct!",
        description: `${currentUser.name} guessed the word correctly!`,
      });
    } else {
      // Wrong guess
      setGameState(prev => ({
        ...prev,
        wrongGuesses: [...prev.wrongGuesses, upperGuess],
        users: prev.users.map(user => 
          user.id === currentUser.id 
            ? { ...user, hasGuessed: true }
            : user
        ),
      }));

      toast({
        title: "Wrong Guess",
        description: "Try again!",
        variant: "destructive",
      });
    }
  };

  // Move to next round
  const nextRound = () => {
    if (gameState.roundNumber >= gameState.maxRounds) {
      endGame();
      return;
    }

    const availableUsers = gameState.users.filter(user => !user.isDrawer);
    const nextDrawer = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    const word = getRandomWord();

    setGameState(prev => ({
      ...prev,
      status: 'playing',
      currentWord: word,
      revealedLetters: [],
      timeLeft: 120,
      roundNumber: prev.roundNumber + 1,
      currentDrawer: nextDrawer,
      users: prev.users.map(user => ({
        ...user,
        isDrawer: user.id === nextDrawer.id,
        hasGuessed: false,
      })),
      correctGuesses: [],
      wrongGuesses: [],
    }));

    startTimer();
  };

  // End the game
  const endGame = () => {
    if (timer) clearInterval(timer);
    
    setGameState(prev => ({
      ...prev,
      status: 'game-end',
    }));

    toast({
      title: "Game Over",
      description: "The game has ended!",
    });
  };

  // Update user information
  const updateUser = (userUpdate: Partial<GameUser>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...userUpdate };
    setCurrentUser(updatedUser);
    
    setGameState(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ),
    }));
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const value: GameContextType = {
    gameState,
    currentUser,
    isHost,
    createRoom,
    joinRoom,
    startGame,
    makeGuess,
    nextRound,
    endGame,
    updateUser,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 