import app from './app';
const port = process.env.PORT ?? 5678;
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

function shutdown(signal: string) {
    console.log(`Received event: ${signal}`)
    app.close(()=>{
      process.exit()
    })
}
process.on('SIGINT',shutdown)   // CTRL-C
process.on('SIGTERM', shutdown) // docker kill
