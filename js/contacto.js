import { db } from "../firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.guardarEncuestaFirestore = async function(respuestas) {

    try {

        const docRef = await addDoc(
            collection(db, "encuestas"),
            {
                respuestas: respuestas,
                fecha: serverTimestamp()
            }
        );

        console.log("Documento guardado:", docRef.id);

        return true;

    } catch (error) {

        console.error("Error al guardar:", error);

        return false;
    }
};