import fetch from 'node-fetch';
import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

// This function takes a URL and a file path to save the downloaded image
const downloadImage = async (url, filePath) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  
  // Check if directory exists; if not, create it
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  await pipeline(response.body, fs.createWriteStream(filePath));
};

export { downloadImage };
