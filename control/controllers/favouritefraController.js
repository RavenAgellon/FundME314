const FavouriteFRA = require('../../entity/FavouriteFRA');
const FRA = require('../../entity/FRA');

class saveFRACon {
  static async saveFRA(req, res) {
    try {
      const doneeIDRaw = req.headers['x-user-id'];
      const doneeID = parseInt(doneeIDRaw);

      if (isNaN(doneeID)) {
        return res.status(400).json({ message: 'Invalid user ID in header: ' + doneeIDRaw });
      }

      const fraID = parseInt(req.params.fraID);

      if (isNaN(fraID)) {
        return res.status(400).json({ message: 'Invalid FRA ID' });
      }

      const fra = await FRA.findOne({ fraID: fraID });
      if (!fra) {
        return res.status(404).json({ message: 'FRA not found' });
      }

      const alreadySaved = await FavouriteFRA.findOne({ doneeID: doneeID, fraID: fraID });
      if (alreadySaved) {
        return res.status(400).json({ message: 'FRA already saved to favourites' });
      }

      const favourite = new FavouriteFRA({
        doneeID: doneeID,
        fraID: fraID,
      });

      await favourite.save();

      res.status(201).json({ message: 'FRA saved to favourites' });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class removeFRACon {
  static async removeFRA(req, res) {
    try {
      const doneeID = parseInt(req.headers['x-user-id']);
      const fraID = parseInt(req.params.fraID);

      await FavouriteFRA.deleteOne({ doneeID: doneeID, fraID: fraID });

      res.json({ message: 'FRA removed from favourites' });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class viewFavouriteFRACon {
  static async viewFavouriteFRA(req, res) {
    try {
      const doneeID = parseInt(req.headers['x-user-id']);

      const favourites = await FavouriteFRA.find({ doneeID: doneeID });

      const fraIDList = favourites.map(function(fav) { return fav.fraID; });

      const fraList = await FRA.find({ fraID: { $in: fraIDList } }).sort({ createdAt: -1 });

      res.json(fraList);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class searchFavouriteFRACon {
  static async searchFavouriteFRA(req, res) {
    try {
      const doneeID = parseInt(req.headers['x-user-id']);
      const searchTerm = req.query.search;

      if (!searchTerm) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const favourites = await FavouriteFRA.find({ doneeID: doneeID });

      const fraIDList = favourites.map(function(fav) { return fav.fraID; });

      const searchCondition = {
        fraID: { $in: fraIDList },
        fraName: { $regex: searchTerm, $options: 'i' },
      };

      const fraList = await FRA.find(searchCondition).sort({ createdAt: -1 });

      res.json(fraList);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class getFavouriteCountsCon {
  static async getFavouriteCounts(req, res) {
    try {
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

      res.json(counts);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

module.exports = {
  saveFRACon,
  removeFRACon,
  viewFavouriteFRACon,
  searchFavouriteFRACon,
  getFavouriteCountsCon,
};