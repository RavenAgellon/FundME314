const FRA = require('../../entity/FRA');

async function createFRA(req, res) {
  try {
    const { fraName, startDate, endDate, targetAmount, category, description } = req.body;

    if (!fraName || !startDate || !endDate || targetAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'fraName, startDate, endDate, and targetAmount are required'
      });
    }

    const existingFRA = await FRA.findOne({ fraName: fraName.trim() });
    if (existingFRA) {
      return res.status(409).json({
        success: false,
        message: 'FRA already exists with the same name'
      });
    }

    const fra = new FRA({
      fraName: fraName.trim(),
      category,
      description,
      startDate,
      endDate,
      targetAmount
    });

    await fra.save();

    return res.status(201).json({
      success: true,
      message: 'FRA created successfully',
      fra
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}

async function suspendFRA(req, res) {
  try {
    const fraID = Number(req.params.fraID);

    if (Number.isNaN(fraID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FRA ID'
      });
    }

    const fra = await FRA.findOne({ fraID });
    if (!fra) {
      return res.status(404).json({
        success: false,
        message: 'FRA not found'
      });
    }

    fra.suspended = true;
    await fra.save();

    return res.json({
      success: true,
      message: 'FRA suspended successfully',
      fra
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}

async function unsuspendFRA(req, res) {
  try {
    const fraID = Number(req.params.fraID);

    if (Number.isNaN(fraID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FRA ID'
      });
    }

    const fra = await FRA.findOne({ fraID });

    if (!fra) {
      return res.status(404).json({
        success: false,
        message: 'FRA not found'
      });
    }

    fra.suspended = false;
    await fra.save();

    return res.json({
      success: true,
      message: 'FRA unsuspended successfully',
      fra
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}

async function viewFRA(req, res) {
  try {
    const fraList = await FRA.find().sort({ fraID: 1 });

    return res.json({
      success: true,
      fraList
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}

async function updateFRA(req, res) {
  try {
    const fraID = Number(req.params.fraID);

    if (Number.isNaN(fraID)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FRA ID'
      });
    }

    const { fraName, startDate, endDate, targetAmount, suspended, category, description } = req.body;

    const fra = await FRA.findOne({ fraID });
    if (!fra) {
      return res.status(404).json({
        success: false,
        message: 'FRA not found'
      });
    }

    if (fraName !== undefined) {
      const trimmedName = fraName.trim();

      const existingFRA = await FRA.findOne({
        fraName: trimmedName,
        fraID: { $ne: fraID }
      });

      if (existingFRA) {
        return res.status(409).json({
          success: false,
          message: 'Another FRA already exists with the same name'
        });
      }

      fra.fraName = trimmedName;
    }

    if (startDate !== undefined) fra.startDate = startDate;
    if (endDate !== undefined) fra.endDate = endDate;
    if (targetAmount !== undefined) fra.targetAmount = targetAmount;
    if (suspended !== undefined) fra.suspended = suspended;
    if (category !== undefined) fra.category = category; 
    if (description !== undefined) fra.description = description;

    await fra.save();

    return res.json({
      success: true,
      message: 'FRA updated successfully',
      fra
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}

async function searchFRA(req, res) {
  try {
    const { fraName } = req.query;

    if (!fraName || !fraName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'fraName is required'
      });
    }

    const fraList = await FRA.find({
      fraName: { $regex: fraName.trim(), $options: 'i' }
    }).sort({ createdAt: -1 });

    return res.json(fraList);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}
async function searchCompletedFRA(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fraList = await FRA.find({
      endDate: { $lt: today }
    }).sort({ endDate: -1 });

    return res.json(fraList);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}

async function dailyReport(req, res) {
  try {
    const date = Number(req.query.date);
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const start = new Date(year, month - 1, date, 0, 0, 0, 0);
    const end = new Date(year, month - 1, date + 1, 0, 0, 0, 0);

    const total = await FRA.countDocuments({
      createdAt: { $gte: start, $lt: end }
    });

    return res.json(total);
  } catch (err) {
    return res.json(0);
  }
}

async function weeklyReport(req, res) {
  try {
    const date = Number(req.query.date);
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const start = new Date(year, month - 1, date, 0, 0, 0, 0);
    const end = new Date(year, month - 1, date + 7, 0, 0, 0, 0);

    const total = await FRA.countDocuments({
      createdAt: { $gte: start, $lt: end }
    });

    return res.json(total);
  } catch (err) {
    return res.json(0);
  }
}

async function monthlyReport(req, res) {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0, 0);

    const total = await FRA.countDocuments({
      createdAt: { $gte: start, $lt: end }
    });

    return res.json(total);
  } catch (err) {
    return res.json(0);
  }
}

module.exports = {
  createFRA,
  suspendFRA,
  unsuspendFRA,
  viewFRA,
  updateFRA,
  searchFRA,
  searchCompletedFRA,
  dailyReport,
  weeklyReport,
  monthlyReport
};