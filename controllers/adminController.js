'use strict';

exports.getAdminUserManagement = (req, res, next) => {
  res.render("admin/users", {
    path: "/admin/users",
  })
};