const fs = require('fs');
const letters = ['a', 'b', 'c', 'd', 'e', 'f']

letters.forEach(letter => {

  fs.readFile(`input/${letter}.txt`, (err, data) => {
    const lines = data.toString().split('\n');
    const numberOfLibraries = lines[0].split(' ')[1];
    let daysForScanning = lines[0].split(' ')[2];
    const books = lines[1].split(' ').map((score, index) => ({ id: index, score}))
    let libraries = [];

    for(let i = 0; i < numberOfLibraries; i++) {
      const totalBooks = lines[2*i+2].split(' ')[0];
      const signupDuration = lines[2*i+2].split(' ')[1];
      const shipCapacity = lines[2*i+2].split(' ')[2];
      const bookIds = lines[2*i+3].split(' ');
      bookIds.sort((bookA, bookB) => {
        return books[bookB].score - books[bookA].score
      })
      libraries.push({ id: i, totalBooks, signupDuration, shipCapacity, bookIds });
    }

    let librariesToLoad = [];

    const chooseBestLibrary = (currentBest, _libraries) => {
      let newLibraries = currentBest.booksToShip.length ? [..._libraries].filter(library => library.id !== currentBest.id) : [..._libraries];
      daysForScanning -= currentBest.signupDuration;

      newLibraries.forEach(library => {
        library.bookIds = library.bookIds.filter(id => !currentBest.booksToShip.includes(id))
        library.possibleShipments = Math.min((daysForScanning - library.signupDuration)*library.shipCapacity, library.bookIds.length);
        if(library.possibleShipments < 1) {
          return;
        }
        library.booksToShip = library.bookIds.slice(0, library.possibleShipments);
        let possibleScore = 0;
        if(letter !== 'd' ) {
          library.booksToShip.forEach(id => {
          possibleScore += Number(books[id].score);
        })
        } else {
          possibleScore = library.booksToShip.length;
        }
        library.possibleScore = possibleScore;
      });

      let maxScore = 0;
      let bestLibrary;
      newLibraries.forEach(library => {
        if(library.possibleScore > maxScore) {
          bestLibrary = library;
          maxScore = library.possibleScore;
        }
      });

      return [bestLibrary, newLibraries]
    }

    let bestLibrary = {
      daysForScanning: 0,
      booksToShip: [],
      signupDuration: 0,
    };
    let newLibraries = libraries;
    for(let i = 0; i < libraries.length; i++) {
      const [lib, libs] = chooseBestLibrary(bestLibrary, newLibraries);
      bestLibrary = lib;
      newLibraries = libs;
      librariesToLoad.push(bestLibrary)
    }

    chooseBestLibrary({
      daysForScanning: 0,
      booksToShip: [],
      signupDuration: 0,
    }, libraries);


    let output = [librariesToLoad.length];
    librariesToLoad.forEach(library => {
      const firstLline = `${library.id} ${library.booksToShip.length}`
      const secondLine = library.booksToShip.join(' ');
      output.push(firstLline);
      output.push(secondLine)
    })

    const outputStr = output.join('\n');
    fs.writeFileSync(`output/${letter}.txt`, outputStr);
    console.log(`${letter} saved.`);
  });
});

