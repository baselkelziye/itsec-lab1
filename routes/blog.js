const express = require('express');

const router = express.Router();

const db = require('../data/database');

var loggedIn = false;

router.get('/', function (req, res) {
  res.redirect('/login');
});

router.get('/login', function (req, res) {
  res.render('login');
});
router.post('/login', async function (req, res) {
  console.log('name ' + req.body.name + 'pw ' + req.body.password);
  const userName = req.body.name;
  const userPassword = req.body.password;

  console.log('user sessoin is :');
  console.log(req.session);

  req.session.user = {
    id: userName,
    password: userPassword,
  };

  const query = `SELECT * FROM authors WHERE name = '${req.body.name}' AND password = '${req.body.password}'`;
  const result = await db.query(query);
  console.log(result);

  req.session.isAuthenticated = true;
  req.session.save(() => {
    if (result[0].length > 0) {
      res.redirect('/posts');
    } else {
      res.redirect('/login');
    }
  });
});

router.get('/new-post', async function (req, res) {
  const [authors] = await db.query('SELECT * FROM authors');
  console.log('in authors');
  console.log(authors);
  res.render('create-post', { authors: authors });
});

router.get('/posts', async function (req, res) {
  const query = `
     SELECT posts.*, authors.name AS author_name from posts
     INNER JOIN authors on posts.author_id = authors.id
    `;
  const [posts] = await db.query(query);

  res.render('posts-list', { posts: posts });
});

router.get('/posts/:id', async function (req, res) {
  const query = `
    SELECT posts.*,authors.name AS author_name, authors.email AS author_email FROM posts
    INNER JOIN authors on posts.author_id = authors.id
    WHERE posts.id = ?
    `;

  const [posts] = await db.query(query, [req.params.id]);
  if (!posts || posts.length === 0) {
    return res.status(404).render('404');
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
  res.render('post-detail', { post: postData });
});
router.post('/posts', async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    'INSERT INTO posts (title, summary,body,author_id) VALUES (?)',
    [data]
  );
  res.redirect('/posts');
});

router.post('/posts/:id/edit', async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ];
  const query = `
  UPDATE blog.posts set title = ?, summary = ?, body = ? WHERE id = ?`;
  var b = await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);
  res.redirect('/posts');
});

router.get('/posts/:id/edit', async function (req, res) {
  const query = `
  SELECT * FROM posts WHERE id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);
  if (!posts || posts.length === 0) {
    return res.status(404).render('404');
  }
  res.render('update-post', { post: posts[0] });
});

router.post('/posts/:id/delete', async function (req, res) {
  const query = `
  DELETE from posts where id = ?;
  `;
  await db.query(query, [req.params.id]);
  res.redirect('/posts');
});
module.exports = router;
