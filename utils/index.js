import fs from 'fs';
import { parse } from 'csv-parse';
import { finished } from 'stream/promises';

export async function parseCsv (path) {
  const records = [];
  const parser = fs.createReadStream(path).pipe(parse({
    cast: true,
    cast_date: true,
    columns: true,
    // to_line: 2
  }));
  parser.on('readable', function () {
    let record;
    while ((record = parser.read()) !== null) {
      records.push(record);
    }
  });
  await finished(parser);

  return records;
}

