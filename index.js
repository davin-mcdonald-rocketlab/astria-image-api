import { downloadImage } from './downloadImage.js';
import dotenv from 'dotenv';
dotenv.config();

const TUNE_IDS = {
  CyberRealistic: '657379',
  RealisticVision: '690204',
}


const API_URL = `https://api.astria.ai/tunes/${TUNE_IDS.CyberRealistic}/prompts`;
const API_KEY = process.env.ASTRIA_API_KEY;
const headers = { Authorization: `Bearer ${API_KEY}` }

const GENDER = {
  male: 'male, man,',
  female: 'female, woman',
}
  

// const promptText = `realistic digital painting,  astronaut in a garden on a spring day, by martine johanna and simon stalenhag and chie yoshii and casey weldon and wlop, ornate, dynamic, particulate, rich colors, intricate, elegant, highly detailed, harpers bazaar art, fashion magazine, smooth, sharp focus, 8 k, octane rende --mask_prompt face, head --mask_negative clothes, hair --mask_invert --mask_dilate -20 --hires_denoising_strength 0.1`
// const promptText = `realistic digital painting, ${gender} space marine, warhammer 40,000, war hammer 40k, storm bolter, terminator armour, apothecary in terminator armour, battle in the background, ornate, dynamic, particulate, rich colors, intricate, highly detailed, harpers bazaar art, smooth, sharp focus, 8 k, octane rende --mask_prompt face, hair, head --mask_negative clothes --mask_invert --mask_dilate -20 --hires_denoising_strength 0.1`
const promptText = `realistic digital painting, ${GENDER.male} italian, pink hair, ornate, dynamic, particulate, rich colors, intricate, highly detailed, harpers bazaar art, smooth, sharp focus, 8 k, octane rende --mask_prompt face, hair, head --mask_negative clothes --mask_invert --mask_dilate -20 --hires_denoising_strength 0.1`
// const promptText = `realistic digital painting, ${gender} fireman, firefighter, ornate, dynamic, particulate, rich colors, intricate, highly detailed, realistic, hi-res, harpers bazaar art, smooth, sharp focus, 8 k, octane rende --mask_prompt face, hair, head --mask_negative clothes --mask_invert --mask_dilate -20 --hires_denoising_strength 0.1`

const form = new FormData();
form.append('prompt[text]', promptText);
form.append('prompt[num_images]', '1');
form.append('prompt[negative_prompt]', 'clay, text, watermark, padding, cropped, typography');
form.append('prompt[seed]', '');
form.append('prompt[steps]', '50');
form.append('prompt[cfg_scale]', '');
form.append('prompt[controlnet]', 'pose');
form.append('prompt[input_image_url]', 'https://therocketlab.github.io/rktlb-signatures/profile-images/davin-lg.jpg');
// form.append('prompt[input_image_url]', 'https://therocketlab.github.io/rktlb-signatures/profile-images/wren.jpeg');
form.append('prompt[mask_image_url]', '');
form.append('prompt[denoising_strength]', '');
form.append('prompt[controlnet_conditioning_scale]', '');
form.append('prompt[controlnet_txt2img]', 'false');
form.append('prompt[super_resolution]', 'true');
form.append('prompt[inpaint_faces]', 'false');
form.append('prompt[face_correct]', 'true');
form.append('prompt[film_grain]', 'false');
form.append('prompt[face_swap]', 'false');
form.append('prompt[hires_fix]', 'true');
// form.append('prompt[ar]', 1.1);
form.append('prompt[scheduler]', 'dpm++sde_karras');
form.append('prompt[color_grading]', '');
form.append('prompt[use_lpw]', 'true');
form.append('prompt[w]', '512');
form.append('prompt[h]', '768');

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: headers });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();

  // Check if the images are ready
  if (data.images.length > 0) {
    console.log('Images exists', data.images);
    data.images.map( async (image) => {
      const ref = image.split('/').pop();
      await downloadImage(image, `./images/image-${ref}`);
    });
  } else {
    // Wait for a 5 seconds before retrying to avoid spamming the server
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Images are still processing, retrying in 5 seconds...');
    // Check again if the images are ready
    return fetchJson(url);
  }
};

const getImage = async () => {
  console.log('form: ', form)
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: form
    });
    const data = await response.json();

    const jsonURL = data?.url;
    jsonURL && await fetchJson(jsonURL)
    
    console.log('Image saved to', data);
  } catch (error) {
    console.error('Error fetching or saving the image:', error);
  }
};

getImage();