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

export const calculatePackageRankings = async (selectedTeams) => {
  // Read data from CSV files
  const [games, packages, offers] = await Promise.all([
    readCSV('/csv/bc_game.csv'),
    readCSV('/csv/bc_streaming_package.csv'),
    readCSV('/csv/bc_streaming_offer.csv')
  ]);

  // Get all games for selected teams
  const teamGames = games.filter(game => 
    selectedTeams.some(team => 
      game.team_home === team.name || game.team_away === team.name
    )
  );

  // Calculate coverage for each package
  const packageStats = packages.map(pkg => {
    const packageOffers = offers.filter(offer => 
      parseInt(offer.streaming_package_id) === parseInt(pkg.id)
    );

    const coveredGames = teamGames.filter(game =>
      packageOffers.some(offer => 
        parseInt(offer.game_id) === parseInt(game.id) && 
        (offer.live === "1" || offer.highlights === "1")
      )
    );

    const liveGames = teamGames.filter(game =>
      packageOffers.some(offer => 
        parseInt(offer.game_id) === parseInt(game.id) && 
        offer.live === "1"
      )
    );

    const onDemandGames = teamGames.filter(game =>
      packageOffers.some(offer => 
        parseInt(offer.game_id) === parseInt(game.id) && 
        offer.highlights === "1"
      )
    );

    const coverage = teamGames.length > 0 
      ? (coveredGames.length / teamGames.length) * 100 
      : 0;

    const monthlyPrice = parseInt(pkg.monthly_price_cents) / 100;
    const yearlyPrice = parseInt(pkg.monthly_price_yearly_subscription_in_cents) / 100;
    
    return {
      id: parseInt(pkg.id),
      name: pkg.name,
      monthlyPrice,
      yearlyPrice,
      coverage,
      totalGames: coveredGames.length,
      liveGames: liveGames.length,
      onDemandGames: onDemandGames.length,
      gamesPerEuro: yearlyPrice > 0 ? coveredGames.length / yearlyPrice : coveredGames.length,
    };
  });

  // Sort packages by coverage and then by price
  const rankedPackages = packageStats.sort((a, b) => {
    if (b.coverage === a.coverage) {
      return a.yearlyPrice - b.yearlyPrice;
    }
    return b.coverage - a.coverage;
  });

  // Find best combinations for 100% coverage
  const bestCombinations = findBestCombinations(packageStats, teamGames, offers);

  return {
    packages: rankedPackages,
    combinations: bestCombinations,
    totalGames: teamGames.length,
  };
};

const findBestCombinations = (packageStats, teamGames, offers) => {
  const combinations = [];
  const maxCombinationSize = 3; // Limit to 3 packages max for performance

  // Try different combination sizes
  for (let size = 1; size <= maxCombinationSize; size++) {
    const combo = findBestCombinationOfSize(packageStats, teamGames, offers, size);
    if (combo) {
      combinations.push(combo);
    }
  }

  return combinations.sort((a, b) => b.coverage - a.coverage);
};

const findBestCombinationOfSize = (packageStats, teamGames, offers, size) => {
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
    // Calculate combined coverage
    const coveredGames = new Set();
    let totalPrice = 0;

    combo.forEach(pkg => {
      const packageGames = teamGames.filter(game =>
        offers.some(offer =>
          parseInt(offer.streaming_package_id) === pkg.id &&
          parseInt(offer.game_id) === parseInt(game.id) &&
          (offer.live === "1" || offer.highlights === "1")
        )
      );
      packageGames.forEach(game => coveredGames.add(game.id));
      totalPrice += pkg.yearlyPrice;
    });

    const coverage = teamGames.length > 0 
      ? (coveredGames.size / teamGames.length) * 100
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
