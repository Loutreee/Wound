import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Wound API écoute sur http://0.0.0.0:${PORT}`);
});
