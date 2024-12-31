import Papa from 'papaparse';

// Helper function to read CSV files
const readCSV = async (filePath) => {
  const response = await fetch(filePath);
  const csvText = await response.text();
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      }
    });
  });
};

// Create optimized data structures for lookups
const createDataStructures = (games, packages, offers) => {
  // Create hash maps for quick lookups
  const gamesMap = new Map();
  const packagesMap = new Map();
  const offersByGame = new Map();
  const offersByPackage = new Map();
  const gamesByTeam = new Map();

  // Index games
  games.forEach(game => {
    const gameId = parseInt(game.id);
    gamesMap.set(gameId, game);
    
    // Index games by team
    [game.team_home, game.team_away].forEach(team => {
      if (!gamesByTeam.has(team)) {
        gamesByTeam.set(team, new Set());
      }
      gamesByTeam.get(team).add(gameId);
    });
  });

  // Index packages
  packages.forEach(pkg => {
    const packageId = parseInt(pkg.id);
    packagesMap.set(packageId, {
      ...pkg,
      monthlyPrice: parseInt(pkg.monthly_price_cents) / 100,
      yearlyPrice: parseInt(pkg.monthly_price_yearly_subscription_in_cents) / 100
    });
  });

  // Index offers
  offers.forEach(offer => {
    const gameId = parseInt(offer.game_id);
    const packageId = parseInt(offer.streaming_package_id);
    const offerData = {
      gameId,
      packageId,
      live: offer.live === "1",
      highlights: offer.highlights === "1"
    };

    // Index by game
    if (!offersByGame.has(gameId)) {
      offersByGame.set(gameId, new Set());
    }
    offersByGame.get(gameId).add(offerData);

    // Index by package
    if (!offersByPackage.has(packageId)) {
      offersByPackage.set(packageId, new Set());
    }
    offersByPackage.get(packageId).add(offerData);
  });

  return {
    gamesMap,
    packagesMap,
    offersByGame,
    offersByPackage,
    gamesByTeam
  };
};

export const calculatePackageRankings = async (selectedTeams) => {
  // Read data from CSV files
  const [games, packages, offers] = await Promise.all([
    readCSV('/csv/bc_game.csv'),
    readCSV('/csv/bc_streaming_package.csv'),
    readCSV('/csv/bc_streaming_offer.csv')
  ]);

  // Create optimized data structures
  const {
    gamesMap,
    packagesMap,
    offersByGame,
    offersByPackage,
    gamesByTeam
  } = createDataStructures(games, packages, offers);

  // Get all games for selected teams using the inverted index
  const teamGamesIds = new Set();
  selectedTeams.forEach(team => {
    const teamGames = gamesByTeam.get(team.name);
    if (teamGames) {
      teamGames.forEach(gameId => teamGamesIds.add(gameId));
    }
  });

  // Calculate coverage for each package
  const packageStats = Array.from(packagesMap.values()).map(pkg => {
    const packageOffers = offersByPackage.get(pkg.id) || new Set();
    
    // Count games covered by this package
    const coveredGames = new Set();
    const liveGames = new Set();
    const onDemandGames = new Set();

    packageOffers.forEach(offer => {
      if (teamGamesIds.has(offer.gameId)) {
        if (offer.live || offer.highlights) {
          coveredGames.add(offer.gameId);
        }
        if (offer.live) {
          liveGames.add(offer.gameId);
        }
        if (offer.highlights) {
          onDemandGames.add(offer.gameId);
        }
      }
    });

    const coverage = teamGamesIds.size > 0 
      ? (coveredGames.size / teamGamesIds.size) * 100 
      : 0;
    
    return {
      id: pkg.id,
      name: pkg.name,
      monthlyPrice: pkg.monthlyPrice,
      yearlyPrice: pkg.yearlyPrice,
      coverage,
      totalGames: coveredGames.size,
      liveGames: liveGames.size,
      onDemandGames: onDemandGames.size,
      gamesPerEuro: pkg.yearlyPrice > 0 ? coveredGames.size / pkg.yearlyPrice : coveredGames.size,
    };
  });

  // Sort packages by coverage and then by price
  const rankedPackages = packageStats.sort((a, b) => {
    if (b.coverage === a.coverage) {
      return a.yearlyPrice - b.yearlyPrice;
    }
    return b.coverage - a.coverage;
  });

  // Find best combinations for maximum coverage
  const bestCombinations = findBestCombinations(packageStats, teamGamesIds.size, offersByPackage, teamGamesIds);

  return {
    packages: rankedPackages,
    combinations: bestCombinations,
    totalGames: teamGamesIds.size,
  };
};

const findBestCombinations = (packageStats, totalGames, offersByPackage, teamGamesIds) => {
  const combinations = [];
  const maxCombinationSize = 3; // Limit to 3 packages max for performance

  // Try different combination sizes
  for (let size = 1; size <= maxCombinationSize; size++) {
    const combo = findBestCombinationOfSize(packageStats, totalGames, offersByPackage, teamGamesIds, size);
    if (combo) {
      combinations.push(combo);
    }
  }

  return combinations.sort((a, b) => b.coverage - a.coverage);
};

const findBestCombinationOfSize = (packageStats, totalGames, offersByPackage, teamGamesIds, size) => {
  const packages = packageStats.filter(pkg => pkg.coverage > 0);
  let bestCombo = null;
  let bestCoverage = 0;
  let bestPrice = Infinity;

  // Helper function to get combinations
  const getCombinations = (arr, size) => {
    if (size === 1) return arr.map(el => [el]);
    const result = [];
    for (let i = 0; i <= arr.length - size; i++) {
      const first = arr[i];
      const rest = getCombinations(arr.slice(i + 1), size - 1);
      rest.forEach(combo => result.push([first, ...combo]));
    }
    return result;
  };

  const possibleCombos = getCombinations(packages, size);

  possibleCombos.forEach(combo => {
    // Calculate combined coverage using Set operations
    const coveredGames = new Set();
    let totalPrice = 0;

    combo.forEach(pkg => {
      const packageOffers = offersByPackage.get(pkg.id) || new Set();
      packageOffers.forEach(offer => {
        if (teamGamesIds.has(offer.gameId) && (offer.live || offer.highlights)) {
          coveredGames.add(offer.gameId);
        }
      });
      totalPrice += pkg.yearlyPrice;
    });

    const coverage = totalGames > 0 
      ? (coveredGames.size / totalGames) * 100
      : 0;

    if (coverage > bestCoverage || (coverage === bestCoverage && totalPrice < bestPrice)) {
      bestCombo = {
        packages: combo,
        coverage,
        totalPrice,
        coveredGames: coveredGames.size,
      };
      bestCoverage = coverage;
      bestPrice = totalPrice;
    }
  });

  return bestCombo;
};
