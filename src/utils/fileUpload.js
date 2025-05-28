import { CLOUDINARY_CLOUD_NAME } from '@env';

export const fileUpload = async(file) => {

    if(!file) return null;
    
    const cloudURL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
    const formData = new FormData();
    formData.append('upload_preset','tienda-productos');
    formData.append('file', file);

    try {
        const resp = await fetch(cloudURL, {method: 'POST', body: formData})
        if(!resp.ok) throw new Error('No se pudo subir la imagen');

        const cloudResp = await resp.json();
        return cloudResp.secure_url;

    } catch (error) {
        return null;
    }
}