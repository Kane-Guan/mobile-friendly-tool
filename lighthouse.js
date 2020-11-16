const axios = require('axios')
const fs = require('fs');
const lighthouseApi = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const category = 'performance';
const fields = 'lighthouseResult'

const writeFile = (data) => {
  fs.appendFile('./output/lighthouseResult.csv', data, function (err) {
    if (err) throw err;
  });
}

const runTest = async(key, url, strategy) => {
  const data = {
    params:{
      url,
      category,
      key,
      fields,
      strategy
    }
  }
  try{
    const res = await axios.get(lighthouseApi, data);
    if(res.status === 200) {
      //displayValue: show human reading value
      //numericValue: show origin value
      const audits = res.data.lighthouseResult.audits;
      const FCP = audits['first-contentful-paint']['displayValue']
      const TTI = audits['interactive']['displayValue']
      const SI = audits['speed-index']['displayValue']
      const TBT = audits['total-blocking-time']['displayValue'].replace(/,/g,'')
      const LCP = audits['largest-contentful-paint']['displayValue']
      const CLS = audits['cumulative-layout-shift']['displayValue']
      const score = parseInt(res.data.lighthouseResult.categories.performance.score * 100, 10)
      const result = `${FCP},${TTI},${SI},${TBT},${LCP},${CLS},${score}`.replace(/s|ms|\s/g,'')
      console.info(`Run Test: ${url}`);
      console.info(result)
      console.info('success\n')
      return result;
    }
  }catch(error){
    console.error(error);
    console.error('Rerun test\n');
    // runTest(key, url, strategy);
  }
}

const getScore = async(key, url, count, result) => {
  if(count <= 0){
    writeFile(result)
    return;
  }

  const mobileResult = await runTest(key, url, 'mobile');
  const desktopResult = await runTest(key, url, 'desktop');
  result = `${result}${url},${mobileResult},${desktopResult}\n`
  getScore(key, url, count-1, result);
}

const runLighthouseTest = (key, count) => {
  fs.readFile('./input/pagespeedTest_input', (err, data) => {
    const dataArray = data.toString().split("\n")
    for(const line in dataArray){
      let result = '';
      getScore(key, dataArray[line], count, result);
    }
  });
}

const argv = process.argv.slice(2);
const key = argv[1];
const count = argv[0] || 1;
if(key === undefined){
  console.error('Key must be provided!');
  return;
}
runLighthouseTest(key, count);