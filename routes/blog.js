const express = require('express');

const router = express.Router();

const db = require('../data/database');

// router.get("/", function (req, res) {
//   res.redirect("/posts");
// });

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
  if (result[0].length > 0) {
    req.session.loggedIn = true;
    req.session.username = result[0][0].name;
    res.redirect('/posts');
  } else {
    res.render('login');
  }
});

router.get('/new-post', async function (req, res) {
  const [authors] = await db.query('SELECT * FROM authors');
  console.log('in authors');
  console.log(authors);
  if (req.session.loggedIn)
    res.render('create-post', { authors: authors, name: req.session.username });
  else res.render('login');
});

router.get('/users', async function (req, res) {
  const [authors] = await db.query('SELECT * FROM authors');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(authors));
});

router.get('/posts', async function (req, res) {
  const query = `
     SELECT posts.*, authors.name AS author_name from posts
     INNER JOIN authors on posts.author_id = authors.id
    `;
  const [posts] = await db.query(query);

  if (req.session.loggedIn)
    res.render('posts-list', { posts: posts, name: req.session.username });
  else res.render('login');
});

router.get('/posts/:id', async function (req, res) {
  const query = `
    SELECT posts.*,authors.name AS author_name, authors.email AS author_email FROM posts
    INNER JOIN authors on posts.author_id = authors.id
    WHERE posts.id = ?
    `;

  const [posts] = await db.query(query, [req.params.id]);
  if (req.session.loggedIn) {
    if (!posts || posts.length === 0) {
      return res.status(404).render('404');
    }
  } else res.render('login');

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
  if (req.session.loggedIn)
    res.render('post-detail', { post: postData, name: req.session.username });
  else res.render('login');
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
  if (req.session.loggedIn) res.redirect('/posts');
  else res.render('login');
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
  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);
  if (req.session.loggedIn) res.redirect('/posts');
  else res.render('login');
});

router.get('/posts/:id/edit', async function (req, res) {
  const query = `
  SELECT * FROM posts WHERE id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);
  if (req.session.loggedIn) {
    if (!posts || posts.length === 0) {
      return res.status(404).render('404');
    }
  } else res.render('login');
  if (req.session.loggedIn)
    res.render('update-post', { post: posts[0], name: req.session.username });
  else res.render('login');
});

router.post('/posts/:id/delete', async function (req, res) {
  const query = `
  DELETE from posts where id = ?;
  `;
  await db.query(query, [req.params.id]);
  if (req.session.loggedIn) res.redirect('/posts');
  else res.render('login');
});
module.exports = router;
