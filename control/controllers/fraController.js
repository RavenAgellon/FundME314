const FRA = require('../../entity/FRA');

async function createFRA(req, res) {
  try {
    const { fraName, startDate, endDate, targetAmount } = req.body;

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

module.exports = { createFRA };