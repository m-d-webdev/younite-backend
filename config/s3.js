import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv"
dotenv.config();


const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET
const s3 = new S3Client({
    credentials: {
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        accessKeyId: AWS_ACCESS_KEY_ID
    },
    region: AWS_REGION
});



export const UPLOAD_FILE_TO_S3 = ({ file, folderName = "" }) => {
    return new Promise(
        async (resolve, reject) => {
            try {
                const fileExt = file.name.substring(file.name.lastIndexOf("."));
                let FileName = `${folderName}/${Date.now()}_${file.md5}${fileExt}`;
                const fileBody = file.data;

                const command = new PutObjectCommand({
                    Bucket: AWS_S3_BUCKET,
                    Key: FileName,
                    Body: fileBody,
                    ContentType: file.mimetype
                });
                const res = await s3.send(command);
                const fileUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${FileName}`;

                resolve(fileUrl)
            } catch (error) {
                reject(error)
            }
        }
    )
};




export const GET_FILE_URL_FROM_S3 = ({ key }) => {
    return new Promise(
        async (resolve, reject) => {
            try {

                const command = new GetObjectCommand({
                    Bucket: AWS_S3_BUCKET,
                    Key: key,
                });
                const url = await getSignedUrl(s2, command, { expiresIn: "3600" })
                resolve(url);
                
            } catch (error) {
                reject(error)
            }
        }
    )
};



