import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import { parseCsv } from '../utils/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
export const db = new Low(adapter);

export async function initDB () {
  await db.read();
  // db.data.lists = [];
  // await db.write();
  if (!db.data) {
    db.data = {};

    console.log('init db: genres...');
    db.data.genres = (await parseCsv(join(__dirname, '../lab3-data/genres.csv'))).map(v => ({
      id: v.genre_id,
      name: v.title,
      parentId: v.parent
    }));
    // console.log('init db: albums...');
    // db.data.albums = (await parseCsv(join(__dirname, '../lab3-data/raw_albums.csv'))).map(v => ({
    //   id: v.album_id,
    //   name: v.album_title,
    //   image: v.album_image_file,
    //   url: v.album_url,
    //   artist: v.artist_name,
    //   tracks: v.album_tracks
    // }));
    console.log('init db: artists...');
    db.data.artists = (await parseCsv(join(__dirname, '../lab3-data/raw_artists.csv'))).map(v => ({
      id: v.artist_id,
      bio: v.artist_bio,
      name: v.artist_name,
      url: v.artist_url,
      members: v.artist_members,
      location: v.artist_location,
      image: v.artist_image_file
    }));
    console.log('init db: tracks...');
    db.data.tracks = (await parseCsv(join(__dirname, '../lab3-data/raw_tracks.csv'))).map(v => ({
      id: v.track_id,
      album_id: v.album_id,
      album_title: v.album_title,
      artist_id: v.artist_id,
      artist_name: v.artist_name,
      tags: v.tags ? JSON.parse(v.tags.replace(/'/g, '"')) : [],
      track_date_created: v.track_date_created,
      track_date_recorded: v.track_date_recorded,
      track_duration: v.track_duration,
      track_genres: v.track_genres ? JSON.parse(v.track_genres.replace(/'/g, '"')) : [],
      track_number: v.track_number,
      track_title: v.track_title
    }));
    console.log('init db: lists...');
    db.data.lists = [];

    await db.write();
  }
}
