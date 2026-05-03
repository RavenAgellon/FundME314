const FRACategory = require('../../entity/FRACategory');
const FRA = require('../../entity/FRA');

// createFRACategory(catName, fraIDs, description)
async function createFRACategory(req, res) {
  try {
    const { catName, fraIDs, description } = req.body;

    await FRACategory.create({
      catName,
      fraIDs,
      description
    });

    return res.json({ success: true, message: 'Category created successfully' }); // added success message for the frontend to display
  } catch (err) {
    if (err && err.code === 11000) {
      // CHANGES - handle duplicate key error.
      const duplicateField = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'category name';
      const readableField = duplicateField === 'catName' ? 'Category name' : duplicateField;
      return res.status(400).json({
        success: false,
        message: `${readableField} already exists`
      });
    }

    return res.status(400).json({
      success: false,
      message: err && err.message ? err.message : 'Failed to create category'
    });
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

// CHANGES - Added a unsuspendedFRACategory controller function.
async function unsuspendFRACategory(req, res) {
  try {
    const catName = req.params.catName;

    await FRACategory.findOneAndUpdate(
      { catName },
      { suspended: false }
    );

    return res.json(true);
  } catch (err) {
    return res.json(false);
  }
}

// -------------------------------------------------------
// SEARCH FRA CATEGORIES — match name or description
// -------------------------------------------------------
async function searchFRACategory(req, res) {
  try {
    // Step 1: Get the search term from the URL
    // Example URL: /api/fra-category/search?catName=education
    const searchTerm = req.query.catName || '';

    // Step 2: If search term is empty, return all categories
    if (!searchTerm) {
      const allCategories = await FRACategory.find({}).sort({ createdAt: -1 });
      return res.json(allCategories);
    }

    // Step 3: Build the search condition
    // $or means match ANY of these fields
    // $regex means search for the term anywhere in the text
    // $options: 'i' means case insensitive (education = Education = EDUCATION)
    const orConditions = [
      { catName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ];

    const searchCondition = { $or: orConditions };

    // Step 4: Search the database using the condition
    const categoryList = await FRACategory.find(searchCondition).sort({ createdAt: -1 });

    // Step 5: Send the results back to the browser
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
  searchFRACategory,
  unsuspendFRACategory
};