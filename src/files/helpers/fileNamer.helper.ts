import { randomUUID } from "crypto"; // sustituto a import { v4 as uuid} from 'uuid'; para usar uuids


export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `${randomUUID()}.${fileExtension}`;

    callback(null, fileName)
}