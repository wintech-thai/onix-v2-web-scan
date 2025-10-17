#!/usr/bin/env node
/**
 * Decrypt the production URL to see payload structure
 */

import crypto from 'crypto';

const ENCRYPTION_KEY = 'wCCLYnTAlfFk2ccB'; // 16 characters = AES-128
const ENCRYPTION_IV = '2908yrhozH0ppXmA';  // 16 characters

// The encrypted data from test.txt
const urlEncoded = '3xRnel0oJh7B6JUL2kbyWE2izZ0ez%2bPD4SsTVOzmQHzhsDkOK1NKdP%2bmZiCs7mQa3Rmyvh7LvSWoGUrwFL1bav6z9K7uKqLYWckkO5QWmHfUJfAnHh96UyLEuKJiDDRUHkfRxKSU4UYWPiZiUC9EJQvXbJJFzlrvJHQ9zsit%2beDvJkktfpQM%2f0ywtjHa99lNDSlQ4P9UEI5Ps3QuXLZVQPXswD0pCybzQdg84Kn63%2fqIcdG2HtmEpjen0ug9FhD7LE2J%2f9cOEeTf1xnz2w9Jc7TKQaRrc2MmWIoGUJrvc%2fqRe6Ez2ldcCy5206pcrseANqlU%2bs9JA2cS5fuQnKBRe%2bhX9d1%2f5emHz1tfCCxDBEkuboCxE%2fWRsdIpm1pgLKtTtRRxxs8gBF%2bCmKiZTXRFLC5uP6GtBH6tyIvcWsCEq8aN6BMZpXR9wF70vKgMCESjyM3Ipn8lYpz%2by3hRM8h6PH3SPSmD17ZXE0iiXnqfGsRZbz4VViyml3SAs5D53AF2qL0DhIYYAjs8dQg%2f%2bi2C6DanzRHvZoY1K%2bDoWMx4dcgHfqTzGxArvvS56bqaxMKnMUOGWROl1dHaZxcttEgbhaQheNanMUfCbhlLHSa0kGfq76y6XxFrnMSEWtB4rTtE0U6uX0FaakUKGwvddtAn0wsaGaV%2bpVQ6InRFSExGhVASnr2UmsiELb6sfc8Wog2t7CqZWjMJt9003KASGca5cXQTfkfLm9YiJ6R3F%2fX2%2fKgtwM6RNLqNBHhVeng%2fVN3DyuGMpUxE6GTQzGPTV0VpVNJu0i%2fM2lbLkeP%2boQ8e4RWNF2uCmbJ6FZQhX8UgDG4SSUdW%2faChHG%2biYDYGPp0St9QjM8FTTpxWcSAVZkXumF9HwWEFoWT1XWBoew6oQvZerwOP8ZM1u1dYEgsp016vDikrS%2fnLasl1%2fUlkKdOwT8moE%2bJQyjsfriLHoWnY81JqPFbIKtRc%2fclm0iHzBiJtT96Qf5zpJYcH21%2fINQ49qeMllUZPVxEUnEqEUHzR3HQWXP093Yhx8U09ZyMNVw8a8YJ4ebtEWZ4VZrQsM4ugWOEBQzvlRw98SkVDGgq%2fiy2gLATftDULT2gG4TXzOouIlRkrHRm6qtJna96DWuLetVieE3LveADzqD0IotTSVBwwR9724sjWgi6bFYJz%2bglkO3ZbIKG%2f%2b2GI0lWEOTrVtKGqYfBv35sidEoqTgJXDqIDo1rNeTJWB%2bXcZlA%2bxMhMZjab38GcihVUrAG%2bITLtYDysXg9i%2bEp8O2htSjpF8HmaY6x9PvECNp87UC0RftZdgX9Fwu4SH3LwLogvbdS2mH86CeJCteqs%2bNHl5QGS%2fv%2bA3m4FhBD676OQYkXmOQwTAsNm0Qc7UOdUrV%2by%2fzN2%2biz9fcg1HFlRgvXAx8mW%2fb5QcD3m2XcqS1izS6%2bub8PPOlfyRnNAWS%2bOtv6Wip5MntoWnsXIetHBy7iJW20IEXrL19KXrqU3RWMnyMufr25qBQTEyxPHvRAL0dXj9vnaevmVyAwApstfepi%2bLCQiM0VqvnFnJq%2brY%2b6V1Bikhs4%2bPnehJiS6NN7yVjPTW1njD2vD%2fh0QOobDxybvels1T0QM2KGClgofXfUdMCGXypfGht2qNyWdVuTGLWgQfRG5m06pGNixegxNgpgaySgUz4Nyo1gVe4pdfnTsYaRhS0G6qAyDFK71fzQac%2bH6vrkyDePtU1o05Ebryd8K1tjga%2fTLDl2eQ%2fDf%2fyioLqHj6uja%2feAN3Mgn9SIvURS2OwLrCJ0D7bP4Cw2jTLPURAt0Z7mNzcE5kHwACa%2f8PVzVs%2fRvj9N3rb78Hbh4umfwmqaKonDE45qMJo34PyTJsS5NtXOnIShWqpQxZdzgohVJP7xtV6NJsPhVhIbwgcusAqDGe188Hsl4PBrj5x0FWwhJ675e6LyT0430DBjeImSdLqnHaLr8700rmFvOEhWhRT6cVE1ycSNQb6WxjDBS5cKwm7B0PG7Vx0Irp74lXy9dY%2b2ERxgowovA5EGr8vfSnQX36yM%3d';

console.log('=== Decrypting Production Payload ===\n');

try {
  // URL-decode
  const encrypted = decodeURIComponent(urlEncoded);
  console.log('✅ URL-decoded successfully');
  console.log(`Length: ${encrypted.length} characters\n`);
  
  // Decrypt
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc',
    Buffer.from(ENCRYPTION_KEY, 'utf8'),
    Buffer.from(ENCRYPTION_IV, 'utf8')
  );
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  console.log('✅ Decryption successful');
  console.log(`Length: ${decrypted.length} characters\n`);
  
  // Parse JSON
  const payload = JSON.parse(decrypted);
  
  console.log('✅ JSON parsed successfully\n');
  console.log('=== PAYLOAD STRUCTURE ===');
  console.log(JSON.stringify(payload, null, 2));
  
  console.log('\n=== KEY FIELDS ===');
  console.log(`status: ${payload.status}`);
  console.log(`Status (uppercase): ${payload.Status}`);
  console.log(`descriptionThai: ${payload.descriptionThai || '(not found)'}`);
  console.log(`descriptionEng: ${payload.descriptionEng || '(not found)'}`);
  console.log(`scanItem: ${payload.scanItem ? 'present' : '(not found)'}`);
  console.log(`ScanItem: ${payload.ScanItem ? 'present' : '(not found)'}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
