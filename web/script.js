const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const profileImage = document.getElementById('profileImage');
const userIdInput = document.getElementById('userIdInput');
const messageElement = document.getElementById('message');

const BACKEND_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyM2IwMzljOS00ODQ4LTQ2NmMtYmExNi0xOTVkOTczYTk2YWIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk0MDY0MjcsImV4cCI6MTc1OTQxMDAyN30.Vgou9FP6h8D90xIKGKBpGNEtrgvfIfPHuCVMiIMdWfQ'; // Reemplaza con un token JWT válido para pruebas

function showMessage(msg, isError = false) {
    messageElement.textContent = msg;
    messageElement.className = isError ? 'error' : 'success';
    messageElement.classList.remove('hidden');
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

async function uploadImageToIDriveE2(file, userId) {
    if (!userId || userId !== '23b039c9-4848-466c-ba16-195d973a96ab') {
        showMessage('Por favor, introduce un ID de usuario válido.', true);
        return null;
    }

    try {
        // 1. Obtener la URL pre-firmada del backend
        const response = await fetch(`${BACKEND_URL}/storage/upload-url?type=profile&userId=${userId}&fileType=${file.type}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener la URL pre-firmada: ${errorData.message || response.statusText}`);
        }
        const { uploadURL, key } = await response.json();
        console.log('URL pre-firmada obtenida:', uploadURL);
        console.log('Clave del archivo:', key);

        // 2. Realizar la solicitud PUT directamente a iDrive e2
        const uploadResponse = await fetch(uploadURL, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Error al subir la imagen a iDrive e2: ${uploadResponse.statusText} - ${errorText}`);
        }

        console.log('Imagen subida exitosamente a iDrive e2!');
        showMessage('Imagen subida exitosamente!', false);

        // 3. Notificar al backend que la subida fue exitosa y guardar la 'key' (profileKey)
        await fetch(`${BACKEND_URL}/users/${userId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({ profileKey: key }),
        });
        console.log('profileKey actualizado en la base de datos.');
        showMessage('profileKey actualizado en la base de datos.', false);

        return key;
    } catch (error) {
        console.error('Error en el proceso de subida:', error);
        showMessage(`Error: ${error.message}`, true);
        return null;
    }
}

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        profileImage.src = 'https://via.placeholder.com/150'; // Restablecer a imagen por defecto si no hay archivo
    }
});

uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const userId = userIdInput.value.trim();

    if (!file) {
        showMessage('Por favor, selecciona un archivo.', true);
        return;
    }

    const uploadedKey = await uploadImageToIDriveE2(file, userId);
    if (uploadedKey) {
        // Actualizar la imagen de perfil mostrada
        profileImage.src = `https://share-musician-bucket.mi21.idrivee2-7.com/${uploadedKey}`;
    }
});

// Función para cargar la imagen de perfil actual del usuario al iniciar
async function loadProfileImage() {
    const userId = userIdInput.value.trim();
    if (!userId || userId === 'tu_user_id_aqui') {
        profileImage.src = 'https://via.placeholder.com/150'; // Imagen por defecto
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener datos del usuario: ${response.statusText}`);
        }
        const userData = await response.json();
        if (userData.profileKey) {
            profileImage.src = `https://share-musician-bucket.mi21.idrivee2-7.com/${userData.profileKey}`;
        } else {
            profileImage.src = 'https://via.placeholder.com/150'; // Imagen por defecto si no hay profileKey
        }
    } catch (error) {
        console.error('Error al cargar la imagen de perfil:', error);
        profileImage.src = 'https://via.placeholder.com/150'; // Imagen por defecto en caso de error
    }
}

// Cargar la imagen de perfil al cargar la página y cuando el ID de usuario cambia
document.addEventListener('DOMContentLoaded', loadProfileImage);
userIdInput.addEventListener('change', loadProfileImage);