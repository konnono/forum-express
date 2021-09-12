const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then(category => {
            return callback({
              categories,
              category: category.toJSON()
            })
          })
      } else {
        return callback({ categories })
      }
    })
  },

  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
      // req.flash('error_messages', 'name didn\'t exist')
      // return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      })
        .then((category) => {
          callback({ status: 'success', message: '' })
          // res.redirect('/admin/categories')
        })
    }
  }
}

module.exports = categoryService