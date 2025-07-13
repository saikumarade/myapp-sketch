import React, { useState } from 'react';
import { useGame } from './GameProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Gamepad2, Users2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const GameLobby: React.FC = () => {
  const { gameState, currentUser, isHost, createRoom, joinRoom, startGame, updateUser } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [playerName, setPlayerName] = useState(currentUser?.name || '');
  const { toast } = useToast();

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      updateUser({ name: playerName.trim() });
      createRoom();
    } else {
      toast({
        title: "Name Required",
        description: "Please enter your name before creating a room",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room Code Required",
        description: "Please enter a room code",
        variant: "destructive",
      });
      return;
    }

    if (playerName.trim()) {
      updateUser({ name: playerName.trim() });
      joinRoom(roomCode.trim().toUpperCase());
    } else {
      toast({
        title: "Name Required",
        description: "Please enter your name before joining a room",
        variant: "destructive",
      });
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    toast({
      title: "Room Code Copied",
      description: "Room code copied to clipboard",
    });
  };

  if (gameState.roomCode) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-white/80 backdrop-blur-sm border-0 shadow-floating">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Game Room
            </h2>
            <p className="text-muted-foreground">Share this code with friends</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gradient-primary rounded-lg text-white mb-4">
              <span className="font-mono text-xl font-bold">{gameState.roomCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomCode}
                className="text-white hover:bg-white/20"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Users className="h-4 w-4" />
              <span>{gameState.users.length} player{gameState.users.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-2">
              {gameState.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="font-medium">{user.name}</span>
                    {user.id === currentUser?.id && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{user.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          {isHost && gameState.users.length >= 2 && (
            <Button
              onClick={startGame}
              className="w-full bg-gradient-primary hover:shadow-primary text-white"
              size="lg"
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          )}

          {!isHost && (
            <p className="text-center text-sm text-muted-foreground">
              Waiting for host to start the game...
            </p>
          )}

          {gameState.users.length < 2 && (
            <p className="text-center text-sm text-muted-foreground">
              Need at least 2 players to start
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white/80 backdrop-blur-sm border-0 shadow-floating">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Draw & Guess
          </h1>
          <p className="text-muted-foreground">
            Create or join a room to start playing
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full"
            />
          </div>

          {showJoinForm && (
            <div>
              <label className="block text-sm font-medium mb-2">Room Code</label>
              <Input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full font-mono"
                maxLength={6}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {!showJoinForm ? (
            <>
              <Button
                onClick={handleCreateRoom}
                className="w-full bg-gradient-primary hover:shadow-primary text-white"
                size="lg"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Create New Room
              </Button>
              <Button
                onClick={() => setShowJoinForm(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Users2 className="h-4 w-4 mr-2" />
                Join Existing Room
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleJoinRoom}
                className="w-full bg-gradient-primary hover:shadow-primary text-white"
                size="lg"
              >
                <Users2 className="h-4 w-4 mr-2" />
                Join Room
              </Button>
              <Button
                onClick={() => setShowJoinForm(false)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}; 