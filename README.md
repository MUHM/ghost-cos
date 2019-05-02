# ghost-tencent-cos
A simple plugin to add Tencent Cloud Object Storage support for a Ghost Blog 2.x.
# Installation
    cd [path/to/ghost]
    npm install --save ghost-tencent-cos
# Create storage module
Create a script named "tencent-cos", content as follow:

    // [path/to/ghost]/core/server/adapters/storage/tencent-cos.js

    module.exports = require('ghost-tencent-cos');

# Configuration
Add a storage block to your config.${GHOST_ENVIRONMENT}.json as below:

    {
      ...
      "storage": {
        "active": "tencent-cos",
        "tencent-cos": {
          "bucket": "{BucketName}-{AppId}",
          "region": "{BucketRegion}",
          "secretId": "{SecretId}",
          "secretKey": "{SecretKey}",
          "baseUrl": "{url}"
        }
      }
    }

# License
Read [LICENSE](https://github.com/MUHM/ghost-tencent-cos/blob/master/LICENSE)