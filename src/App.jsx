import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import _ from 'lodash';

const NumberRankingGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [currentPair, setCurrentPair] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const K_FACTOR = 32;

  useEffect(() => {
    const initialNumbers = _.range(1, 101).map(num => ({
      value: num,
      elo: 1200,
      matches: 0
    }));
    setNumbers(initialNumbers);
    selectNewPair(initialNumbers);
  }, []);

  const calculateNewElo = (winnerElo, loserElo) => {
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const newWinnerElo = Math.round(winnerElo + K_FACTOR * (1 - expectedScore));
    const newLoserElo = Math.round(loserElo + K_FACTOR * (0 - (1 - expectedScore)));
    return [newWinnerElo, newLoserElo];
  };

  const selectNewPair = (currentNumbers) => {
    const sortedByMatches = _.sortBy(currentNumbers, 'matches');
    const candidatePool = sortedByMatches.slice(0, Math.max(4, sortedByMatches.length / 2));
    
    const pair = _.sampleSize(candidatePool, 2);
    setCurrentPair(pair);
  };

  const handleChoice = (chosenNumber) => {
    const winner = chosenNumber;
    const loser = currentPair.find(n => n.value !== chosenNumber.value);
    
    const [newWinnerElo, newLoserElo] = calculateNewElo(winner.elo, loser.elo);
    
    const updatedNumbers = numbers.map(num => {
      if (num.value === winner.value) {
        return { ...num, elo: newWinnerElo, matches: num.matches + 1 };
      }
      if (num.value === loser.value) {
        return { ...num, elo: newLoserElo, matches: num.matches + 1 };
      }
      return num;
    });

    setMatchHistory([...matchHistory, {
      winner: winner.value,
      loser: loser.value,
      winnerNewElo: newWinnerElo,
      loserNewElo: newLoserElo
    }]);

    setNumbers(updatedNumbers);
    selectNewPair(updatedNumbers);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Number Ranking Game</CardTitle>
          </CardHeader>
          <CardContent>
            {currentPair && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-lg mb-2">Choose the number you prefer:</div>
                <div className="flex gap-4">
                  {currentPair.map((number) => (
                    <button
                      key={number.value}
                      onClick={() => handleChoice(number)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xl"
                    >
                      {number.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {matchHistory.length >= 500 ? 'Current Rankings' : `${500 - matchHistory.length} more matches until rankings are revealed`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matchHistory.length >= 500 ? (
              <div className="space-y-2">
                {_.orderBy(numbers, ['elo'], ['desc']).map((number, index) => (
                  <div key={number.value} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">#{index + 1} Number {number.value}</span>
                    <div className="text-gray-600">
                      <span className="mr-4">Elo: {Math.round(number.elo)}</span>
                      <span>Matches: {number.matches}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600">
                Keep playing to reveal the rankings!
              </div>
            )}
          </CardContent>
        </Card>

        {matchHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matchHistory.slice(-5).reverse().map((match, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    Number {match.winner} (→{match.winnerNewElo}) beat Number {match.loser} (→{match.loserNewElo})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NumberRankingGame;