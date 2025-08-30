const ngrok = require('ngrok');

async function startNgrok() {
  try {
    console.log('🚀 Starting ngrok tunnel...');
    
    // Start ngrok tunnel
    const url = await ngrok.connect({
      addr: 3000,
      authtoken: null // Will use free tier
    });
    
    console.log('\n🎉 NGROK TUNNEL SUCCESSFULLY CREATED!');
    console.log('=' .repeat(50));
    console.log(`🌐 Public HTTPS URL: ${url}`);
    console.log('=' .repeat(50));
    console.log('\n📱 You can now access your QR Code Platform from anywhere!');
    console.log('\n🔗 Available endpoints:');
    console.log(`   Main: ${url}/`);
    console.log(`   Health: ${url}/health`);
    console.log(`   API Info: ${url}/api`);
    console.log(`   QR Generator: ${url}/qr-generator`);
    console.log(`   Analytics: ${url}/analytics`);
    console.log('\n💡 Keep this terminal open to maintain the tunnel.');
    console.log('   Press Ctrl+C to stop the tunnel.');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping ngrok tunnel...');
      await ngrok.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting ngrok:', error.message);
    process.exit(1);
  }
}

startNgrok();
