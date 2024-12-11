

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    // console.log({file})

    // evaluar el archivo y si cumple las condiciones mandar `true` para que se mande el file en la 
    // propiedad fileInController del Interceptor de '@nestjs/platform-express'

    // if (!file) return callback(new Error('File is empty'), false); 

    const fileExtension = file.mimetype.split('/')[1]
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

    if ( validExtensions.includes( fileExtension ) ) {
        return callback(null, true)
    }

    callback(null, false)

}