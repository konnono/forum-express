const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const helpers = require('../_helpers')
const fs = require('fs')
const imgur = require('imgur-node-api')

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

let userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        Comment.findAndCountAll({
          where: {
            UserId: req.params.id,
          },
          include: Restaurant,
          raw: true,
          nest: true
        }).then(result => {
          return res.render('profile', {
            user_p: user.toJSON(),
            countComments: result.count,
            comments: result.rows
          })
        })

      })
  },

  editUser: (req, res) => {
    if (Number(helpers.getUser(req).id) !== Number(req.params.id)) {
      req.flash('error_messages', "You can only edit your own record")
      return res.redirect(`/users/${req.user.id}`)
    }

    User.findByPk(req.params.id)
      .then(user => {
        return res.render('editProfile', {
          user: user.toJSON()
        })
      })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    if (Number(helpers.getUser(req).id) !== Number(req.params.id)) {
      req.flash('error_messages', "you can only edit your own record")
      return res.redirect(`/users/${req.user.id}`)
    }


    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              image: file ? img.data.link : user.image,
            })
              .then(user => {
                req.flash('success_messages', 'User updated successfully')
                res.redirect(`/users/${req.params.id}`)
              })
          })
      })
    }
    else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name
          })
            .then(user => {
              req.flash('success_messages', 'User updated successfully')
              res.redirect(`/users/${req.params.id}`)
            })
        })
    }
  }
}


module.exports = userController