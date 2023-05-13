const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open, Database } = require('sqlite');
const { readFile } = require('fs/promises')
const { DB_NAME } = require('./constants')

const createConnection = async () => {
  const db = await open({
    filename: path.join(__dirname, '..', DB_NAME),
    driver: sqlite3.Database
  })

  const initSql = (await readFile(path.join(__dirname, 'db.sql'))).toString();

  await db.exec(initSql);

  return db;
}

/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const addNewPic = (db, filename, userId) => {
  const sql = `INSERT INTO images(filename, user_id) VALUES (:filename, :userId)`;

  return db.run(sql, {
    ':filename': filename,
    ':userId': userId,
  })
}

/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const findExistingPicsByUser = (db, userId) => {
  const sql = `SELECT * FROM images WHERE user_id = :userId AND enabled = 1`;

  return db.all(sql, {
    ':userId': userId,
  })
}

/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const getAllPics = (db) => {
  const sql = `SELECT * FROM images`;

  return db.all(sql, {

  })
}

/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const getAllEnabledPics = (db) => {
  const sql = `SELECT * FROM images WHERE enabled = 1`;

  return db.all(sql, {

  })
}

/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const disablePic = (db, imageId) => {
  const sql = `UPDATE images SET enabled = 0 WHERE id = :imageId`;

  return db.run(sql, {
    ':imageId': imageId,
  })
}



/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const getPicById = (db, id) => {
  const sql = `SELECT * FROM images WHERE id = :imageId`;

  return db.get(sql, {
    ':imageId': id,
  })
}

/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const updatePostedCount = (db, imageId) => {
  const sql = `UPDATE images SET times_posted = times_posted + 1 WHERE id = :imageId`;

  return db.run(sql, {
    ':imageId': imageId,
  })

}

const insertImageHistory = (db, imageId) => {
  const sql = `INSERT INTO image_history(image_id) VALUES (:imageId)`;

  return db.run(sql, {
    ':imageId': imageId,
  })
}

const getXMostRecentBanners = (db, limit) => {
  const sql = `SELECT * FROM image_history ORDER BY time DESC LIMIT :limit`;

  return db.all(sql, {
    ':limit': limit
  })
}


/**
 * @param {Database<sqlite3.Database, sqlite3.Statement>} db 
*/
const getSetting = async (db, property, defaultValue) => {
  const sql = `SELECT * FROM settings WHERE property = :property`;

  const row = await db.get(sql, {
    ':property': property
  });

  if (!row) {
    await setSetting(db, property, defaultValue)
    return defaultValue;
  }

  return JSON.parse(row?.json_value);

}

const setSetting = (db, property, value) => {
  const sql = `INSERT INTO settings (property, json_value)
  VALUES (:property, :json_value)
  ON CONFLICT(property) DO UPDATE SET json_value = :json_value`;

  return db.run(sql, {
    ':property': property,
    ':json_value': JSON.stringify(value),
  })

}

module.exports = {
  createConnection,
  addNewPic,
  findExistingPicsByUser,
  getAllPics,
  getAllEnabledPics,
  disablePic,
  updatePostedCount,
  insertImageHistory,
  getXMostRecentBanners,
  getSetting,
  setSetting,
  getPicById,
};
