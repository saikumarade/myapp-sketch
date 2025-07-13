import React, { useState } from 'react';
import { useGame } from './GameProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, ArrowRight, RefreshCw } from 'lucide-react';

export const GameInterface: React.FC = () => {
  const { gameState, currentUser, makeGuess, nextRound, endGame } = useGame();
  const [guess, setGuess] = useState('');

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && currentUser && !currentUser.isDrawer && !currentUser.hasGuessed) {
      makeGuess(guess.trim());
      setGuess('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWord = () => {
    return gameState.currentWord
      .split('')
      .map((letter, index) => {
        const isRevealed = gameState.revealedLetters.includes(index.toString());
        return (
          <span
            key={index}
            className={`inline-block w-8 h-8 mx-1 text-center leading-8 font-bold text-lg border-2 rounded ${
              isRevealed
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground text-muted-foreground'
            }`}
          >
            {isRevealed ? letter : '?'}
          </span>
        );
      });
  };

  if (gameState.status === 'waiting') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-floating mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(gameState.timeLeft)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">
                  Round {gameState.roundNumber}/{gameState.maxRounds}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{currentUser?.score || 0} pts</span>
            </div>
          </div>
        </Card>

        {/* Word Display */}
        {gameState.status === 'playing' && (
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-floating mb-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">Guess the Word</h3>
              <div className="flex justify-center mb-4">
                {renderWord()}
              </div>
              
              {currentUser?.isDrawer ? (
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    You are drawing
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Draw: <span className="font-bold text-primary">{gameState.currentWord}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleGuess} className="flex gap-2 max-w-md mx-auto">
                  <Input
                    type="text"
                    placeholder="Enter your guess..."
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    disabled={currentUser?.hasGuessed || false}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!guess.trim() || currentUser?.hasGuessed || false}
                    size="sm"
                  >
                    Guess
                  </Button>
                </form>
              )}
            </div>
          </Card>
        )}

        {/* Wrong Guesses */}
        {gameState.wrongGuesses.length > 0 && (
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-floating mb-4">
            <h4 className="text-sm font-semibold mb-2">Wrong Guesses:</h4>
            <div className="flex flex-wrap gap-2">
              {gameState.wrongGuesses.map((wrongGuess, index) => (
                <Badge key={index} variant="destructive">
                  {wrongGuess}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Round End */}
        {gameState.status === 'round-end' && (
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-floating mb-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Round {gameState.roundNumber} Complete!</h3>
              <p className="text-lg mb-4">
                The word was: <span className="font-bold text-primary">{gameState.currentWord}</span>
              </p>
              
              {gameState.correctGuesses.length > 0 ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Correct guesses:</p>
                  <div className="flex justify-center gap-2">
                    {gameState.users
                      .filter(user => gameState.correctGuesses.includes(user.id))
                      .map(user => (
                        <Badge key={user.id} variant="secondary">
                          {user.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">No one guessed correctly!</p>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={nextRound} className="bg-gradient-primary hover:shadow-primary text-white">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Round
                </Button>
                <Button onClick={endGame} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  End Game
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Game End */}
        {gameState.status === 'game-end' && (
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-floating mb-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Final Scores:</h4>
                <div className="space-y-2">
                  {gameState.users
                    .sort((a, b) => b.score - a.score)
                    .map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{index + 1}.</span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: user.color }}
                          />
                          <span className="font-medium">{user.name}</span>
                          {user.id === currentUser?.id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <span className="font-bold">{user.score} pts</span>
                      </div>
                    ))}
                </div>
              </div>

              <Button onClick={() => window.location.reload()} className="bg-gradient-primary hover:shadow-primary text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 