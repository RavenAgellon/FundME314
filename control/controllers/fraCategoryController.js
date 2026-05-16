const FRACategory = require('../../entity/FRACategory');
const FRA = require('../../entity/FRA');

class createFRACategoryCon {
  static async createFRACategory(req, res) {
    try {
      const { catName, description } = req.body;

      await FRACategory.create({
        catName,
        description
      });

      return res.json({
        success: true,
        message: 'Category created successfully'
      });
    } catch (err) {
      if (err && err.code === 11000) {
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
}

class updateFRACategoryCon {
  static async updateFRACategory(req, res) {
    try {
      const oldCatName = req.params.catName;
      const { catName, description } = req.body;

      await FRACategory.findOneAndUpdate(
        { catName: oldCatName },
        {
          catName,
          description
        }
      );

      return res.json(true);
    } catch (err) {
      return res.json(false);
    }
  }
}

class viewAllFRACategoryCon {
  static async viewAllFRACategory(req, res) {
    try {
      const categoryList = await FRACategory.find().sort({ catName: 1 });

      return res.json(categoryList);
    } catch (err) {
      return res.json([]);
    }
  }
}

class viewFRACategoryCon {
  static async viewFRACategory(req, res) {
    try {
      const catName = req.params.catName;

      const category = await FRACategory.findOne({ catName });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.json(category);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message,
      });
    }
  }
}

class suspendFRACategoryCon {
  static async suspendFRACategory(req, res) {
    try {
      const catName = req.params.catName;

      const category = await FRACategory.findOne({ catName });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      category.suspended = category.suspended === true ? false : true;

      await category.save();
      const statusMessage = category.suspended ? 'suspended' : 'unsuspended';

      return res.json({
        message: 'Category ' + statusMessage,
        suspended: category.suspended
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Server error',
        error: err.message
      });
    }
  }
}

class searchFRACategoryCon {
  static async searchFRACategory(req, res) {
    try {
      const searchTerm = req.query.catName || '';

      if (!searchTerm) {
        const allCategories = await FRACategory.find({}).sort({ createdAt: -1 });
        return res.json(allCategories);
      }

      const orConditions = [
        { catName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];

      const searchCondition = { $or: orConditions };

      const categoryList = await FRACategory.find(searchCondition).sort({ createdAt: -1 });

      return res.json(categoryList);
    } catch (err) {
      return res.json([]);
    }
  }
}

module.exports = {
  createFRACategoryCon,
  updateFRACategoryCon,
  viewAllFRACategoryCon,
  viewFRACategoryCon,
  suspendFRACategoryCon,
  searchFRACategoryCon
};