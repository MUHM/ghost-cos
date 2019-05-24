/*
 * @Author: MUHM
 * @Date: 2019-04-30 16:10:23
 * @Last Modified by: MUHM
 * @Last Modified time: 2019-05-24 16:21:05
 */
'use strict';

const BaseStorage = require('ghost-storage-base');
const COS = require('cos-nodejs-sdk-v5');
const path = require('path');
const fs = require('fs');

class TencentCOS extends BaseStorage {
  constructor(config) {
    super(config)
    this.client = new COS({ SecretId: config.secretId, SecretKey: config.secretKey });
    this.config = config;
  }

  exists(filename, targetDir = this.getTargetDir('/')) {
    return new Promise((resolve) => {
      this.client.headObject({
        Bucket: this.config.bucket,
        Region: this.config.region,
        Key: path.resolve(targetDir, filename),
      }, (err, data) => {
        if (err) {
          resolve(false);
        } else {
          data.statusCode === 200 ? resolve(true) : resolve(false);
        }
      });
    });
  }

  save(file, targetDir = this.getTargetDir('/')) {
    const config = this.config;
    const client = this.client;
    return this.getUniqueFileName(file, targetDir).then(key => {
      const params = {
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Body: fs.createReadStream(file.path)
      };
      return new Promise((resolve, reject) => {
        client.putObject(params, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(config.baseUrl + key);
        });
      });
    }).catch(e => {
      return Promise.reject(e);
    });
  }

  serve() {
    return (req, res, next) => {
      next();
    }
  }

  delete(filename, targetDir = this.getTargetDir('/')) {
    const params = {
      Bucket: this.config.bucket,
      Region: this.config.region,
      Key: path.resolve(targetDir, filename),
    };
    return new Promise((resolve) => {
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
    options = options || {};
    options.path = (options.path || '').replace(this.config.baseUrl,'').replace(/\/$|\\$/, '');
    const params = {
      Bucket: this.config.bucket,
      Region: this.config.region,
      Key: options.path,
    };
    return new Promise((resolve, reject) => {
      this.client.getObject(params, (err, data) => {
        if (err) {
          resolve(false);
        } else {
          resolve(data.Body)
        }
      })
    })
  }
}

module.exports = TencentCOS;