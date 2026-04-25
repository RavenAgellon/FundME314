const FRACategory = require('../../entity/FRACategory');
const FRA = require('../../entity/FRA');

// createFRACategory(catName, fraIDs, description) -> boolean
async function createFRACategory(req, res) {
  try {
    const { catName, fraIDs, description } = req.body;

    await FRACategory.create({
      catName,
      fraIDs,
      description
    });

    return res.json(true);
  } catch (err) {
    return res.json(false);
  }
}

// updateFRACategory -> boolean
async function updateFRACategory(req, res) {
  try {
    const oldCatName = req.params.catName;
    const { catName, fraIDs, description } = req.body;

    await FRACategory.findOneAndUpdate(
      { catName: oldCatName },
      {
        catName,
        fraIDs,
        description
      }
    );

    return res.json(true);
  } catch (err) {
    return res.json(false);
  }
}

// viewFRACategory -> return list of FRAs linked to that category
async function viewFRACategory(req, res) {
  try {
    const catName = req.params.catName;

    const category = await FRACategory.findOne({ catName });
    if (!category) return res.json([]);

    const fraList = await FRA.find({
      fraID: { $in: category.fraIDs }
    });

    return res.json(fraList);
  } catch (err) {
    return res.json([]);
  }
}

// suspendFRACategory -> boolean
async function suspendFRACategory(req, res) {
  try {
    const catName = req.params.catName;

    await FRACategory.findOneAndUpdate(
      { catName },
      { suspended: true }
    );

    return res.json(true);
  } catch (err) {
    return res.json(false);
  }
}

// searchFRACategory -> return category list matching name
async function searchFRACategory(req, res) {
  try {
    const searchName = req.query.catName || '';

    const categoryList = await FRACategory.find({
      catName: { $regex: searchName, $options: 'i' }
    });

    return res.json(categoryList);
  } catch (err) {
    return res.json([]);
  }
}

module.exports = {
  createFRACategory,
  updateFRACategory,
  viewFRACategory,
  suspendFRACategory,
  searchFRACategory
};