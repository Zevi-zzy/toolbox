
const apiKey = 'sk-api-3pHgon84S-GRvtH6oht_6_aW10VWPRV-S6CI93DklkLCjz4HXefBzpoLA4WUcevC-Q30bVr9wZT7JF2gjOgVzObH-uanzsCfbbrKgVmKuFmOtAmd4Qn7GEw';
const urls = [
  'https://api.minimax.io/v1/text/chatcompletion_v2',
  'https://api.minimax.chat/v1/text/chatcompletion_v2'
];

async function testAPI() {
  for (const url of urls) {
    console.log(`Testing URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat', // 使用一个基础模型测试
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      const data = await response.json();
      console.log(`Response Status: ${response.status}`);
      console.log(`Response Data:`, JSON.stringify(data).substring(0, 200));
    } catch (e) {
      console.error(`Error: ${e.message}`);
    }
    console.log('---');
  }
}

testAPI();
