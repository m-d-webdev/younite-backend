const multer = require("multer");
const path = require('path');




const _IMG_UPLOADER = (img) => {
    return new Promise((resolve, reject) => {

        const img_extension = img.name.substring(img.name.lastIndexOf("."),);
        const new_img_name = `${Date.now()}_${Math.random() * 8600}_${img_extension}`;
        const targetPath = path.join(__dirname, "../uploads/imgs", new_img_name)


        img.mv(targetPath, (err) => {
            if (err) {
                reject(`Failed => ${err.message}`)
            } else {
                resolve(`${process.env.FRONT_END_MEDIA_SOURCE_URL}/imgs/${new_img_name}`)
            }

        })
    })

}
const _REEL_UPLOADER = (reel) => {

    return new Promise((resolve, reject) => {
        const reel_extension = reel.name.substring(reel.name.lastIndexOf("."),);
        const new_reel_name = `${Date.now()}_${Math.random() * 700}_${reel_extension}`;
        const targetPath = path.join(__dirname, "../uploads/reels", new_reel_name)
        reel.mv(targetPath, (err) => {
            if (err) {
                reject(`Failed => ${err.message}`)
            } else {
                resolve(`${process.env.FRONT_END_MEDIA_SOURCE_URL}/reels/${new_reel_name}`)
            }

        })
    })

}
const _MOMENT_VIDEO_UPLOADER = (reel) => {

    return new Promise((resolve, reject) => {
        const reel_extension = reel.name.substring(reel.name.lastIndexOf("."),);
        const new_reel_name = `${Date.now()}_${Math.random() * 700}_${reel_extension}`;
        const targetPath = path.join(__dirname, "../uploads/moments_vedio", new_reel_name)
        reel.mv(targetPath, (err) => {
            if (err) {
                reject(`Failed => ${err.message}`)
            } else {
                resolve(`${process.env.FRONT_END_MEDIA_SOURCE_URL}/moments_vedio/${new_reel_name}`)
            }

        })
    })

}

module.exports = { _IMG_UPLOADER, _REEL_UPLOADER,_MOMENT_VIDEO_UPLOADER }