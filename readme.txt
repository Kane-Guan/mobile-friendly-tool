1. Please install nodejs from nodejs.org
2. RUN `node xml2file.js https://qa-editorial.theknot.com/content/dc-articles-sitemap.xml` to download sitemap and save to as json.
3. RUN `./run.sh 10000 10 ` to start the jobs. The first parameter is total count of urls and the second parameter is how many jobs you want to devide.