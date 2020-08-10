const axios = require('axios')
const parseString = require('xml2js').parseString;
const fs = require('fs');

function xml2File(url){
  axios.get(url).then((resp)=>{
    if(resp.data.length > 0){
      parseString(resp.data, function (err, result) {
        fs.writeFileSync('sitemap.json', JSON.stringify(result.urlset.url));
    });
    }
  });
}


const url = process.argv.slice(2)[0];
xml2File(url);