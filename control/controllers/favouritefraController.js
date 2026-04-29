const FavouriteFRA = require('../../entity/FavouriteFRA');
const FRA = require('../../entity/FRA');

// -------------------------------------------------------
// SAVE FRA TO FAVOURITES
// -------------------------------------------------------
async function saveFRA(req, res) {
  try {
    // Step 1: Get the doneeID from the request header and convert to integer
    const doneeIDRaw = req.headers['x-user-id'];
    const doneeID = parseInt(doneeIDRaw);

    // Check that doneeID is valid
    if (isNaN(doneeID)) {
      return res.status(400).json({ message: 'Invalid user ID in header: ' + doneeIDRaw });
    }

    // Step 2: Get the fraID from the URL and convert to integer
    const fraID = parseInt(req.params.fraID);

    // Step 3: Check that the fraID is a valid number
    if (isNaN(fraID)) {
      return res.status(400).json({ message: 'Invalid FRA ID' });
    }

    // Step 4: Check that the FRA exists
    const fra = await FRA.findOne({ fraID: fraID });
    if (!fra) {
      return res.status(404).json({ message: 'FRA not found' });
    }

    // Step 5: Check if this donee already saved this FRA
    const alreadySaved = await FavouriteFRA.findOne({ doneeID: doneeID, fraID: fraID });
    if (alreadySaved) {
      return res.status(400).json({ message: 'FRA already saved to favourites' });
    }

    // Step 6: Save the favourite
    const favourite = new FavouriteFRA({
      doneeID: doneeID,
      fraID: fraID,
    });

    await favourite.save();

    // Step 7: Send confirmation back to the browser
    res.status(201).json({ message: 'FRA saved to favourites' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// REMOVE FRA FROM FAVOURITES
// -------------------------------------------------------
async function removeFRA(req, res) {
  try {
    // Step 1: Get the doneeID from the request header
    const doneeID = parseInt(req.headers['x-user-id']);

    // Step 2: Get the fraID from the URL
    const fraID = parseInt(req.params.fraID);

    // Step 3: Delete the favourite record
    await FavouriteFRA.deleteOne({ doneeID: doneeID, fraID: fraID });

    // Step 4: Send confirmation back to the browser
    res.json({ message: 'FRA removed from favourites' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// VIEW FAVOURITE FRAs — get all saved FRAs for a donee
// -------------------------------------------------------
async function viewFavouriteFRA(req, res) {
  try {
    // Step 1: Get the doneeID from the request header
    const doneeID = parseInt(req.headers['x-user-id']);

    // Step 2: Find all favourites saved by this donee
    const favourites = await FavouriteFRA.find({ doneeID: doneeID });

    // Step 3: Get the fraID list from the favourites
    const fraIDList = favourites.map(function(fav) { return fav.fraID; });

    // Step 4: Find the full FRA details for each saved fraID
    const fraList = await FRA.find({ fraID: { $in: fraIDList } }).sort({ createdAt: -1 });

    // Step 5: Send the list back to the browser
    res.json(fraList);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// SEARCH FAVOURITE FRAs — search saved FRAs by name
// -------------------------------------------------------
async function searchFavouriteFRA(req, res) {
  try {
    // Step 1: Get the doneeID from the request header
    const doneeID = parseInt(req.headers['x-user-id']);

    // Step 2: Get the search term from the URL
    const searchTerm = req.query.search;

    // Step 3: Make sure a search term was provided
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Step 4: Find all favourites saved by this donee
    const favourites = await FavouriteFRA.find({ doneeID: doneeID });

    // Step 5: Get the fraID list from the favourites
    const fraIDList = favourites.map(function(fav) { return fav.fraID; });

    // Step 6: Search within saved FRAs by name
    const searchCondition = {
      fraID: { $in: fraIDList },
      fraName: { $regex: searchTerm, $options: 'i' },
    };

    const fraList = await FRA.find(searchCondition).sort({ createdAt: -1 });

    // Step 7: Send the results back to the browser
    res.json(fraList);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// VIEW FAVOURITE COUNTS — get how many times each FRA was saved
// -------------------------------------------------------
async function getFavouriteCounts(req, res) {
  try {
    // Step 1: Group favourite records by fraID and count them
    const counts = await FavouriteFRA.aggregate([
      {
        $group: {
          _id: '$fraID',
          savedCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          fraID: '$_id',
          savedCount: 1,
        },
      },
    ]);

    // Step 2: Send the counts back to the browser
    res.json(counts);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  saveFRA,
  removeFRA,
  viewFavouriteFRA,
  searchFavouriteFRA,
  getFavouriteCounts,
};