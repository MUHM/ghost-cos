/*
 * @Author: MUHM
 * @Date: 2019-04-30 16:10:23
 * @Last Modified by: MUHM
 * @Last Modified time: 2019-04-30 21:09:50
 */
'use strict';

const BaseStorage = require('ghost-storage-base');
const COS = require('cos-nodejs-sdk-v5');
const path = require('path');

class TencentCOS extends BaseStorage {
  constructor(config) {
    super()
    const {
      secretId,
      secretKey,
      bucket,
      region,
      baseUrl
    } = config;
    this.client = new COS({ secretId, secretKey });
    this.bucket = bucket;
    this.region = region;
    this.baseUrl = baseUrl;
  }

  exists(filename, targetDir = this.getTargetDir('/')) {
    const filepath = path.join(targetDir || this.getTargetDir(), filename);
    return new Promise((resolve, reject) => {
      this.client.headObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: path.resolve(targetDir, filename)
      }, (err) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  save(file, targetDir = this.getTargetDir('/')) {
    const params = {
      Bucket: this.bucket,
      Region: this.region,
      Key: this.getUniqueFileName(file, targetDir),
      FilePath: file.path,
    };
    return new Promise((resolve, reject) => {
      this.client.sliceUploadFile(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(this.baseUrl + data.Key);
      });
    });
  }

  serve() {
    return (req, res, next) => {
      next();
    }
  }

  delete(filename, targetDir = this.getTargetDir('/')) {
    const params = {
      Bucket: this.bucket,
      Region: this.region,
      Key: path.resolve(targetDir, filename),
    };
    return new Promise((resolve, reject) => {
      this.client.deleteObject(params, err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  read(options) {
    // Not needed
  }
}

module.exports = TencentCOS;