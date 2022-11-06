import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { initDB, db } from './database/index.js';
import { body, validationResult } from 'express-validator';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();

app.use(express.static(path.join(dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const router = express.Router();

app.use(router);

router.get('/genres', (req, res) => {
  res.json(db.data.genres);
});

router.get('/artist/:id', (req, res) => {
  let id = Number(req.params.id);
  let r = db.data.artists.find(v => v.id === id);
  r ? res.json(r) : res.status(404).json({ error: 'no result' });
});

router.get('/artists', (req, res) => {
  let n = Number(req.query.n);
  if (n > 100) {
    res.status(400).json({ error: 'n too large! (must <=100)' });
    return;
  }
  let search = req.query.search.toLowerCase();
  let result = [];
  for (let v of db.data.artists) {
    if (result.length >= n) {
      res.json(result);
      return;
    }
    if (v.name.toString().includes(search)) {
      result.push(v.id);
    }
  }

  res.json(result.length > 0 ? result : { error: 'no result' });
});

router.get('/track/:id', (req, res) => {
  let id = Number(req.params.id);
  let r = db.data.tracks.find(v => v.id === id);
  r ? res.json(r) : res.status(404).json({ error: 'no result' });
});

router.get('/tracks', (req, res) => {
  let n = Number(req.query.n);
  if (n > 100) {
    res.status(400).json({ error: 'n too large! (must <=100)' });
    return;
  }
  let search = req.query.search.toLowerCase();
  let result = [];
  for (let v of db.data.tracks) {
    if (result.length >= n) {
      res.json(result);
      return;
    }
    if (v.album_title.toString().includes(search) || v.track_title.toString().includes(search)) {
      result.push(v.id);
    }
  }

  res.json(result.length > 0 ? result : { error: 'no result' });
});

router.post('/list',
  body('name').isString().trim().escape(),
  body('tracks').isArray(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    db.data.lists.push({
      name: req.body.name,
      tracks: req.body.tracks,
      playTime: 0
    });
    await db.write();
    res.json({ error: null });
  });

router.put('/list',
  body('name').isString().trim().escape(),
  body('tracks').isArray(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    let index = db.data.lists.findIndex(v => v.name === req.body.name);
    if (index < 0) {
      res.status(404).json({ error: 'no result' });
      return;
    }
    db.data.lists[index] = {
      ...db.data.lists[index],
      tracks: req.body.tracks
    };
    await db.write();
    res.json({ error: null });
  });

router.delete('/list', async (req, res) => {
  let index = db.data.lists.findIndex(v => v.name === req.query.name);
  if (index < 0) {
    res.status(404).json({ error: 'no result' });
    return;
  }
  db.data.lists.splice(index, 1);
  await db.write();
  res.json({ error: null });
});

router.get('/list', async (req, res) => {
  let index = db.data.lists.findIndex(v => v.name === req.query.name);
  if (index < 0) {
    res.status(404).json({ error: 'no result' });
    return;
  }
  res.json(db.data.lists[index].tracks);
});

router.get('/lists', async (req, res) => {
  res.json(db.data.lists);
});

await initDB();
app.listen(3000, () => {
  console.log(`server started at http://localhost:3000`);
});
