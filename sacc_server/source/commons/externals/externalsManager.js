module.exports = {
  ResourceAPI: require('./api/axios'),
  Mailer: require('./mailer/mailer'),
  Storage: {
    disk: require('./storage/disk/diskStorage'),
  },
}