import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { imageBase64 } = req.body;
  
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing image data' });
      }
  
      const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
      const filename = `generated-${uuidv4()}.png`;
      const filePath = path.join(process.cwd(), 'public', 'images', filename);
  
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, new Uint8Array(buffer));
  
      const imageUrl = `http://139.84.169.221/images/${filename}`;
      return res.status(200).json({ imageUrl });
  
    } catch (err) {
      console.error('Error uploading image:', err);
      // @ts-ignore
      return res.status(500).json({ error: 'Failed to save image', message: err.message });
    }
  }
  