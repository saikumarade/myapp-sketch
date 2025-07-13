import React, { useState } from 'react';
import { DrawingCanvas, DrawingStroke } from '@/components/DrawingCanvas';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { CollaborationProvider, useCollaboration } from '@/components/CollaborationProvider';
import { GameProvider, useGame } from '@/components/GameProvider';
import { GameLobby } from '@/components/GameLobby';
import { GameInterface } from '@/components/GameInterface';
import { UserCursors } from '@/components/UserCursors';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wifi, WifiOff, Palette, Users, Zap, Gamepad2 } from 'lucide-react';
import heroImage from '@/assets/hero-drawing.jpg';

const DrawingApp: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser'>('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(5);
  const [showWelcome, setShowWelcome] = useState(true);
  const [gameMode, setGameMode] = useState(false);
  
  const {
    isConnected,
    currentUser,
    connectedUsers,
    sendStroke,
    sendClearCanvas,
  } = useCollaboration();

  const { gameState } = useGame();

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <img 
              src={heroImage} 
              alt="Collaborative Drawing" 
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-floating"
            />
          </div>

          <div className="animate-scale-in">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              Shared Sketch Studio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create amazing drawings together in real-time. Collaborate with friends, 
              colleagues, or classmates on a shared digital canvas.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-toolbar hover:shadow-primary transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Rich Drawing Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple brush sizes, vibrant colors, and eraser tools
                </p>
              </Card>

              <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-toolbar hover:shadow-accent transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-accent w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-time Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  See other users' cursors and drawings appear instantly
                </p>
              </Card>

              <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-toolbar hover:shadow-primary transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant & Responsive</h3>
                <p className="text-sm text-muted-foreground">
                  Smooth drawing with undo/redo and PNG download
                </p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setShowWelcome(false);
                  setGameMode(false);
                }}
                size="lg"
                className="bg-gradient-primary hover:shadow-primary text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Start Drawing Together
              </Button>
              
              <Button
                onClick={() => {
                  setShowWelcome(false);
                  setGameMode(true);
                }}
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 border-2"
              >
                <Gamepad2 className="h-5 w-5 mr-2" />
                Play Draw & Guess
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show game lobby if in game mode and no room code
  if (gameMode && !gameState.roomCode) {
    return <GameLobby />;
  }

  // Show game interface if in game mode and game is active
  if (gameMode && gameState.roomCode && gameState.status !== 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-background">
        <GameInterface />
        
        <div className="p-4 h-[calc(100vh-80px)]">
          <div className="relative h-full max-w-7xl mx-auto">
            <DrawingCanvas
              currentTool={currentTool}
              currentColor={currentColor}
              currentSize={currentSize}
              onStrokeAdded={sendStroke}
              onCanvasCleared={sendClearCanvas}
            />
            
            <UserCursors 
              users={connectedUsers} 
              currentUserId={currentUser?.id}
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <DrawingToolbar
                currentTool={currentTool}
                onToolChange={setCurrentTool}
                currentColor={currentColor}
                onColorChange={setCurrentColor}
                currentSize={currentSize}
                onSizeChange={setCurrentSize}
                connectedUsers={connectedUsers.length}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show regular drawing app
  return (
    <div className="min-h-screen bg-gradient-background">
      <header className="p-4 bg-white/80 backdrop-blur-sm border-b border-toolbar-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Sketch Studio
          </h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setGameMode(true)}
              variant="outline"
              size="sm"
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Play Game
            </Button>
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <div className="flex items-center gap-2 text-success">
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <WifiOff className="h-4 w-4" />
                  <span>Offline Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 h-[calc(100vh-80px)]">
        <div className="relative h-full max-w-7xl mx-auto">
          <DrawingCanvas
            currentTool={currentTool}
            currentColor={currentColor}
            currentSize={currentSize}
            onStrokeAdded={sendStroke}
            onCanvasCleared={sendClearCanvas}
          />
          
          <UserCursors 
            users={connectedUsers} 
            currentUserId={currentUser?.id}
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <DrawingToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              currentColor={currentColor}
              onColorChange={setCurrentColor}
              currentSize={currentSize}
              onSizeChange={setCurrentSize}
              connectedUsers={connectedUsers.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <GameProvider>
      <CollaborationProvider roomId="main-room">
        <DrawingApp />
      </CollaborationProvider>
    </GameProvider>
  );
};

export default Index;
