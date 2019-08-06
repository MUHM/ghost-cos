/*
 * @Author: MUHM
 * @Date: 2019-04-30 16:10:23
 * @Last Modified by: MUHM
 * @Last Modified time: 2019-08-06 10:13:03
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
          return resolve(false);
        }
        data.statusCode === 200 ? resolve(true) : resolve(false);
      });
    });
  }

  save(file, targetDir = this.getTargetDir('/')) {
    if (this.config.pathPrefix) {
      targetDir = `/${this.config.pathPrefix}${targetDir}`;
    }
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
            return reject(err);
          }
          resolve(config.baseUrl ? config.baseUrl + key : `//${data.Location}`);
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
    return new Promise((resolve, reject) => {
      this.client.deleteObject(params, err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  read(options) {
    options = options || {};
    options.path = (options.path || '').replace(this.config.baseUrl, '').replace(/\/$|\\$/, '');
    const params = {
      Bucket: this.config.bucket,
      Region: this.config.region,
      Key: options.path,
    };
    return new Promise((resolve, reject) => {
      this.client.getObject(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data.Body);
      })
    })
  }
}

module.exports = TencentCOS;
