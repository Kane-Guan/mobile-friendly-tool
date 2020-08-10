const axios = require('axios')
const fs = require('fs');
const async = require('async');
const api = 'https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run?key=';

const writeFile = (line, url, status) => {
  fs.appendFile('./output/results.csv', line, function (err) {
    if (err) throw err;
    console.log(`${url} validate ${status}`);
  });
}

const issueCombine = (issues) => {
  return issues.map((item) => {
    return item.rule;
  })
}

const checkMobileFriendly = async(url, key, apiKey, done, tryCount=0) => {
  const data = {
    url,
    "requestScreenshot": false,
  }
  console.log(`validate ${url}`);
  try{
    const res = await axios.post(api + apiKey, data);
    if(res.status === 200){
      const completeStatus = res.data.testStatus.status;
      const friendlyliness = res.data.mobileFriendliness;
      const issue = friendlyliness === 'MOBILE_FRIENDLY' ? '-' : issueCombine(res.data.mobileFriendlyIssues);
      const line = `${key},${url},${completeStatus},${friendlyliness},${issue}\n`
      writeFile(line, url, res.status);
      done();
    }
  }catch(error){
    console.log(`${key},${url} validate ${error.response.status},it will resend 5 second later...`);
    // if error, try 5 times
    tryCount++;
    if(tryCount > 5){
      const line = `${key},${url},${error.response.status},${error.response.statusText}\n`
      writeFile(line, url, error.response.status);
    }
    setTimeout(() => {
      checkMobileFriendly(url, key, apiKey, done, tryCount);
    }, 5000);
  }
}

const getContent = (apiKey, start, num=1000) => {
  fs.readFile('./sitemap.json', async(err, data) => {
    var json = JSON.parse(data);
    async.eachOfLimit(json, 2, (item, key, done) => {
      if(key >= start && key < start + num){
        checkMobileFriendly(item.loc[0], key, apiKey, done);
      }else{
        done();
      }
    }, () => {
      console.log(`Job ${start}-${start + num} done`)
    })
  });
}

const argv = process.argv.slice(2);
const apiKey = argv[0];
const start = parseInt(argv[1], 10);
const num = parseInt(argv[2], 10);
getContent(apiKey,start, num);