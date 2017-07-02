import fs from 'fs';
import nconfg from '~/config/nconf';
import AWS from 'aws-sdk';

export function uploadPicture(picture, fileName) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: nconf.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: nconf.get('AWS_SECRET_ACCESS_KEY'),
    });

    const uploadParams = {
      ACL: 'public-read',
      Bucket: 'offstage',
    };

    const file = picture;
    const fileStream = fs.createReadStream(file);
    fileStream.on('error', function(err) {
      reject(err);
    });

    uploadParams.Body = fileStream;
    uploadParams.Key = fileName;

    s3.upload(uploadParams, (err, data) => {
      if (err) {
        reject(err);
      }
      if (data) {
        resolve(data);
      }
    });
  });
}
